function new_wallet() {
    wallets.mnemonic = bip84.generateMnemonic(parseInt(document.getElementById('mnemonic_length').value) * 352 / 33);;
    document.getElementById('mnemonic').value = wallets.mnemonic;
    recover_wallet();
}

/* 
  keyPair - Internal key pair (generated from "my private key k" in "Figure 1-60 Merkle Tree")
  opts.network - Network type
  opts.merkleRoot - Merkle root hash (32-byte Buffer) (i.e., "ABC" in "Figure 1-60 Merkle Tree")
  Returns a key pair generated from private key k+t, used for signing when spending. 
*/
function tweakSigner(keyPair, opts) {
    let privateKey = keyPair?.privateKey;
    if (!privateKey) {
        throw new Error('Private key is required for tweaking signer!');
    }
    if (keyPair.publicKey[0] === 3) {//Convert odd private key to even private key
        privateKey = bitcoinerlabsecp256k1.privateNegate(privateKey);
    }

    let tweakedPrivateKey = bitcoinerlabsecp256k1.privateAdd(
        privateKey,
        tapTweakHash(toXOnly(keyPair.publicKey), opts.merkleRoot || ''),
    );

    if (!tweakedPrivateKey) {
        throw new Error('Invalid tweaked private key!');
    }

    return ECPair.fromPrivateKey(Buffer.Buffer.from(tweakedPrivateKey), {
        network: opts?.network || bitcoin.networks.testnet
    });
}

//Calculate Merkle root t, pubKey is the internal public key, h is the hash of the Merkle tree root
function tapTweakHash(pubKey, merkleRoot) {
    return bitcoin.crypto.taggedHash(
        'TapTweak',
        Buffer.Buffer.concat(merkleRoot ? [pubKey, merkleRoot] : [pubKey]),
    );
}

//Add input: 
async function psbt_addInput(inObj) {
    let txHash = inObj.querySelector('a').innerText.trim();
    let output_index = parseInt(inObj.querySelector('.output_index').innerText.trim());
    let sequence = parseInt(inObj.querySelector('.sequence').innerText.trim(), '16');
    let redeem_script = inObj.dataset.redeem;
    let rawTx = inObj.dataset.uid;
    rawTx = rawTx.length > 20 ? rawTx : '';
    switch (inObj.dataset.type) {
        case '0'://P2PK
        case '1'://P2PKH
            if (rawTx == '') {
                try {
                    let rawHex = await getTxDetail(txHash, isTestNet_bitcoin, true);
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        nonWitnessUtxo: bitcoin.Transaction.fromHex(rawHex).toBuffer()
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('Failed to get raw transaction data:', error);
                }
            } else {//Offline
                psbt.addInput({
                    hash: txHash,
                    index: output_index,
                    sequence: sequence,
                    nonWitnessUtxo: bitcoin.Transaction.fromHex(rawTx).toBuffer()
                });
            }
            break;
        case '2'://P2SH
            if (rawTx == '') {
                try {
                    let rawHex = await getTxDetail(txHash, isTestNet_bitcoin, true);
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        nonWitnessUtxo: bitcoin.Transaction.fromHex(rawHex).toBuffer(),
                        redeemScript: bitcoin.script.fromASM(redeem_script)
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('Failed to get raw transaction data:', error);
                }
            } else {//Offline
                psbt.addInput({
                    hash: txHash,
                    index: output_index,
                    sequence: sequence,
                    nonWitnessUtxo: bitcoin.Transaction.fromHex(rawTx).toBuffer(),
                    redeemScript: bitcoin.script.fromASM(redeem_script)
                });
            }
            break;
        case '3'://P2WPKH
            if (rawTx == '') {
                try {
                    let rawHex = await getTxDetail(txHash, network != bitcoin.networks.bitcoin, true);
                    let prevTx = bitcoin.Transaction.fromHex(rawHex);
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        witnessUtxo: {
                            script: prevTx.outs[output_index].script,
                            value: prevTx.outs[output_index].value
                        }
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('Failed to get raw transaction data:', error);
                }
            } else {//Offline
                let prevTx = bitcoin.Transaction.fromHex(rawTx);
                psbt.addInput({
                    hash: txHash,
                    index: output_index,
                    sequence: sequence,
                    witnessUtxo: {
                        script: prevTx.outs[output_index].script,
                        value: prevTx.outs[output_index].value
                    }
                });
            }
            break;
        case '4'://P2WSH
            if (rawTx == '') {
                try {
                    let rawHex = await getTxDetail(txHash, network != bitcoin.networks.bitcoin, true);
                    let prevTx = bitcoin.Transaction.fromHex(rawHex);
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        witnessUtxo: {
                            script: prevTx.outs[output_index].script,
                            value: prevTx.outs[output_index].value
                        },
                        witnessScript: bitcoin.script.fromASM(redeem_script)
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('Failed to get raw transaction data:', error);
                };
            } else {//Offline
                let prevTx = bitcoin.Transaction.fromHex(rawTx);
                psbt.addInput({
                    hash: txHash,
                    index: output_index,
                    sequence: sequence,
                    witnessUtxo: {
                        script: prevTx.outs[output_index].script,
                        value: prevTx.outs[output_index].value
                    },
                    witnessScript: bitcoin.script.fromASM(redeem_script)
                });
            }
            break;
        case '5'://P2TR
            //Key path:
            if (rawTx == '') {
                try {
                    let rawHex = await getTxDetail(txHash, network != bitcoin.networks.bitcoin, true);
                    let prevTx = bitcoin.Transaction.fromHex(rawHex);
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        witnessUtxo: {
                            script: prevTx.outs[output_index].script,
                            value: prevTx.outs[output_index].value
                        },
                        //                    tapInternalKey: 'Internal public key'//When signing, derive public key from private key, then xOnly(publickey), then update psbt.updateInput(0,{tapInternalKey:xOnly(publickey)})
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('Failed to get raw transaction data:', error);
                };
            } else {//Offline
                let prevTx = bitcoin.Transaction.fromHex(rawTx);
                psbt.addInput({
                    hash: txHash,
                    index: output_index,
                    sequence: sequence,
                    witnessUtxo: {
                        script: prevTx.outs[output_index].script,
                        value: prevTx.outs[output_index].value
                    },
                    //                    tapInternalKey: 'Internal public key'//When signing, derive public key from private key, then xOnly(publickey), then update psbt.updateInput(0,)
                });
            }
            //Script path:
            break;
        default://Bitcoin test address
            alert('Wallet types other than P2PK, P2PKH, P2SH, P2WPKH, P2WSH, and P2TR cannot be processed at this time!');
            return;
    }
    //    console.log(`${txHash}-${output_index}-${sequence}`);
}

//Get UTXOs for an address:
async function getUtxo(address, isTestNetwork) {
/*
For testnet:
https://blockstream.info/testnet/api/address/{address}/utxo
https://sochain.com/api/v2/get_tx_unspent/BTCTEST/{address}
https://api.blockcypher.com/v1/btc/test3/addrs/{address}?unspentOnly=true

For mainnet:
https://api.blockcypher.com/v1/btc/main/addrs/{address}?unspentOnly=true
https://blockstream.info/api/address/{address}/utxo
*/
    isTestNetwork = isTestNetwork || false;
    let url1 = `https://api.blockcypher.com/v1/btc/main/addrs/${address}?unspentOnly=true`;
    if (isTestNetwork) {//Test address
        url1 = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`;
    }
    //To query balance: https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance
    const response = await fetch(url1);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

//Check if a Bitcoin address is valid:
function isValidBitcoinAddress(address, network = network) {
    try {
        // Try to decode the address
        bitcoin.address.toOutputScript(address, network);
        return true; // If successful, address is valid
    } catch (e) {
        return false; // If failed, address is invalid
    }
}

function bs58ec(pri, data) {
    let payload = bs58check.default.decode(pri);
    let key = payload.slice(4);
    let privateKey_ext = bs58check.default.encode(Buffer.Buffer.concat([Buffer.Buffer.from(data, 'hex'), key]));//BIP84 root extended private key
    return privateKey_ext;
}

function recover_wallet() {
    wallets.mnemonic = document.getElementById('mnemonic').value.trim();
    hd_more.seed = document.getElementById('seed').value.trim();
    hd_more.rood_ext_key = document.getElementById('root_privatekey').value.trim();
    let path1 = document.getElementById('path').value.trim();
    const reg_path = /([0-9]+)'\/([01])\/([0-9]+)$/;
    if (!reg_path.test(path1)) {
        alert("钱包路径不对，格式是“i'/0或者1/j”，i,j取值范围[0,2147483647]");
        return;
    }
    //    var rootNode;
    if (hd_more.rood_ext_key != '') {//Recover HD wallet rootNode from root extended private key
        const customNetwork = {
            ...network, // Inherit mainnet configuration. By default, only supports xprv(0x0488ade4), not yprv(0x049d7878) and zprv(0x04b2430c).
            bip32: {
                public: network == bitcoin.networks.bitcoin ? 0x04b24746 : 0x045f18bc, // zpub : version bytes for vprv
                private: network == bitcoin.networks.bitcoin ? 0x04b2430c : 0x045f1cf6, // zprv : version bytes for vpub
            },
        };
        rootNode = bip32.BIP32Factory(bitcoinerlabsecp256k1).fromBase58(hd_more.rood_ext_key, customNetwork);
        let keypath = wallets.path.slice(0, 11);
        let account_pri = rootNode.derivePath(keypath).toBase58();
        let zprv_vprv = network == bitcoin.networks.bitcoin ? '04b2430c' : '045f18bc';
        account_ext_privatekey = bs58ec(account_pri, zprv_vprv);
        hd_more.seed = 'Cannot derive seed from root extended private key';
        document.getElementById('mnemonic').value = 'Cannot derive mnemonic from root extended private key';
    } else if (hd_more.seed != '') {//Recover HD wallet root node rootNode from seed
        let seed = Buffer.Buffer.from(hd_more.seed, 'hex');
        let rootNode = bip32.BIP32Factory(bitcoinerlabsecp256k1).fromSeed(seed, network);
        let keypath = wallets.path.slice(0, 11);
        let account_pri = rootNode.derivePath(keypath).toBase58();
        let zprv_vprv = network == bitcoin.networks.bitcoin ? '04b2430c' : '045f18bc';
        account_ext_privatekey = bs58ec(account_pri, zprv_vprv);

        let root_ext_peivateKey = rootNode.toBase58();//BIP44 root extended private key
        let rootExtendedPrivateKey = bs58ec(root_ext_peivateKey, zprv_vprv);
        document.getElementById('root_privatekey').value = rootExtendedPrivateKey;
        document.getElementById('mnemonic').value = 'Cannot derive mnemonic from seed';
        hd_more.rood_ext_key = rootExtendedPrivateKey;
    } else if (wallets.mnemonic != '') {//Recover HD wallet root node rootNode from mnemonic
        if (!bip39.validateMnemonic(wallets.mnemonic, bitcoin_language)) {
            alert("Invalid mnemonic!");
            return;
        }
        wallets.seed_password = document.getElementById('seed_password').value.trim();
        rootNode = new bip84.fromMnemonic(wallets.mnemonic, wallets.seed_password, isTestNet_bitcoin, null, null, null, bitcoin_language);
        hd_more.seed = rootNode.seed.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        hd_more.rood_ext_key = rootNode.getRootPrivateKey();
        account_ext_privatekey = rootNode.deriveAccount(parseInt(path1.split("'")[0]));
    } else {
        alert("Please enter mnemonic, seed, or root extended private key!");
        return;
    }

    var account = new bip84.fromZPrv(account_ext_privatekey);
    let pri = account.getPrivateKey(parseInt(path1.split('/')[2]), path1.split('/')[1] == '1');
    let pub = account.getPublicKey(parseInt(path1.split('/')[2]), path1.split('/')[1] == '1');
    let addr_p2wpkh = account.getAddress(parseInt(path1.split('/')[2]), path1.split('/')[1]=='1');

    hd_more.accPri = account.getAccountPrivateKey();
    hd_more.accPub = account.getAccountPublicKey();

    //    const network = bitcoin.networks.bitcoin;
    //    const ECPair = ecpair.ECPairFactory(bitcoinerlabsecp256k1);
    const keyPair = ECPair.fromWIF(pri, network);
    //    let compress_publicKey = keyPair.publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    //    const { address: addr_p2pk } = bitcoin.payments.p2pk({ pubkey: keyPair.publicKey, network: network});
    let schnorrPubKey = bitcoinerlabsecp256k1.xOnlyPointFromScalar(keyPair.privateKey);//Generate Schnorr public key
    schnorrPubKey = schnorrPubKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

    const { address: addr_p2pkh } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: network });
    //    const { address: address_p2wpkh } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });
    //const { address: addr_p2sh } = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }) });

    //    const toXOnly = pubKey => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));
    const { address: addr_p2tr } = bitcoin.payments.p2tr({ internalPubkey: Buffer.Buffer.from(toXOnly(keyPair.publicKey)), network: network });

    document.getElementById('seed').value = hd_more.seed;
    document.getElementById('root_privatekey').value = hd_more.rood_ext_key;
    document.getElementById('view_wallet').innerHTML = `
1. Mnemonic: ${wallets.mnemonic}<br>      
2. Password: ${wallets.seed_password}<br>
3. Path: ${wallets.path}<br>
4. Wallet
<table>
  <tr style="line-height: 1.2rem;">
    <td style="text-align: right;  width: 10rem">Private Key (WIF):<br>Compressed Public Key:<br><br>P2TR Address:<br>P2WPKH Address:<br>P2PKH Address:</td>
    <td>${pri}<br>${pub} (ECDSA)<br>${schnorrPubKey} (Schnorr)<br>${addr_p2tr} (Key Path)<br>${addr_p2wpkh}<br>${addr_p2pkh}</td>
  </tr>
</table>`;

    document.getElementById('prompt').style.visibility = 'visible';
    document.getElementById('view_account_pri').removeAttribute('disabled');
    document.getElementById('view_more').innerHTML = '';
} 

function checkEnv() {
    alarm_str = "";
    if (navigator.userAgent.toLowerCase().indexOf('firefox') == -1) {
        alarm_str = "Not using Firefox browser.";
    }

    if (navigator.onLine) {
        alarm_str = alarm_str + "Browser is in 'online' state.";
        //        document.getElementById('sign_cover').style.visibility = 'visible';
    } else {
        //        document.getElementById('sign_cover').style.visibility = 'hidden';
    }
    /*
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var DBOpenRequest = window.indexedDB.open("btceth");
        DBOpenRequest.addEventListener('success',(evt)=>{
            alarm_str = alarm_str + "Browser is not in private mode.";
            document.getElementById('alarm').innerText = 'Warning: ' + alarm_str;
        });
    */
    document.getElementById('alarm').innerText = alarm_str == '' ? '' : ('Warning: ' + alarm_str);
}

async function getTxDetail(txHash, isTestNetwork, isRaw) {
/*
For testnet:
https://api.blockcypher.com/v1/btc/test3/txs/{txid}?includeHex=true
*/
    isTestNetwork = isTestNetwork || false;
    isRaw = isRaw || false;
    let url = '';
    if (isTestNetwork) {
        url = isRaw ? `https://blockstream.info/testnet/api/tx/${txHash}/hex` : `https://api.blockcypher.com/v1/btc/test3/txs/${txHash}`;
    } else {
        url = isRaw ? `https://blockchain.info/rawtx/${txHash}?format=hex` : `https://api.blockcypher.com/v1/btc/main/txs/${txHash}`;
        //url = `https://blockchain.info/rawtx/${txHash}`
        //https://blockchain.info/rawtx/c6e81c4a315d7eed40cb32b2558f4b142d37959f7e8eb3eb5c43fdf2931cca42?format=hex
    }
    const res = await fetch(url);
    if (isRaw) {
        return await res.text();
    } else {
        return await res.json();
    }
}

function storage_data(storage_data) {
    let content = Buffer.Buffer.from(storage_data, 'utf8');
    if (content.length > 80) {
        content = content.slice(0, 80);
        document.getElementById('op_data').value = content.toString('utf8');
    }
    let data = content.toString('utf8');
    let inNode = document.createElement("div");
    inNode.setAttribute('class', 'txOut');
    inNode.innerHTML = `Stored content: <span title='${data}'>${data}</span><br>Amount: <b>0</b> satoshis<br><input type="image" src="images/delete.png" title="Delete"
                style="float: right; padding: 2px;" class="tx_in_delete">`;
    document.getElementById('tx_outs').appendChild(inNode);
    inNode.querySelector('input').addEventListener('click', (ev) => {
        ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
    });
    document.getElementById('tx_he_type').value = 3;
    document.getElementById('tx_he_type').dispatchEvent(new Event('change'));
}

function view_tx(tx_hash) {
    doing.querySelector('p').innerText = 'Please wait, fetching...'
    doing.showModal();
    const reg = new RegExp(`.{1,${70}}`, 'g');
    getTxDetail(tx_hash, network != bitcoin.networks.bitcoin, false).then((ret) => {
        let dialog = document.getElementById('wallet_dialog');
        dialog.querySelector('h3').innerHTML = `Query Transaction: ${tx_hash}`;
        dialog.querySelector('p').innerHTML = `Total amount: ${ret.total} satoshis, Transaction fee: ${ret.fees} satoshis, Date: ${ret.confirmed}`;
        let td1 = '';
        let td2 = '';
        let input_script = '';
        let i = 0;
        ret.inputs = ret.inputs || [];
        ret.inputs.forEach(inp => {
            td1 = td1 + 'Transaction ID:<br>Output Index:<br>Input Script:';
            inp.script = inp.script || '';
            input_script = inp.script.match(reg);
            input_script = input_script || [];
            //            input_script = inp.script ? inp.script.slice(0, 70) : '';
            td2 = td2 + `${inp.prev_hash}<br>${inp.output_index}<br>`;
            //            input_script.forEach(e =>{
            for (let j = 0; j < input_script.length; j++) {
                td2 = td2 + `${input_script[j]}`;
                if (j < (input_script.length - 1)) {
                    td1 = td1 + '<br>';
                    td2 = td2 + '<br>';
                }
            };
            td1 = td1 + '<br>Amount:<br>Sender Address:<br>Address Type:<br>Witness:<br>';
            td2 = td2 + `<br>${inp.output_value}<br>${inp.addresses[0]}<br>${inp.script_type}<br>`;
            let witness = '';
            i = 0;
            inp.witness = inp.witness || [];
            for (i = 0; i < inp.witness.length; i++) {
                witness = witness + `${(inp.witness[i].length / 2).toString(16).padStart(2, '0')}${inp.witness[i]}`;
            }
            if (i > 0) {
                witness = `${i.toString(16).padStart(2, '0')}` + witness;
                let witness_ar = witness.match(reg);
                for (let j = 0; j < witness_ar.length; j++) {
                    td2 = td2 + `${witness_ar[j]}<br>`;
                    td1 = td1 + '<br>';
                }
            }
            td2 = td2 + '<br><br>';
            td1 = td1 + '<br>';
        });
        dialog.querySelector('#tx_hd1').innerHTML = `${ret.inputs.length} inputs`;
        dialog.querySelector('#tx_td1').innerHTML = td1;
        dialog.querySelector('#tx_td2').innerHTML = td2;
        td1 = '';
        td2 = '';
        i = 0;
        ret.outputs = ret.outputs || [];
        ret.outputs.forEach(outp => {
            td1 = td1 + `Recipient Address:<br>Address Type:<br>Amount:<br>Output Script:<br>Output Index:<br><br>`;
            td2 = td2 + `${outp.addresses[0]}<br>${outp.script_type}<br>${outp.value}<br>${outp.script}<br>${i}<br><br>`;
            i++;
        });
        dialog.querySelector('#tx_hd2').innerHTML = `${ret.outputs.length} outputs`;
        dialog.querySelector('#tx_td3').innerHTML = td1;
        dialog.querySelector('#tx_td4').innerHTML = td2;
        doing.close();
        dialog.showModal();
    });
    //    console.log(tx_hash);
}

function calculate_redeem_script(pubKeys) {
    //    let pubKeys_str = document.getElementById('get_multi_address').value.trim().split(',');
    let pubKeys_arr = pubKeys.map(hex => Buffer.Buffer.from(hex, 'hex')).sort((a, b) => a.compare(b));//Must be sorted from small to large
    if (pubKeys_arr.length < 2) { return };
    let signs = parseInt(document.getElementById('signs').value);
    let redeem_script = bitcoin.payments.p2ms({ m: signs, pubkeys: pubKeys_arr, network: network });
    document.getElementById('get_multi_redeem').value = bitcoin.script.toASM(redeem_script.output);
}

/**
 * Calculate Bitcoin address from output script
 * @param {string} scriptPubKeyHex - Output script (hexadecimal)
 * @param {boolean} isMainnet - Is it Bitcoin mainnet?
 * @returns {string} Calculated Bitcoin address
 */
function output2address(scriptPubKeyHex, isMainnet) {
    const scriptPubKey = Buffer.Buffer.from(scriptPubKeyHex, "hex");

    // Set network parameters
    //    isMainnet = isMainnet||true;
    const p2pkhPrefix = isMainnet ? 0x00 : 0x6F;
    const p2shPrefix = isMainnet ? 0x05 : 0xC4;
    const hrp = isMainnet ? "bc" : "tb";  // Human-readable part for Bech32 / Bech32m

    // **P2PKH (1 / m prefix)**
    if (scriptPubKey.length === 25 && scriptPubKey[0] === 0x76 && scriptPubKey[1] === 0xa9) {
        const pubKeyHash = scriptPubKey.slice(3, 23);
        return bs58check.default.encode(Buffer.Buffer.concat([Buffer.Buffer.from([p2pkhPrefix]), pubKeyHash]));
    }

    // **P2SH (3 / 2 prefix)**
    if (scriptPubKey.length === 23 && scriptPubKey[0] === 0xa9) {
        const scriptHash = scriptPubKey.slice(2, 22);
        return bs58check.default.encode(Buffer.Buffer.concat([Buffer.Buffer.from([p2shPrefix]), scriptHash]));
    }

    // **P2WPKH (bc1q / tb1q prefix)**
    if (scriptPubKey.length === 22 && scriptPubKey[0] === 0x00) {
        const decoded = bitcoin.script.decompile(scriptPubKey);
        return bitcoin.address.toBech32(decoded[1],0,hrp);
//        const pubKeyHash = scriptPubKey.slice(2, 22);
//        return bech32.bech32.encode(hrp, bech32.bech32.toWords(pubKeyHash));
    }

    // **P2WSH (bc1q / tb1q prefix): Must be 34 bytes long with prefix `0020`
    if (scriptPubKey.length === 34 && scriptPubKey[0] === 0x00 && scriptPubKey[1] === 0x20) {
        const pubKeyHash = scriptPubKey.slice(2, 34);
        const version = scriptPubKey[0];
        const words = [version, ...bech32.bech32.toWords(pubKeyHash)];
        return bech32.bech32.encode(hrp, words);
    }

    // **P2TR (bc1p / tb1p prefix)**
    if (scriptPubKey.length === 34 && scriptPubKey[0] === 0x51 && scriptPubKey[1] === 0x20) {
        const version = 1;
        const taprootPubKey = scriptPubKey.slice(2, 34); // 32-byte X-only public key
        const words = [version, ...bech32.bech32m.toWords(taprootPubKey)];
        return bech32.bech32m.encode(hrp, words);
    }

    // **OP_RETURN stored data**
    if (scriptPubKey[0] === 0x6a) {
        return Buffer.Buffer.from(scriptPubKeyHex.slice(4), 'hex').toString('utf8');
    }

    throw new Error("Unsupported scriptPubKey format");
}
//output2address("a9142317615750b647f0a84de52dd62748a328d6006087", true);//P2SH address


async function broadcastTransaction(tx_hex) {
    doing.querySelector('p').innerText = 'Please wait, broadcasting...'
    doing.showModal();
    //        const apiUrl = network == bitcoin.networks.bitcoin ? 'https://blockstream.info/api/tx' : 'https://blockstream.info/testnet/api/tx';
    let dis = document.getElementById('dispatch_result');
    dis.innerHTML = '';

    const apiUrl = network == bitcoin.networks.bitcoin ? 'https://blockstream.info/api' : 'https://blockstream.info/testnet/api';
    const blockstream = new axios.Axios({ baseURL: apiUrl });
    blockstream.post('/tx', tx_hex).then(response => {
        if (response.status == 200) {
            document.getElementById('dispatch_tx').setAttribute('disabled', '');
            let url2 = network == bitcoin.networks.bitcoin ? 'https://blockstream.info/' : 'https://blockstream.info/testnet';
            dis.innerHTML = `Transaction broadcast successful!<br>Transaction ID: ${response.data}<br>
            You can check if the transaction is completed in a few minutes at &nbsp;<a href="${url2}" target="_blank">${url2}</a>.`;
        } else {
            dis.innerHTML = `Transaction broadcast failed!<br>Error message: ${response.data}<br>Please check if the network can access the internet, or verify the "Bitcoin Network" selection in the top right corner of the screen.`;
        }
    }).catch(error => {
        dis.innerHTML = `Transaction broadcast failed!<br>${error.response ? error.response.data : error.message}, you can try again later or copy to another website to broadcast.`;
    });
    /*
            const apiUrl = network == bitcoin.networks.bitcoin ? 'https://api.blockcypher.com/v1/btc/main/txs/push' : 'https://api.blockcypher.com/v1/btc/test3/txs/push';
            try {
                const response = await axios.post(apiUrl, hex, {
                    headers: {
                        'Content-Type': 'text/plain', // Set request header
                    },
                });
                document.getElementById('dispatch_tx').setAttribute('disabled', '');
                dis.innerHTML = `Transaction broadcast successful!<br>Transaction ID: ${response.data}<br>You can check if the transaction is completed in a few minutes at https://blockchair.com/zh.`;
            } catch (error) {
                dis.innerHTML = `Transaction broadcast failed!<br>${error.response ? error.response.data : error.message}, you can try again later.`;
            }
    */
    dis.parentNode.style.visibility = 'visible';
    document.getElementById('dispatch_tx').removeAttribute('disabled');
    doing.close();
}

function decToHex(num, len) {//Convert decimal integer num to len-digit hexadecimal little-endian format
    return (num + 2 ** (len * 4)).toString(16).match(/\B../g).reverse().join``;
}

/*The following two functions prevent the page from scrolling to the top when opening a modal dialog*/
let scrollPosition = 0;

function openModal(tips) {
    scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    doing.querySelector('p').innerText = tips
    doing.showModal();
}

function closeModal() {
    doing.close();
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
}

//data: Buffer. Returns a string with length prefixed.
function varuintPre(data) {
    let len = data.length;
    if (len < 253) {
        return len.toString(16).padStart(2, '0') + data.toString('hex');
    } else {
        let tmp = '';
        if (len < 0x10000) {
            tmp = 'fd' + len.toString(16).padStart(4, '0');
        } else if (len < 100000000) {
            tmp = 'fe' + len.toString(16).padStart(8, '0');
        } else {
            tmp = 'ff' + len.toString(16).padStart(16, '0');
        }
        return tmp.replace(/(.{2})/g, "$1 ").split(" ").reverse().join("") + data.toString('hex');
    }
}

/*
  Convert string to Merkle binary tree
  Parameter merkleString - Merkle tree as string.
  Returns Merkle tree represented as array
*/
function string2MerkleTree(merkleString) {
    var merkleTree = [];
    let s = merkleString.trim();
    s = s.slice(1, s.length - 1).trim();
    let index = 0;
    if (s[0] === '{') {//Left side is leaf script
        index = s.indexOf("}");
        merkleTree.push({ output: bitcoin.script.fromASM(s.slice(1, index).trim()) });
        s = s.slice(index + 1).trim().slice(1).trim();//Remove comma and surrounding spaces
        if (s[0] === '{') {//Right side is leaf script
            index = s.indexOf("}");
            merkleTree.push({ output: bitcoin.script.fromASM(s.slice(1, index).trim()) });
        } else {//Right side is binary tree
            merkleTree.push(string2MerkleTree(s));
        }
    } else {//Left side is binary tree
        if (s[s.length - 1] === '}') {//Right side is leaf script
            index = s.lastIndexOf("{");
            merkleTree.push(string2MerkleTree(s.slice(0, index)));
            merkleTree.push({ output: bitcoin.script.fromASM(s.slice(index + 1, s.length - 1).trim()) });
        } else {//Right side is binary tree
            let count = 1;
            let i = 1;
            for (; i < s.length; i++) {
                if (s[i] === ']') {
                    count--;
                } else if (s[i] === '[') {
                    count++;
                }
                if (count == 0) {
                    break;
                }
            }
            merkleTree.push(string2MerkleTree(s.slice(0, i + 1)));
            merkleTree.push(string2MerkleTree(s.slice(i + 1).trim().slice(1).trim()));
        }
    }
    return merkleTree;
}

async function encryptMessage(message, password) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encoder.encode(message)
    );

    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);

    return result;
}

async function decryptMessage(encryptedData, password) {
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const data = encryptedData.slice(28);

    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}

async function hideEncryptedMessageInImage(imageElement, message, password) {
    const encryptedData = await encryptMessage(message, password);

    let msgBits = '';
    for (const byte of encryptedData) {
        msgBits += byte.toString(2).padStart(8, '0');
    }
    console.log(msgBits);
    const msgTotalBits = msgBits.length.toString(2).padStart(32, '0') + msgBits;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (msgTotalBits.length > imageData.data.length * 3 / 4) {
        throw new Error('被隐写的信息太多！');
    }

    encodeMessage(imageData.data, msgTotalBits);
    ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });
}

function encodeMessage(imgPixels, msgBits) {
    let j = 0;
    for (let i = 0; i < msgBits.length; i++) {
        imgPixels[j] = msgBits[i] === '0' ? (imgPixels[j] & 0xfe) : (imgPixels[j] | 1);
        j++;
        if (j % 4 == 3) {
            j++;
        }
    }
}

async function extractEncryptedMessageFromImage(imageElement, password) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    const encryptedData = decodeMessage(imageData.data);

    try {
        const decrypted = await decryptMessage(encryptedData, password);
        return decrypted;
    } catch (error) {
        throw new Error('Decryption failed - wrong password or corrupted data');
    }
}

function decodeMessage(imgPixels) {
    let msgLengthBits = '';
    let j = 0;
    for (let i = 0; i < 32; i++) {
        msgLengthBits += imgPixels[j] & 1 == 1 ? "1" : "0";
        j++;
        if (j % 4 == 3) {
            j++;
        }
    }
    let msgLength = parseInt(msgLengthBits, 2);
    let msgBits = '';
    for (let i = 0; i < msgLength; i++) {
        msgBits += (imgPixels[j] & 1) == 1 ? "1" : "0";
        j++;
        if (j % 4 == 3) {
            j++;
        }
    }
    const encryptedData = new Uint8Array(msgBits.length / 8);
    for (let i = 0; i < msgBits.length; i += 8) {
        encryptedData[i / 8] = parseInt(msgBits.slice(i, i+8), 2);
    }
    return encryptedData;
}
/**
 * 从共享密钥派生AES密钥
 * @param {Buffer} sharedSecret 
 * @returns {Promise<CryptoKey>}
 */
async function deriveAesKey(sharedSecret) {
    // 使用HKDF算法从共享密钥派生AES密钥
    const hkdfKey = await crypto.subtle.importKey(
        'raw',
        sharedSecret,
        { name: 'HKDF' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            salt: new Uint8Array(0),
            info: new Uint8Array(0),
            hash: 'SHA-256'
        },
        hkdfKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * 格式化字节大小
 * @param {number} bytes 
 * @returns {string}
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function openPage() {
    //根据用户上次选择的语言：
    lang = localStorage.getItem('lang');
    if (lang) {
        return;
    } 

    try {
        //根据地理位置：
        let response = await fetch('https://ipapi.co/json/');
        let data = await response.json();
        const countryCode = data.country;
        const langMap = {
            'CN': 'zh',
            'TW': 'zh',
            'US': 'en',
            'GB': 'en',
            // 'FR': 'fr',
            // 'ES': 'es',
            // 'JP': 'ja',
            // 'KR': 'ko',
            // 'SA': 'ar',
            // 'AE': 'ar',
            'AU': 'en',
            // 添加更多国家映射
        };
        lang = langMap[countryCode] || 'en'; // 默认英语
        console.log(lang);
    } catch (err) {
        //根据浏览器的语言：
        let userLang = navigator.language || navigator.userLanguage;
        lang = userLang.split('-')[0].toLowerCase();
    }
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}