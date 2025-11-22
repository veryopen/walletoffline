function new_wallet() {
    wallets.mnemonic = bip84.generateMnemonic(parseInt(document.getElementById('mnemonic_length').value) * 352 / 33);;
    document.getElementById('mnemonic').value = wallets.mnemonic;
    recover_wallet();
}

/*
  keyPair - 内部密钥对（由“图1-60 默克尔树”中的“我的私钥k”产生的）
  opts.network - 网络类型
  opts.merkleRoot - 默克尔根哈希（32字节Buffer）（即“图1-60 默克尔树”中的“ABC”）
  返回由私钥k+t产生的密钥对，在我花钱时用来签名。 
*/
function tweakSigner(keyPair, opts) {
    let privateKey = keyPair?.privateKey;
    if (!privateKey) {
        throw new Error('Private key is required for tweaking signer!');
    }
    if (keyPair.publicKey[0] === 3) {//奇数私钥转化为偶数私钥
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

//计算默克尔根t，pubKey为内部公钥，h就是默克尔树根的哈希
function tapTweakHash(pubKey, merkleRoot) {
    return bitcoin.crypto.taggedHash(
        'TapTweak',
        Buffer.Buffer.concat(merkleRoot ? [pubKey, merkleRoot] : [pubKey]),
    );
}

//添加输入：
async function psbt_addInput(inObj) {
    let txHash = inObj.querySelector('a').innerText.trim();
    let output_index = parseInt(inObj.querySelector('.output_index').innerText.trim());
    let value = parseInt(inObj.querySelector('.value').innerText.trim().replace(/,/g, ''));
    let sequence = parseInt(inObj.querySelector('.sequence').innerText.trim(), '16');
    let address = inObj.querySelector('code').getAttribute('title');
    let redeem_script = inObj.dataset.redeem;//对于P2SH-P2WPKH地址，本变量为公钥。
    let rawTx = inObj.dataset.uid;
    rawTx = rawTx.length > 20 ? rawTx : '';
    switch (inObj.dataset.type) {
        case '0'://P2PK
        case '1'://P2PKH
            if (rawTx == '') {
                try {
                    let rawHex;
                    if (cryptoType == 0) {//比特币
                        rawHex = await getTxDetail(txHash, bitcoin_network != bitcoin.networks.bitcoin, true);
                    } else if (cryptoType == 3) {//狗狗币
                        rawHex = await dogecoin_getTxDetail(txHash, dogecoin_network == dogecoinTestnet, true);
                    } else {//莱特币
                        rawHex = await litecoin_getTxDetail(txHash, litecoin_network == litecoinTestnet, true);
                    }
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        nonWitnessUtxo: bitcoin.Transaction.fromHex(rawHex).toBuffer()
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('获取原始交易数据失败:', error);
                }
            } else {//离线
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
                    let rawHex;
                    if (cryptoType == 0) {//比特币
                        rawHex = await getTxDetail(txHash, bitcoin_network != bitcoin.networks.bitcoin, true);
                    } else if (cryptoType == 3) {//狗狗币
                        rawHex = await dogecoin_getTxDetail(txHash, dogecoin_network == dogecoinTestnet, true);
                    } else {//莱特币
                        rawHex = await litecoin_getTxDetail(txHash, litecoin_network == litecoinTestnet, true);
                    }
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        nonWitnessUtxo: bitcoin.Transaction.fromHex(rawHex).toBuffer(),
                        redeemScript: bitcoin.script.fromASM(redeem_script)
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('获取原始交易数据失败:', error);
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
                    /*                  let rawHex;                    
                                        if (cryptoType == 0) {//比特币
                                            rawHex = await getTxDetail(txHash, bitcoin_network != bitcoin.networks.bitcoin, true);
                                        } else {//莱特币
                                            rawHex = await litecoin_getTxDetail(txHash, litecoin_network == litecoinTestnet, true);
                                        }
                                        let prevTx = bitcoin.Transaction.fromHex(rawHex);
                    */
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        witnessUtxo: {
                            script: bitcoin.address.toOutputScript(address, cryptoType == 0 ? bitcoin_network : litecoin_network),
                            value: value
                            //                            script: prevTx.outs[output_index].script,
                            //                            value: prevTx.outs[output_index].value
                        }
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('获取原始交易数据失败:', error);
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
                    let rawHex;
                    if (cryptoType == 0) {//比特币
                        rawHex = await getTxDetail(txHash, bitcoin_network != bitcoin.networks.bitcoin, true);
                    } else if (cryptoType == 3) {//狗狗币
                        rawHex = await dogecoin_getTxDetail(txHash, dogecoin_network == dogecoinTestnet, true);
                    } else {//莱特币
                        rawHex = await litecoin_getTxDetail(txHash, litecoin_network == litecoinTestnet, true);
                    }
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
                    alert('获取原始交易数据失败:', error);
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
                    let rawHex;
                    if (cryptoType == 0) {//比特币
                        rawHex = await getTxDetail(txHash, bitcoin_network != bitcoin.networks.bitcoin, true);
                    } else {//莱特币
                        rawHex = await litecoin_getTxDetail(txHash, litecoin_network == litecoinTestnet, true);
                    }
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
                    alert('获取原始交易数据失败:', error);
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
            //脚本路径（script path）:

            break;
        case '6'://P2SH-P2WPKH
            const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: Buffer.Buffer.from(redeem_script, 'hex'), network: bitcoin_network });

            // 然后，我们使用 P2WPKH 的输出脚本作为 P2SH 的 redeemScript
            // bitcoinjs-lib 会自动为我们处理这个逻辑
            const p2sh_p2wpkh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: bitcoin_network });
            if (rawTx == '') {
                try {
                    let rawHex;
                    if (cryptoType == 0) {//比特币
                        rawHex = await getTxDetail(txHash, bitcoin_network != bitcoin.networks.bitcoin, true);
                    } else {//莱特币
                        rawHex = await litecoin_getTxDetail(txHash, litecoin_network == litecoinTestnet, true);
                    }
                    let prevTx = bitcoin.Transaction.fromHex(rawHex);
                    psbt.addInput({
                        hash: txHash,
                        index: output_index,
                        sequence: sequence,
                        // 对于隔离见证输入，必须提供 witnessUtxo
                        witnessUtxo: {
                            script: p2sh_p2wpkh.output, //锁定脚本
                            value: prevTx.outs[output_index].value, // UTXO的金额
                        },
                        // 对于 P2SH 包裹的输入，必须提供 redeemScript
                        redeemScript: p2sh_p2wpkh.redeem.output,
                    });
                } catch (error) {
                    canFetchRawTX = false;
                    alert('获取原始交易数据失败:', error);
                };
            } else {//Offline
                let prevTx = bitcoin.Transaction.fromHex(rawTx);
                psbt.addInput({
                    hash: txHash,
                    index: output_index,
                    sequence: sequence,
                    // 对于隔离见证输入，必须提供 witnessUtxo
                    witnessUtxo: {
                        script: p2sh_p2wpkh.output, //锁定脚本
                        value: prevTx.outs[output_index].value, // UTXO的金额
                    },
                    // 对于 P2SH 包裹的输入，必须提供 redeemScript
                    redeemScript: p2sh_p2wpkh.redeem.output,
                });
            }
            break;
        default://比特币测试地址
            alert('非P2PK、P2PKH、P2SH、P2WPKH、P2WSH、P2SH-P2WPKH和P2TR类型的钱包，暂时没法处理！');
            return;
    }
    //    console.log(`${txHash}-${output_index}-${sequence}`);
}

//获取地址的UTXO:
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
    let url = `https://api.blockcypher.com/v1/btc/main/addrs/${address}?unspentOnly=true`;
    if (isTestNetwork) {//测试地址
        url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}?unspentOnly=true`;
    }
    //要查询余额https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance
    let response = await fetch(url);
    let utxos = {};
    if (response.ok) {
        utxos = await response.json();
    }
    let utxos1 = [];
    if (!utxos.txrefs) {
        url = `https://blockstream.info/api/address/${address}/utxo`;
        if (isTestNetwork) {//测试地址
            url = `https://blockstream.info/testnet/api/address/${address}/utxo`;
        }
        response = await fetch(url);
        utxos1 = await response.json();
        utxos.txrefs = [];
    }
    utxos1.forEach(utxo => {
        utxos.txrefs.push({
            tx_hash: utxo.txid,
            tx_output_n: utxo.vout,
            value: utxo.value
        })
    });
    return utxos;
}

//判断比特币地址是否合法：
function isValidAddress(address, network = bitcoin_network) {
    try {
        // 尝试解码地址
        bitcoin.address.toOutputScript(address, network);
        return true; // 如果成功，地址合法
    } catch (e) {
        return false; // 如果失败，地址非法
    }
}

function bs58ec(pri, data) {
    let payload = bs58check.default.decode(pri);
    let key = payload.slice(4);
    let privateKey_ext = bs58check.default.encode(Buffer.Buffer.concat([Buffer.Buffer.from(data, 'hex'), key]));//BIP84的根扩展私钥
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
    if (hd_more.rood_ext_key != '') {//从根扩展私钥恢复HD钱包rootNode
        const customNetwork = {
            ...bitcoin_network, // 继承主网配置。默认只支持xprv(0x0488ade4)，不支持yprv(0x049d7878)和zprv(0x04b2430c)。
            bip32: {
                public: bitcoin_network == bitcoin.networks.bitcoin ? 0x04b24746 : 0x045f18bc, // zpub : vprv的版本字节
                private: bitcoin_network == bitcoin.networks.bitcoin ? 0x04b2430c : 0x045f1cf6, // zprv : vpub的版本字节
            },
        };
        rootNode = bip32.BIP32Factory(bitcoinerlabsecp256k1).fromBase58(hd_more.rood_ext_key, customNetwork);
        let keypath = wallets.path.slice(0, 11);
        let account_pri = rootNode.derivePath(keypath).toBase58();
        let zprv_vprv = bitcoin_network == bitcoin.networks.bitcoin ? '04b2430c' : '045f18bc';
        account_ext_privatekey = bs58ec(account_pri, zprv_vprv);
        hd_more.seed = '从根扩展私钥无法反推出种子';
        document.getElementById('mnemonic').value = '从根扩展私钥无法反推助记词';
    } else if (hd_more.seed != '') {//从种子恢复HD钱包的根节点rootNode
        let seed = Buffer.Buffer.from(hd_more.seed, 'hex');
        let rootNode = bip32.BIP32Factory(bitcoinerlabsecp256k1).fromSeed(seed, bitcoin_network);
        let keypath = wallets.path.slice(0, 11);
        let account_pri = rootNode.derivePath(keypath).toBase58();
        let zprv_vprv = bitcoin_network == bitcoin.networks.bitcoin ? '04b2430c' : '045f18bc';
        account_ext_privatekey = bs58ec(account_pri, zprv_vprv);

        let root_ext_peivateKey = rootNode.toBase58();//BIP44的根扩展私钥
        let rootExtendedPrivateKey = bs58ec(root_ext_peivateKey, zprv_vprv);
        document.getElementById('root_privatekey').value = rootExtendedPrivateKey;
        document.getElementById('mnemonic').value = '从种子无法反推助记词';
        hd_more.rood_ext_key = rootExtendedPrivateKey;
    } else if (wallets.mnemonic != '') {//从助记词恢复HD钱包的根节点rootNode
        if (!bip39.validateMnemonic(wallets.mnemonic, bitcoin_language)) {
            alert("助记词不合法！");
            return;
        }

        if (document.getElementById('purpose').value == '49') {//m/49'/……
            const seed = bip39.mnemonicToSeedSync(wallets.mnemonic, document.getElementById('seed_password').value.trim());
            const root = bip32.BIP32Factory(bitcoinerlabsecp256k1).fromSeed(seed, bitcoin_network);
            const child = root.derivePath(wallets.path);
            const witnessScript = bitcoin.script.compile([
                bitcoin.opcodes.OP_0,
                bitcoin.crypto.hash160(child.publicKey)
            ]);

            const redeemScript = bitcoin.script.compile([
                bitcoin.opcodes.OP_HASH160,
                bitcoin.crypto.hash160(witnessScript),
                bitcoin.opcodes.OP_EQUAL
            ]);

            const p2sh_p2wpkh_Address = bitcoin.address.fromOutputScript(redeemScript, bitcoin_network);
            document.getElementById('seed').value = seed.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            document.getElementById('root_privatekey').value = root.toBase58();
            document.getElementById('view_wallet').innerHTML = `
            1. 助记词：${wallets.mnemonic}<br>      
            2. 密码：${document.getElementById('seed_password').value.trim()}<br>
            3. 路径：${wallets.path}<br>
            4. 钱包
            <table>
              <tr style="line-height: 1.2rem;">
                <td style="text-align: right;  width: 140px">私钥(WIF)：<br>压缩公钥：<br>P2SH-P2WPKH地址：<br>见证脚本：<br>赎回脚本：</td>
                <td>${child.toWIF()}<br>${child.publicKey.toString('hex')}<br>${p2sh_p2wpkh_Address}<br>${witnessScript.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}<br>${redeemScript.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')}</td>
              </tr>
            </table>`;
            return;
        }
        wallets.seed_password = document.getElementById('seed_password').value.trim();
        rootNode = new bip84.fromMnemonic(wallets.mnemonic, wallets.seed_password, bitcoin_isTestNet, null, null, null, bitcoin_language);
        hd_more.seed = rootNode.seed.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
        hd_more.rood_ext_key = rootNode.getRootPrivateKey();
        account_ext_privatekey = rootNode.deriveAccount(parseInt(path1.split("'")[0]));
    } else {
        alert("请输入助记词、种子或者根扩展私钥！");
        return;
    }

    var account = new bip84.fromZPrv(account_ext_privatekey);
    let pri = account.getPrivateKey(parseInt(path1.split('/')[2]), path1.split('/')[1] == '1');
    let pub = account.getPublicKey(parseInt(path1.split('/')[2]), path1.split('/')[1] == '1');
    let addr_p2wpkh = account.getAddress(parseInt(path1.split('/')[2]), path1.split('/')[1] == '1');

    hd_more.accPri = account.getAccountPrivateKey();
    hd_more.accPub = account.getAccountPublicKey();

    //    const network = bitcoin.networks.bitcoin;
    //    const ECPair = ecpair.ECPairFactory(bitcoinerlabsecp256k1);
    const keyPair = ECPair.fromWIF(pri, bitcoin_network);
    //    let compress_publicKey = keyPair.publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    //    const { address: addr_p2pk } = bitcoin.payments.p2pk({ pubkey: keyPair.publicKey, network: bitcoin_network});
    let schnorrPubKey = bitcoinerlabsecp256k1.xOnlyPointFromScalar(keyPair.privateKey);//产生Schnorr 公钥
    schnorrPubKey = schnorrPubKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

    const { address: addr_p2pkh } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin_network });
    //    const { address: address_p2wpkh } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });
    //const { address: addr_p2sh } = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }) });

    //    const toXOnly = pubKey => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));
    const { address: addr_p2tr } = bitcoin.payments.p2tr({ internalPubkey: Buffer.Buffer.from(toXOnly(keyPair.publicKey)), network: bitcoin_network });

    document.getElementById('seed').value = hd_more.seed;
    document.getElementById('root_privatekey').value = hd_more.rood_ext_key;
    document.getElementById('view_wallet').innerHTML = `
1. 助记词：${wallets.mnemonic}<br>      
2. 密码：${wallets.seed_password}<br>
3. 路径：${wallets.path}<br>
4. 钱包
<table>
  <tr style="line-height: 1.2rem;">
    <td style="text-align: right;  width: 7rem">私钥(WIF)：<br>压缩公钥：<br><br>P2TR地址：<br>P2WPKH地址：<br>P2PKH地址：</td>
    <td>${pri}<br>${pub}（ECDSA）<br>${schnorrPubKey}（Schnorr）<br>${addr_p2tr}（密钥路径）<br>${addr_p2wpkh}<br>${addr_p2pkh}</td>
  </tr>
</table>`;

    document.getElementById('prompt').style.visibility = 'visible';
    document.getElementById('view_account_pri').removeAttribute('disabled');
    document.getElementById('view_more').innerHTML = '';
}

function checkEnv() {
    alarm_str = "";
    if (navigator.userAgent.toLowerCase().indexOf('firefox') == -1) {
        alarm_str = "不是firefox浏览器。";
    }

    if (navigator.onLine) {
        alarm_str = alarm_str + "浏览器处于“在线工作”状态。";
        //        document.getElementById('sign_cover').style.visibility = 'visible';
    } else {
        //        document.getElementById('sign_cover').style.visibility = 'hidden';
    }
    /*
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var DBOpenRequest = window.indexedDB.open("btceth");
        DBOpenRequest.addEventListener('success',(evt)=>{
            alarm_str = alarm_str + "浏览器处于非隐私模式。";
            document.getElementById('alarm').innerText = '小心：' + alarm_str;
        });
    */
    document.getElementById('alarm').innerText = alarm_str == '' ? '' : ('小心：' + alarm_str);
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

//在区块链上存储数据资料。
function storage_data(storage_data) {
    let content = Buffer.Buffer.from(storage_data, 'utf8');
    if (content.length > 80) {
        content = content.slice(0, 80);
        document.getElementById('op_data').value = content.toString('utf8');
    }
    let data = content.toString('utf8');
    let inNode = document.createElement("div");
    inNode.setAttribute('class', 'txOut');
    inNode.innerHTML = `存储内容：<span title='${data}'>${data}</span><br>入账金额：<b>0</b>聪<br><input type="image" src="../images/delete.png" title="删除"
                style="float: right; padding: 2px;" class="tx_in_delete">`;
    document.getElementById('tx_outs').appendChild(inNode);
    inNode.querySelector('input').addEventListener('click', (ev) => {
        ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
    });
    document.getElementById('tx_he_type').value = 3;
    document.getElementById('tx_he_type').dispatchEvent(new Event('change'));
}

async function view_tx(tx_hash) {
    await openModal('请稍后，正在获取…');
    const reg = new RegExp(`.{1,${70}}`, 'g');
    getTxDetail(tx_hash, bitcoin_network != bitcoin.networks.bitcoin, false).then((ret) => {
        let dialog = document.getElementById('wallet_dialog');
        dialog.querySelector('h3').innerHTML = `查询交易 ${tx_hash}`;
        dialog.querySelector('p').innerHTML = `转账总额：${ret.total}聪，交易手续费：${ret.fees}聪，转账日期：${ret.confirmed}`;
        let td1 = '';
        let td2 = '';
        let input_script = '';
        let i = 0;
        ret.inputs = ret.inputs || [];
        ret.inputs.forEach(inp => {
            td1 = td1 + '交易ID：<br>输出序号：<br>输入脚本：';
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
            td1 = td1 + '<br>金额：<br>转出地址：<br>地址类型：<br>见证：<br>';
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
        dialog.querySelector('#tx_hd1').innerHTML = `${ret.inputs.length}个输入`;
        dialog.querySelector('#tx_td1').innerHTML = td1;
        dialog.querySelector('#tx_td2').innerHTML = td2;
        td1 = '';
        td2 = '';
        i = 0;
        ret.outputs = ret.outputs || [];
        ret.outputs.forEach(outp => {
            td1 = td1 + `转入地址：<br>地址类型：<br>金额：<br>输出脚本：<br>输出序号：<br><br>`;
            td2 = td2 + `${outp.addresses[0]}<br>${outp.script_type}<br>${outp.value}<br>${outp.script}<br>${i}<br><br>`;
            i++;
        });
        dialog.querySelector('#tx_hd2').innerHTML = `${ret.outputs.length}个输出`;
        dialog.querySelector('#tx_td3').innerHTML = td1;
        dialog.querySelector('#tx_td4').innerHTML = td2;
        document.getElementById('view_raw_tx').style.visibility = 'visible';
        closeModal();
        dialog.showModal();
    });
    //    console.log(tx_hash);
}

function calculate_redeem_script(pubKeys) {
    //    let pubKeys_str = document.getElementById('get_multi_address').value.trim().split(',');
    let pubKeys_arr = pubKeys.map(hex => Buffer.Buffer.from(hex, 'hex')).sort((a, b) => a.compare(b));//必须从小到大排序
    if (pubKeys_arr.length < 2) { return };
    let signs = parseInt(document.getElementById('signs').value);
    let redeem_script = bitcoin.payments.p2ms({ m: signs, pubkeys: pubKeys_arr, network: bitcoin_network });
    document.getElementById('get_multi_redeem').value = bitcoin.script.toASM(redeem_script.output);
}

/*
 * 从输出脚本计算比特币地址
 * @param {string} outputScript - 输出脚本（十六进制）
 * @param {boolean} isMainnet - 是比特币主网吗？
 * @returns {string} 计算出的比特币地址
 */
function output2address(outputScript, network) {
    const script = Buffer.Buffer.from(outputScript, "hex");
    return bitcoin.address.fromOutputScript(script, network);

    // 设置网络参数
    // isMainnet = isMainnet||true;
    const p2pkhPrefix = isMainnet ? 0x00 : 0x6F;
    const p2shPrefix = isMainnet ? 0x05 : 0xC4;
    const hrp = isMainnet ? "bc" : "tb";  // Bech32 / Bech32m 的人类可读部分

    // **P2PKH (1 / m 开头)**
    if (scriptPubKey.length === 25 && scriptPubKey[0] === 0x76 && scriptPubKey[1] === 0xa9) {
        const pubKeyHash = scriptPubKey.slice(3, 23);
        return bs58check.default.encode(Buffer.Buffer.concat([Buffer.Buffer.from([p2pkhPrefix]), pubKeyHash]));
    }

    // **P2SH (3 / 2 开头)**
    if (scriptPubKey.length === 23 && scriptPubKey[0] === 0xa9) {
        const scriptHash = scriptPubKey.slice(2, 22);
        return bs58check.default.encode(Buffer.Buffer.concat([Buffer.Buffer.from([p2shPrefix]), scriptHash]));
    }

    // **P2WPKH (bc1q / tb1q 开头)**
    if (scriptPubKey.length === 22 && scriptPubKey[0] === 0x00) {
        const decoded = bitcoin.script.decompile(scriptPubKey);
        return bitcoin.address.toBech32(decoded[1], 0, hrp);
        //        const pubKeyHash = scriptPubKey.slice(2, 22);
        //        return bech32.bech32.encode(hrp, bech32.bech32.toWords(pubKeyHash));
    }

    // **P2WSH (bc1q / tb1q 开头)：必须是 34 字节长度，且前缀为 `0020`
    if (scriptPubKey.length === 34 && scriptPubKey[0] === 0x00 && scriptPubKey[1] === 0x20) {
        const pubKeyHash = scriptPubKey.slice(2, 34);
        const version = scriptPubKey[0];
        const words = [version, ...bech32.bech32.toWords(pubKeyHash)];
        return bech32.bech32.encode(hrp, words);
    }

    // **P2TR (bc1p / tb1p 开头)**
    if (scriptPubKey.length === 34 && scriptPubKey[0] === 0x51 && scriptPubKey[1] === 0x20) {
        const version = 1;
        const taprootPubKey = scriptPubKey.slice(2, 34); // 32字节 X-only 公钥
        const words = [version, ...bech32.bech32m.toWords(taprootPubKey)];
        return bech32.bech32m.encode(hrp, words);
    }

    // **OP_RETURN存储数据**
    if (scriptPubKey[0] === 0x6a) {
        return Buffer.Buffer.from(scriptPubKeyHex.slice(4), 'hex').toString('utf8');
    }

    throw new Error("Unsupported scriptPubKey format");
}
//output2address("a9142317615750b647f0a84de52dd62748a328d6006087", true);//P2SH地址


async function broadcastTransaction(tx_hex) {
    await openModal('请稍后，正在发布…');
    //        const apiUrl = bitcoin_network == bitcoin.networks.bitcoin ? 'https://blockstream.info/api/tx' : 'https://blockstream.info/testnet/api/tx';
    let dis = document.getElementById('dispatch_result');
    dis.innerHTML = '';

    const apiUrl = bitcoin_network == bitcoin.networks.bitcoin ? 'https://blockstream.info/api' : 'https://blockstream.info/testnet/api';
    const blockstream = new axios.Axios({ baseURL: apiUrl });
    blockstream.post('/tx', tx_hex).then(response => {
        if (response.status == 200) {
            document.getElementById('dispatch_tx').setAttribute('disabled', '');
            let url2 = bitcoin_network == bitcoin.networks.bitcoin ? 'https://blockstream.info/' : 'https://blockstream.info/testnet';
            dis.innerHTML = `交易发布成功！<br>交易Id: ${response.data}<br>
            几分钟后可用此交易Id去&nbsp;<a href="${url2}" target="_blank">${url2}</a>&nbsp;查询交易是否完成。`;
        } else {
            dis.innerHTML = `交易发布失败！<br>反馈的错误信息：${response.data}<br>请检查网络是否能上互联网，或者检查屏幕右上角的“比特币网络”选择是否正确。`;
        }
//        dis.parentNode.style.visibility = "visible";
        closeModal();
    }).catch(error => {
        dis.innerHTML = `交易发布失败！<br>${error.response ? error.response.data : error.message}，过一会儿可再试一次，或者拷贝到其他网站去发布。`;
        closeModal();
    });
    /*
            const apiUrl = bitcoin_network == bitcoin.networks.bitcoin ? 'https://api.blockcypher.com/v1/btc/main/txs/push' : 'https://api.blockcypher.com/v1/btc/test3/txs/push';
            try {
                const response = await axios.post(apiUrl, hex, {
                    headers: {
                        'Content-Type': 'text/plain', // 设置请求头
                    },
                });
                document.getElementById('dispatch_tx').setAttribute('disabled', '');
                dis.innerHTML = `交易发布成功！<br>交易Id: ${response.data}<br>几分钟后可去https://blockchair.com/zh查询交易是否完成。`;
            } catch (error) {
                dis.innerHTML = `交易发布失败！<br>${error.response ? error.response.data : error.message}，过一会儿可再试一次。`;
            }
    */
    //    dis.parentNode.style.visibility = 'visible';
    document.getElementById('dispatch_tx').removeAttribute('disabled');
}

function decToHex(num, len) {//把十进制整数num转为len位十六进制小端格式
    return (num + 2 ** (len * 4)).toString(16).match(/\B../g).reverse().join``;
}

/*下面两个函数为了防止打开模态对话框时页面滚动到顶部*/
let scrollPosition = 0;

function openModal(tips) {
    scrollPosition = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    doing.querySelector('p').innerText = tips
    doing.showModal();
    // 返回一个Promise，确保UI更新完成
    return new Promise(resolve => {
        setTimeout(resolve, 50);
    });

}

function closeModal() {
    doing.close();
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);
}

//data: Buffer。返回附加了长度作为前缀的字符串。
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
  字符串转换为默克尔二叉树
  参数merkleString - 用字符串默克尔树。
  返回用数组表示的默克尔树
*/
function string2MerkleTree(merkleString) {
    var merkleTree = [];
    let s = merkleString.trim();
    s = s.slice(1, s.length - 1).trim();
    let index = 0;
    if (s[0] === '{') {//左边是叶子脚本
        index = s.indexOf("}");
        merkleTree.push({ output: bitcoin.script.fromASM(s.slice(1, index).trim()) });
        s = s.slice(index + 1).trim().slice(1).trim();//去掉逗号及左右的空格
        if (s[0] === '{') {//右边是叶子脚本
            index = s.indexOf("}");
            merkleTree.push({ output: bitcoin.script.fromASM(s.slice(1, index).trim()) });
        } else {//右边是二叉树
            merkleTree.push(string2MerkleTree(s));
        }
    } else {//左边是二叉树
        if (s[s.length - 1] === '}') {//右边是叶子脚本
            index = s.lastIndexOf("{");
            merkleTree.push(string2MerkleTree(s.slice(0, index)));
            merkleTree.push({ output: bitcoin.script.fromASM(s.slice(index + 1, s.length - 1).trim()) });
        } else {//右边是二叉树
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

/*
  加密信息函数：
  msgBytes - 被隐写的信息。类型Uint8Array。
  password - 密码。类型String。
*/
async function encryptMessage(msgBytes, password) {
    // 将密码转换为适合加密的密钥
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // 使用PBKDF2派生密钥
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

    // 生成初始化向量(IV)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 加密消息
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        msgBytes
    );

    // 组合salt、iv和加密数据
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);

    return result;
}

/*
  解密信息函数：
  encryptedData - 密文，类型为Uint8Array。
  password - 揭秘密码。
  返回明文，类型为Uint8Array。
*/
async function decryptMessage(encryptedData, password) {
    // 分离salt、iv和密文数据
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const data = encryptedData.slice(28);//密文

    // 将密码转换为适合加密的密钥
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // 使用PBKDF2派生密钥
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

    // 解密数据
    const decrypted = await crypto.subtle.decrypt(//返回ArrayBuffer
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        data
    );

    return new Uint8Array(decrypted);
}

/*
  用password对msgBytes加密后隐写入图片的函数：
  imageElement - <img>元素对象
  msgBytes - 被隐写的信息。类型Uint8Array。
  password - 加密密码。类型String。
*/
async function hideEncryptedMessageInImage(imageElement, msgBytes, password) {
    let encryptedData;
    if (password === "") {
        encryptedData = msgBytes;
    } else {
        // 加密消息
        encryptedData = await encryptMessage(msgBytes, password);
    }

    // 将加密数据转换为二进制字符串
    let msgBits = '';
    for (const byte of encryptedData) {
        msgBits += byte.toString(2).padStart(8, '0');
    }
    const msgTotalBits = msgBits.length.toString(2).padStart(32, '0') + msgBits;

    // 创建画布
    const canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    // 获取图像数据
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 检查容量
    if (msgTotalBits.length > imageData.data.length * 3 / 4) {
        throw new Error('被隐写的信息太多！');
    }

    encodeMessage(imageData.data, msgTotalBits);

    // 更新图像数据
    ctx.putImageData(imageData, 0, 0);

    // 返回包含加密消息的图片
    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png');
    });
}

/*
  把msgBits写入像素的RGB
  imgPixels为uint8数组，每四个元素表示一个像素的RGBA
  msgBits为二进制字符串，前32位表示被隐写信息的长度，从第32位开始就是被隐写信息
*/
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

/*
  用password解密从图片中获取的信息：
  imageElement - <img>元素对象
  password - 解密密码，类型String
  返回明文，类型为Uint8Array。
*/
async function extractEncryptedMessageFromImage(imageElement, password) {
    // 创建画布
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const encryptedData = decodeMessage(imageData.data);
    if (password === "") {
        return encryptedData;
    }
    // 解密数据
    try {
        return await decryptMessage(encryptedData, password);
    } catch (error) {
        throw new Error('Decryption failed - wrong password or corrupted data');
    }
}

/*从图形数据中获取被隐写的数据：
  imgPixels - 图片点阵数据，类型为Uint8Array。
  返回Uint8Array
*/
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
        encryptedData[i / 8] = parseInt(msgBits.slice(i, i + 8), 2);
    }
    return encryptedData;
}

/*
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

/*
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

/**
 * witness:Buffer[]类型
 * 返回序列化后的Buffer。
 */
function witnessStackToScriptWitness(witness) {
    let buffer = Buffer.Buffer.allocUnsafe(0)

    function writeSlice(slice) {
        buffer = Buffer.Buffer.concat([buffer, Buffer.Buffer.from(slice)])
    }

    function writeVarInt(i) {
        const currentLen = buffer.length;
        const varintLen = varuintBitcoin.encodingLength(i)

        buffer = Buffer.Buffer.concat([buffer, Buffer.Buffer.allocUnsafe(varintLen)])
        varuintBitcoin.encode(i, buffer, currentLen)
    }

    function writeVarSlice(slice) {
        writeVarInt(slice.length)
        writeSlice(slice)
    }

    function writeVector(vector) {
        writeVarInt(vector.length)
        vector.forEach(writeVarSlice)
    }

    writeVector(witness)

    return buffer
}