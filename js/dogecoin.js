window.addEventListener("load", () => {

    document.getElementById('dogecoin_configure_network').addEventListener('change', (ev) => {
        if (ev.target.value == 0) {
            dogecoin_network = dogecoinMainnet;
            document.getElementById('dogecoin_new_path').value = "m/44'/3'/0'/0/0";
            document.getElementById('dogecoin_new_path').nextSibling.innerText = "(Note: The path m/44'/3'/i'/0/j represents the j-th wallet in the i-th account, where i, j = 0, 1, 2, …)";
        } else {
            dogecoin_network = dogecoinTestnet;
            document.getElementById('dogecoin_new_path').value = "m/44'/1'/0'/0/0";
            document.getElementById('dogecoin_new_path').nextSibling.innerText = "(Note: The path m/44'/1'/i'/0/j represents the j-th wallet in the i-th account, where i, j = 0, 1, 2, …)";
        }
    })

    document.getElementById('dogecoin_configure_rate').addEventListener('blur', (ev) => {
        dogecoin_rate = parseFloat(ev.target.value.trim());
    });

    document.getElementById('dogecoin_configure_fee').addEventListener('blur', (ev) => {
        dogecoin_fee_dollars = parseFloat(ev.target.value.trim());
        dogecoin_fee_litoshi = Math.round(dogecoin_fee_dollars / dogecoin_rate * 100000000);
        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
        let totalAmount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
        let tx_fee = parseInt(totalAmount) - parseInt(toOut);
        document.getElementById('dogecoin_tx_fee_alarm').style.visibility = tx_fee < dogecoin_fee_satoshi ? 'visible' : 'hidden';
        document.getElementById('dogecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('dogecoin_tx_fee_dollar').innerText = Math.round(tx_fee * dogecoin_rate / 1000000) / 100;
        document.getElementById('dogecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - dogecoin_fee_litoshi) < 0 ? 0 : (tx_fee - dogecoin_fee_litoshi));
    });

    document.getElementById('dogecoin_configure_language').addEventListener('change', (ev) => {
        switch (ev.target.value) {
            case 'cn':
                dogecoin_language = bip39.wordlists.chinese_simplified;
                break;
            case 'tw':
                dogecoin_language = bip39.wordlists.chinese_traditional;
                break;
            case 'ja':
                dogecoin_language = bip39.wordlists.japanese;
                break;
            case 'es':
                dogecoin_language = bip39.wordlists.spanish;
                break;
            case 'fr':
                dogecoin_language = bip39.wordlists.french;
                break;
            case 'it':
                dogecoin_language = bip39.wordlists.italian;
                break;
            case 'ko':
                dogecoin_language = bip39.wordlists.korean;
                break;
            case 'pt':
                dogecoin_language = bip39.wordlists.portuguese;
                break;
            case 'cz':
                dogecoin_language = bip39.wordlists.czech;
                break;
            default:
                dogecoin_languagee = bip39.wordlists.english;
                break;
        }
    });

    document.getElementById('dogecoin_mnemonic_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('dogecoin_password').setAttribute('type', 'text');
    })
    document.getElementById('dogecoin_mnemonic_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('dogecoin_password').setAttribute('type', 'password');
    })

    document.getElementById('dogecoin_new_wallet').addEventListener('click', async (ev) => {
        document.getElementById('dogecoin_new_privatekey').value = '';
        document.getElementById('dogecoin_mnemonic').value = bip84.generateMnemonic(parseInt(document.getElementById('dogecoin_mnemonic_length').value) * 32 / 3, null, dogecoin_language);
        await openModal('Please wait, processing…');
        dogecoin_recover_wallet();
        closeModal();
    });

    document.getElementById('dogecoin_recover_wallet').addEventListener('click', async (evt) => {
        await openModal('Please wait, processing…');
        dogecoin_recover_wallet();
        closeModal();
    });

    document.getElementById('dogecoin_new_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('dogecoin_new_private_password').setAttribute('type', 'text');
        document.getElementById('dogecoin_new_privatekey').setAttribute('type', 'text');
    })
    document.getElementById('dogecoin_new_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('dogecoin_new_private_password').setAttribute('type', 'password');
        document.getElementById('dogecoin_new_privatekey').setAttribute('type', 'password');
    })

    document.getElementById('dogecoin_reset_wallet').addEventListener('click', (evt) => {
        document.getElementById('dogecoin_mnemonic_length').value = "24";
        document.getElementById('dogecoin_mnemonic').value = '';
        document.getElementById('dogecoin_password').value = '';
        document.getElementById('dogecoin_hd_wallet').innerHTML = '';
        document.getElementById('dogecoin_new_privatekey').value = '';
        document.getElementById('dogecoin_new_path').value = `m/44'/${dogecoin_network.wif == 0x9e ? 3 : 1}'/0'/0/0`;
        document.getElementById('dogecoin_new_path').nextSibling.innerHTML = `(Description: The path m/44'/${dogecoin_network.wif == 0x9e ? 3 : 1}'/i'/0/j represents the j-th wallet in the i-th account, where i, j = 0, 1, 2, …)`;
        document.getElementById('dogecoin_new_private_password').value = '';
    });

    document.getElementById('dogecoin_fromWif_privateKey_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('dogecoin_fromPrivateKey_private').setAttribute('type', 'text');
    })

    document.getElementById('dogecoin_fromWif_privateKey_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('dogecoin_fromPrivateKey_private').setAttribute('type', 'password');
    })

    document.getElementById('dogecoin_fromWif_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('dogecoin_fromWif_password').setAttribute('type', 'text');
    })

    document.getElementById('dogecoin_fromWif_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('dogecoin_fromWif_password').setAttribute('type', 'password');
    })

    document.getElementById('dogecoin_fromPrivateKey_ok_btn').addEventListener('click', async (et) => {
        let pri_key = document.getElementById('dogecoin_fromPrivateKey_private').value.trim();
        if (pri_key == '') {
            alert("Please enter the private key first!");
            return;
        }
        document.getElementById('dogecoin_address_td1').innerHTML = '';
        document.getElementById('dogecoin_address_td2').innerHTML = '';
        document.getElementById('dogecoin_private_td1').innerHTML = '';
        document.getElementById('dogecoin_private_td2').innerHTML = '';
        document.getElementById('dogecoin_public_td1').innerHTML = '';
        document.getElementById('dogecoin_public_td2').innerHTML = '';

        if (pri_key.slice(0, 2) == '6P') {
            let password = document.getElementById('dogecoin_fromWif_password').value.trim();
            if (password == '') {
                alert('The private key has been encrypted, but the password to protect the private key has not been provided!');
                pri_key = null;
                return;
            } else {//私钥被密码保护，需要解密
                try {
                    await openModal('Please wait, decrypting …');
                    if (!bip38.verify(pri_key)) {
                        throw new Error('Not a valid encrypted private key!');
                    }
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(pri_key, password, null, { N: N, r: r, p: p });
                    pri_key = wif.encode({ version: dogecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
                    closeModal();
                } catch (error) {
                    pri_key = null;
                    closeModal();
                    alert(error);
                    return;
                };
            }
        }

        //        let ECPair = ecpair.ECPairFactory(bitcoinerlabsecp256k1);
        try {
            //1. 产生各种类型的地址：
            if (/^[0-9a-fA-F]{64}$/.test(pri_key)) {//十六进制私钥（没有前缀0x）
                //                pri_key = ECPair.fromPrivateKey(Buffer.Buffer.from(pri_key, 'hex'), { network: network }).toWIF();
                pri_key = wif.encode({ version: dogecoin_network.wif, privateKey: Buffer.Buffer.from(pri_key, 'hex'), compressed: true });
            }
            let keyPair = ECPair.fromWIF(pri_key, dogecoin_network);//压缩私钥产生压锁公钥，非压缩私钥产生非压缩公钥。
            if (!keyPair.compressed) {
                pri_key = wif.encode({ version: dogecoin_network.wif, privateKey: wif.decode(pri_key, dogecoin_network.wif).privateKey, compressed: true });
                keyPair = ECPair.fromWIF(pri_key, dogecoin_network);
            }
            let { address: address_p2pkh } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: dogecoin_network });
            //            let { address: address_p2wpkh } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: dogecoin_network });

            document.getElementById('dogecoin_address_td1').innerHTML = `P2PKH Address:<br>`;
            document.getElementById('dogecoin_address_td2').innerHTML = `${address_p2pkh}`;

            //2. 产生各种编码格式的私钥：
            let rawPrivateKey = wif.decode(pri_key, dogecoin_network.wif);
            let pri_compress = pri_key;
            let pri_uncompress = pri_key;
            if (rawPrivateKey.compressed) {
                pri_uncompress = wif.encode({ version: dogecoin_network.wif, privateKey: rawPrivateKey.privateKey, compressed: false });
            } else {
                pri_compress = wif.encode({ version: dogecoin_network.wif, privateKey: rawPrivateKey.privateKey, compressed: true });
            }
            let pri_raw = rawPrivateKey.privateKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            let pri_binary = '';
            rawPrivateKey.privateKey.forEach(b => { pri_binary += b.toString(2).padStart(8, '0'); });
            let pri_bs58 = bs58check.default.encode(rawPrivateKey.privateKey);
            document.getElementById('dogecoin_private_td1').innerHTML = `Compressed WIF:<br>Uncompressed WIF:<br>Base58 Encoding:<br>Raw (Hexadecimal):<br>Raw (Binary):`;
            document.getElementById('dogecoin_private_td2').innerHTML = `${pri_compress}<br>${pri_uncompress}<br>${pri_bs58}<br>${pri_raw}<br><div style='width: 36rem; overflow-wrap: anywhere;'>${pri_binary}</div>`;

            //3. 产生各种格式的公钥：
            let pub_compress = '';
            let pub_uncompress = '';
            if (keyPair.compressed) {
                pub_compress = keyPair.publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
                pub_uncompress = ECPair.fromWIF(pri_uncompress, dogecoin_network).publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');//非压缩私钥产生非压缩公钥
            }
            document.getElementById('dogecoin_public_td1').innerHTML = `Compressed public key:<br>Uncompressed public key:<br>`;
            document.getElementById('dogecoin_public_td2').innerHTML = `${pub_compress}(Public key generated by the ECDSA algorithm - most common)<br>${pub_uncompress}`;

        } catch (error) {
            alert(error);
        }
    });

    document.getElementById('dogecoin_fromPrivateKey_reset_btn').addEventListener('click', (ev) => {
        document.getElementById('dogecoin_address_td1').innerHTML = '';
        document.getElementById('dogecoin_address_td2').innerHTML = '';
        document.getElementById('dogecoin_private_td1').innerHTML = '';
        document.getElementById('dogecoin_private_td2').innerHTML = '';
        document.getElementById('dogecoin_public_td1').innerHTML = '';
        document.getElementById('dogecoin_public_td2').innerHTML = '';
        document.getElementById('dogecoin_fromWif_password').value = '';
        document.getElementById('dogecoin_fromPrivateKey_private').value = '';
    })

    document.getElementById('dogecoin_wallet_balance_btn').addEventListener('click', async (et) => {
        let wallet_address = document.getElementById('dogecoin_wallet_address').value.trim();
        if (wallet_address == '') {
            alert("Please enter the wallet address or transaction ID first!");
            return;
        }
        if (wallet_address.length < 64) {
            await openModal('Please wait, retrieving…');
            dogecoin_getUtxo(wallet_address, dogecoin_network == dogecoinTestnet).then((res) => {
                let ls = '';
                let ms = '';
                let rs = '';
                if (dogecoin_network == dogecoinTestnet) {
                    let balance = res.reduce((totalAmount, e) => totalAmount + e.value, 0);
                    document.getElementById('dogecoin_view_wallet_balance').innerHTML = `Balance: ${balance} Satoshi (${balance / 100000000} DOGE). Total ${res.length} UTXOs:`
                    res.forEach((b, i) => {
                        ls = ls + `<br>${i}<br><br><br>`;
                        ms = ms + `Transaction ID (tx_hash):<br>Output Index (tx_output_n):<br>Amount (value):<br><br>`;
                        rs = rs + `<a href="javascript:dogecoin_view_tx('${b.txid}')" style="text-decoration:none">${b.txid}</a><br>${b.vout}<br>${b.value} Satoshi<br><br>`;
                    });
                } else {
                    let balance = res.balance;
                    let utxoes = res.txrefs;
                    document.getElementById('dogecoin_view_wallet_balance').innerHTML = `Balance: ${balance} Satoshi (${balance / 100000000} DOGE). Total ${utxoes.length}个UTXOs:`
                    //                let i = 1;
                    utxoes.forEach((b, i) => {
                        ls = ls + `<br>${i}<br><br><br>`;
                        //                    i++;
                        ms = ms + `Transaction ID (tx_hash):<br>Output Index (tx_output_n):<br>Amount (value):<br><br>`;
                        rs = rs + `<a href="javascript:dogecoin_view_tx('${b.tx_hash}')" style="text-decoration:none">${b.tx_hash}</a><br>${b.tx_output_n}<br>${b.value} Satoshi<br><br>`;
                    });
                }
                document.getElementById('dogecoin_view_wallet_td0').innerHTML = ls;
                document.getElementById('dogecoin_view_wallet_td1').innerHTML = ms;
                document.getElementById('dogecoin_view_wallet_td2').innerHTML = rs;
                closeModal();
            }).catch(err => {
                closeModal();
                alert(err);
            });
        } else {
            dogecoin_view_tx(wallet_address, dogecoin_network == dogecoinTestnet);
        }
    });

    document.getElementById('dogecoin_multi_address').addEventListener('input', (ev) => {
        let inp = ev.target.value.trim();
        if (inp == '') {
            document.getElementById('dogecoin_reset_multi_sign').click();
            return;
        }
        if (inp.length < 66) { return };
        let inps = inp.split(',').filter(e => e != '');
        for (let i = 0; i < inps.length; i++) {
            if (inps[i].length < 66) {
                return;
            }
        }
        document.getElementById('dogecoin_least_sign').innerText = inps.length;
        document.getElementById('dogecoin_signs').setAttribute('max', inps.length);
        document.getElementById('dogecoin_signs').value = inps.length - 1;
        gen_redeem_script(inps);
    });

    document.getElementById('dogecoin_gen_multi_sign').addEventListener('click', (ev) => {
        let pubKeys_str = document.getElementById('dogecoin_multi_address').value.trim().split(',').filter(e => e != '');
        if (pubKeys_str.length < 2) { alert('At least two public keys!'); return };
        for (let i = 0; i < pubKeys_str.length; i++) {
            if (pubKeys_str[i].length != 66) {
                alert(`The length of this public key is incorrect: ${pubKeys_str[i]}`);
                document.getElementById('dogecoin_dis_multi_address').innerHTML = '';
                document.getElementById('dogecoin_multi_redeem').innerHTML = '';
                return;
            }
        }
        let pubKeys_arr = pubKeys_str.map(hex => Buffer.Buffer.from(hex, 'hex'));
        let signs = parseInt(document.getElementById('signs').value);
        let redeem_script = bitcoin.payments.p2ms({ m: signs, pubkeys: pubKeys_arr, network: dogecoin_network });
        const { address: p2shAddress } = bitcoin.payments.p2sh({
            redeem: redeem_script,
            network: dogecoin_network,
        });
        const redeem_hash = bitcoin.crypto.hash160(redeem_script);
        const output_ASM = `OP_HASH160 ${redeem_hash.toString('hex')} OP_EQUAL`;

        document.getElementById('dogecoin_dis_multi_address').innerHTML = `
        <span style="width: 7rem; display: inline-block; text-align: right;">P2SH Address: </span>${p2shAddress}<br>
        <span style="width: 7rem; display: inline-block; text-align: right;color: gray">Output Script: </span><small style="color: gray">${output_ASM}</small><br>
        <!--span style="width: 7rem; display: inline-block; text-align: right;color: gray">Redeem Script: </span><small style="color: gray">${bitcoin.script.toASM(redeem_script.output)}</small><br&nbsp;&nbsp;&nbsp;&nbsp;-->`;
    })

    document.getElementById('dogecoin_reset_multi_sign').addEventListener('click', (ev) => {
        document.getElementById('dogecoin_least_sign').innerText = '*';
        document.getElementById('dogecoin_multi_address').value = '';
        document.getElementById('dogecoin_dis_multi_address').innerHTML = '';
        document.getElementById('dogecoin_multi_redeem').value = '';
    });

    document.getElementById('dogecoin_segment_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('dogecoin_segment_password').setAttribute('type', 'text');
        document.getElementById('dogecoin_segment_privateKey').setAttribute('type', 'text');
    })
    document.getElementById('dogecoin_segment_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('dogecoin_segment_password').setAttribute('type', 'password');
        document.getElementById('dogecoin_segment_privateKey').setAttribute('type', 'password');
    })

    document.getElementById('dogecoin_signature_btn').addEventListener('click', async (ev) => {
        const segmentText = document.getElementById('dogecoin_segment_text').value.trim();
        if (segmentText == '') {
            alert('The signed text cannot be empty!');
            return;
        }
        let pri_wif = document.getElementById('dogecoin_segment_privateKey').value.trim();
        if (pri_wif) {
            if (bip38.verify(pri_wif)) {//加了密的私钥
                const password = document.getElementById('dogecoin_segment_password').value.trim();
                if (password == '') {
                    alert('The decryption password for the private key must be entered!');
                    return;
                }
                try {
                    await openModal("Please wait ...");
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(pri_wif, password, null, { N: N, r: r, p: p });
                    pri_wif = wif.encode({ version: dogecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
                    closeModal();
                } catch (error) {
                    pri_wif = null;
                    closeModal();
                    alert(error);
                    return;
                };
            }

            let keyPair;
            try {
                keyPair = ECPair.fromWIF(pri_wif, dogecoin_network);
            } catch (err) {
                alert(err);
                return;
            }

            let signature = bitcoinjsMessage.sign(
                segmentText,
                keyPair.privateKey,
                keyPair.compressed,
                dogecoin_network.messagePrefix
            );
            const signatureBase64 = signature.toString('base64');
            document.getElementById('dogecoin_segment_result').value = signatureBase64;
        }
    })

    document.getElementById('dogecoin_veify_btn').addEventListener('click', (ev) => {
        const segmentText = document.getElementById('dogecoin_segment_text').value.trim();
        const signature = document.getElementById('dogecoin_segment_result').value.trim();
        const p2wpkhAddress = document.getElementById('dogecoin_segment_address').value.trim();
        if (!segmentText || !signature || !p2wpkhAddress) {
            alert("The signed text, signature, and address cannot be missing!");
            return;
        }
        let isValid;
        //        try {
        isValid = bitcoinjsMessage.verify(segmentText, p2wpkhAddress, signature, dogecoin_network.messagePrefix);
        ev.target.parentNode.querySelector('#dogecoin_segment_verify_result').style.visibility = 'visible';
        ev.target.parentNode.querySelector('#dogecoin_segment_verify_result').setAttribute('src', isValid ? 'images/sign_ok.png' : 'images/sign_failed.png');

    });

    document.getElementById('dogecoin_reset_btn').addEventListener('click', (ev) => {
        document.getElementById('dogecoin_segment_verify_result').style.visibility = 'hidden';
        document.getElementById('dogecoin_segment_text').value = '';
        document.getElementById('dogecoin_segment_result').value = '';
        document.getElementById('dogecoin_segment_address').value = '';
        document.getElementById('dogecoin_segment_password').value = '';
        document.getElementById('dogecoin_segment_privateKey').value = '';
    });

    document.getElementById('dogecoin_tx_me_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        let address_type = document.getElementById('dogecoin_tx_me_type');
        if (address[0] == 'D' || address[0] == 'm' || address[0] == 'n') {//为P2PKH
            address_type.selectedIndex = 0;
        } else if (address[0] == 'A' || address[0] == '9' || address[0] == '2') {//为P2SH
            address_type.selectedIndex = 1;
        } else {
            address_type.selectedIndex = 2;
        }
        document.getElementById('dogecoin_tx_wallet_balance').innerHTML = '';
        document.getElementById('dogecoin_tx_utxo_td0').innerHTML = '';
        document.getElementById('dogecoin_tx_utxo_td1').innerHTML = '';
        address_type.dispatchEvent(new Event('change'));
    })

    document.getElementById('dogecoin_tx_me_type').addEventListener('change', (ev) => {
        if (ev.target.value == 6) {
            document.getElementById('dogecoin_redeem_script').style.display = 'block';
        } else {
            document.getElementById('dogecoin_redeem_script').style.display = 'none';
        }
    })

    document.getElementById('dogecoin_tx_he_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        let address_type = document.getElementById('dogecoin_tx_he_type');
        if (address[0] == 'D' || address[0] == 'm' || address[0] == 'n') {//为P2PKH
            address_type.selectedIndex = 0;
        } else if (address[0] == 'A' || address[0] == '9' || address[0] == '2') {//为P2SH
            address_type.selectedIndex = 1;
        } else {
            address_type.selectedIndex = 3;
        }
    });

    document.getElementById('dogecoin_tx_me_utxo').addEventListener('click', async (et) => {
        let wallet_address = document.getElementById('dogecoin_tx_me_address').value.trim();
        if (wallet_address == '') {
            alert("Please enter your Dogecoin wallet address first!");
            return;
        }

        if (canFetchRawTX) {
            await openModal('Please wait, retrieving UTXO…');
            dogecoin_getUtxo(wallet_address, dogecoin_network == dogecoinTestnet).then((utxoes) => {
                let balance = utxoes.reduce((totalAmount, e) => totalAmount + e.value, 0);
                document.getElementById('tx_wallet_balance').innerHTML = `<br>Balance: ${balance} Litoshi（${balance / 100000000} DOGE), Total ${utxoes.length} UTXOs:`
                let ms = '';
                let rs = '';
                //            let i = 0;
                outx = utxoes;
                for (let i = 0; i < utxoes.length; i++) {
                    let b = outx[i];
                    //                ls = ls + `<p style="line-height: 37px;"><button data-i="${i}">花费</button></p><hr>`;
                    let uid = bitcoin.crypto.sha1(Buffer.Buffer.from(b.txid + b.vout)).slice(0, 5).toString('hex');
                    ms = ms + `Transaction ID<br>Output Index<br>Amount<br><hr>`;
                    rs = rs + `<div data-uid='${uid}'>&nbsp;<a href="javascript:view_tx('${b.txid}')" style="text-decoration:none">${b.txid}</a><br>&nbsp;${b.vout}<br>&nbsp;${new Intl.NumberFormat('en-US').format(b.value)} Litoshi<button data-i=${i} class="dogecoin_tx_btn_addInput" style="float: right;">Spend</button><span style="visibility: hidden;float: right;color: green;font-size: 1.5rem;margin-right: 10px;">√</span><br><hr></div>`;
                    //                i++;
                    //                if (i > 5) break;
                }
                document.getElementById('dogecoin_tx_utxo_td0').innerHTML = ms;
                document.getElementById('dogecoin_tx_utxo_td1').innerHTML = rs;
                //            document.getElementById('tx_utxo_td2').innerHTML = ls;
                document.querySelectorAll(".dogecoin_tx_btn_addInput")?.forEach(btn => {
                    btn.addEventListener('click', (ev) => {
                        let addressType = document.getElementById('dogecoin_tx_me_type').value;
                        let publicKey = '';
                        if (addressType == '2' || addressType == '4' || addressType == '6') {
                            let publicKeyObj = document.getElementById('dogecoin_redeem_script');
                            if (!publicKeyObj) {
                                alert('For P2SH, a public key must be provided!');
                                return;
                            }
                            publicKey = publicKeyObj.querySelector('input').value.trim();
                        }
                        let sequence = document.getElementById('dogecoin_tx_me_sequnce').value.trim();
                        let address = document.getElementById('dogecoin_tx_me_address').value.trim();
                        let i = ev.target.dataset.i;
                        let inNode = document.createElement("div");
                        inNode.setAttribute('class', 'dogecoin_txIn');
                        inNode.setAttribute('data-uid', ev.target.parentNode.dataset.uid);
                        inNode.setAttribute('data-type', document.getElementById('dogecoin_tx_me_type').value);
                        inNode.setAttribute('data-redeem', publicKey);
                        inNode.innerHTML = `<span>Transaction ID: </span><a href="javascript:view_tx('${outx[i].txid}')" style="text-decoration:none" title="${outx[i].txid}">${outx[i].txid}</a><br>
                    <span>NO.: </span><b class='output_index'>${outx[i].vout}</b><br><span>value: </span><b class='value'>${new Intl.NumberFormat('en-US').format(outx[i].value)}</b> Satoshi<br>
                    <span>Sequence: </span><b class='sequence'>${sequence}</b><br><span>Address: </span><code title="${address}">${address}</code><br><input type="image" src="images/delete.png" title="Delete"
                                style="float: right; padding: 2px;" class="dogecoin_tx_in_delete">`;
                        let box_ins = document.getElementById('dogecoin_tx_ins');
                        box_ins.appendChild(inNode);
                        let numb = parseInt(box_ins.dataset.number) + 1;
                        box_ins.dataset.number = `${numb}`;
                        if (numb > 1) {
                            document.getElementById('dogecoin_tx_ins').parentNode.style.height = `${parseInt(document.getElementById('dogecoin_tx_ins').parentNode.style.height) + 110}px`;
                        }

                        inNode.querySelector('input').addEventListener('click', (ev) => {
                            let val = ev.target.parentNode.querySelectorAll('b')[1].innerText.replace(/,/g, '');
                            let amount = document.getElementById('dogecoin_tx_amount').innerText.replace(/,/g, '');
                            let totalAmount = parseInt(amount) - parseInt(val);
                            let formattedAmount = new Intl.NumberFormat('en-US').format(totalAmount);
                            document.getElementById('dogecoin_tx_amount').innerText = formattedAmount;

                            let toOut = document.getElementById('dogecoin_tx_itInput').innerText.replace(/,/g, '');
                            let tx_fee = totalAmount - parseInt(toOut);
                            document.getElementById('dogecoin_tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
                            document.getElementById('dogecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                            document.getElementById('dogecoin_tx_fee_dollar').innerText = Math.round(tx_fee * dogecoin_rate / 1000000) / 100;
                            document.getElementById('dogecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
                            //                        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(amount) - parseInt(val)-fee);
                            let tar = document.querySelector("#dogecoin_tx_utxo_td1>div[data-uid='" + ev.target.parentNode.dataset.uid + "']");
                            if (tar) {
                                tar.querySelector('span').style.visibility = 'hidden';
                                tar.querySelector('button').removeAttribute('disabled');
                            }
                            let i = parseInt(ev.target.parentNode.parentNode.dataset.number);
                            i--;
                            ev.target.parentNode.parentNode.dataset.number = `${i}`;
                            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
                            if (i > 1) {
                                document.getElementById('dogecoin_tx_ins').parentNode.style.height = `${parseInt(document.getElementById('dogecoin_tx_ins').parentNode.style.height) - 110}px`;
                            }
                        });

                        ev.target.parentNode.querySelector('span').style.visibility = 'visible';
                        ev.target.setAttribute('disabled', '');
                        let amount = document.getElementById('dogecoin_tx_amount').innerText.replace(/,/g, '');
                        let totalAmount = parseInt(amount) + outx[i].value;
                        document.getElementById('dogecoin_tx_amount').innerText = new Intl.NumberFormat('en-US').format(totalAmount);
                        let toOut = document.getElementById('dogecoin_tx_itInput').innerText.replace(/,/g, '');
                        let tx_fee = totalAmount - parseInt(toOut);
                        document.getElementById('dogecoin_tx_fee_alarm').style.visibility = tx_fee < dogecoin_fee_litoshi ? 'visible' : 'hidden';
                        document.getElementById('dogecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                        document.getElementById('dogecoin_tx_fee_dollar').innerText = Math.round(tx_fee * dogecoin_rate / 1000000) / 100;
                        document.getElementById('dogecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - dogecoin_fee_litoshi) < 0 ? 0 : (tx_fee - dogecoin_fee_litoshi));
                    });
                })
                closeModal();
            }).catch(err => {
                document.getElementById('dogecoin_no_network').style.display = 'block';
                closeModal();
                alert(err);
            });
        } else {
            document.getElementById('dogecoin_no_network').style.display = 'block';
            alert("Unable to automatically fetch UTXO; you need to enter it manually!");
        }
    });

    document.getElementById('dogecoin_tx_he_type').addEventListener('change', (ev) => {
        if (ev.target.value == '7') {//OP_RETURN
            document.getElementById('dogecoin_op_return_data').style.display = 'block';
            //            document.getElementById('dogecoin_tx_he_address').setAttribute('disabled', '');
            document.getElementById('dogecoin_tx_he_amount').value = '0';
            document.getElementById('dogecoin_tx_he_amount').setAttribute('disabled', '');
        } else {
            document.getElementById('dogecoin_op_return_data').style.display = 'none';
            //            document.getElementById('dogecoin_tx_he_address').removeAttribute('disabled');
            document.getElementById('dogecoin_tx_he_amount').removeAttribute('disabled');
            document.getElementById('dogecoin_tx_he_amount').value = '';
        }
    });

    document.getElementById('dogecoin_tx_he_output').addEventListener('click', (ev) => {
        if (document.getElementById('dogecoin_tx_he_type').value == '7') {//OP_RETURN
            let data = document.getElementById('dogecoin_op_data').value.trim();
            if (data != '') {
                storage_data(data);
            } else {
                alert("You need to input content stored on the Bitcoin blockchain!");
            }
            return;
        }
        let toAddress = document.getElementById('dogecoin_tx_he_address').value.trim();
        if (toAddress == '') {
            alert("Please enter the recipient's address!");
            return;
        }
        if (!isValidAddress(toAddress, dogecoin_network)) {
            alert('This is not a valid Dogecoin address!');
            return;
        }
        if (document.getElementById('dogecoin_tx_he_amount').value.trim() == '') {
            alert('Please enter the deposit amount!');
            return;
        }
        let toAmount = parseInt(document.getElementById('dogecoin_tx_he_amount').value.trim());
        let tx_fee = document.getElementById('dogecoin_tx_fee').innerText.replace(/,/g, '');
        if (toAmount > tx_fee) {
            alert('The amount credited by the other party is greater than the total amount!');
            return;
        }
        let inNode = document.createElement("div");
        inNode.setAttribute('class', 'txOut');
        inNode.innerHTML = `Recipient's address: <span title='${toAddress}'>${toAddress}</span><br>Transfer Amount:<b>${new Intl.NumberFormat('en-US').format(toAmount)}</b> Satoshi <br><input type="image" src="images/delete.png" title="Delete"
                    style="float: right; padding: 2px;" class="dogecoin_tx_in_delete">`;
        document.getElementById('dogecoin_tx_outs').appendChild(inNode);
        let toOut = document.getElementById('dogecoin_tx_itInput').innerText.replace(/,/g, '');
        let outAmount = parseInt(toOut) + toAmount;
        document.getElementById('dogecoin_tx_itInput').innerText = new Intl.NumberFormat('en-US').format(outAmount);
        tx_fee = parseInt(tx_fee) - toAmount;
        document.getElementById('dogecoin_tx_fee_alarm').style.visibility = tx_fee < dogecoin_fee_litoshi ? 'visible' : 'hidden';
        document.getElementById('dogecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('dogecoin_tx_fee_dollar').innerText = Math.round(tx_fee * dogecoin_rate / 1000000) / 100;
        document.getElementById('dogecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - dogecoin_fee_litoshi) < 0 ? 0 : (tx_fee - dogecoin_fee_litoshi));

        inNode.querySelector('input').addEventListener('click', (ev) => {
            let val = ev.target.parentNode.querySelector('b').innerText.replace(/,/g, '');
            let tx_fee = document.getElementById('dogecoin_tx_fee').innerText.replace(/,/g, '');
            let toOut = document.getElementById('dogecoin_tx_itInput').innerText.replace(/,/g, '');
            tx_fee = parseInt(tx_fee) + parseInt(val);
            document.getElementById('dogecoin_tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
            document.getElementById('dogecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
            document.getElementById('dogecoin_tx_fee_dollar').innerText = Math.round(tx_fee * dogecoin_rate / 1000000) / 100;
            document.getElementById('dogecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
            document.getElementById('dogecoin_tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(toOut) - parseInt(val));
            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
        });
        document.getElementById('dogecoin_tx_he_address').value = '';
        document.getElementById('dogecoin_tx_he_amount').value = '';
    })

    document.getElementById('dogecoin_import_input').addEventListener('click', (ev) => {
        let txInputs = document.querySelectorAll('#dogecoin_tx_ins>div');
        if (txInputs.length < 1) {
            alert('没有可签名的输入！');
            return;
        }
        sign_index = 0;
        let tbody1 = document.querySelector('#dogecoin_sign_table>tbody');
        tbody1.innerHTML = '';
        let i = 0;

        psbt = psbt_bak = null;
        psbt = new bitcoin.Psbt({ network: dogecoin_network });
        psbt.setVersion(parseInt(document.getElementById('dogecoin_tx_version').value));
        psbt.setLocktime(parseInt(document.getElementById('dogecoin_tx_locktime').value));

        txInputs.forEach((inp) => {
            let inp_copy = inp.cloneNode(true);
            inp_copy.removeChild(inp_copy.querySelector('input'));
            inp_copy.setAttribute('class', 'dogecoin_import_txIn');
            psbt_addInput(inp_copy);
            let row = document.createElement('tr');
            row.innerHTML = `               <td></td>
                                            <td class="signed" id="dogecoin_td${i}0">√</td>
                                            <td class="signed" id="dogecoin_td${i}1">√</td>
                                            <td class="signed" id="dogecoin_td${i}2">√</td>
                                            <td class="signed" id="dogecoin_td${i}3">√</td>
                                            <td class="signed" id="dogecoin_td${i}4">√</td>
                                            <td class="signed" id="dogecoin_td${i}5">√</td>
                                            <td class="signed" id="dogecoin_td${i}6">√</td>
                                            <td class="signed" id="dogecoin_td${i}7">√</td>
                                            <td class="signed" id="dogecoin_td${i}8">√</td>
                                            <td class="signed" id="dogecoin_td${i}9">√</td>
                                            <td class="choosed"><input type="checkbox" name="dogecoin_tx_signs" value="${i}"></td>`;
            tbody1.appendChild(row);
            row.querySelector('td').appendChild(inp_copy);
            i++;
        })
        document.getElementById('dogecoin_tx_sign').dataset.id = i;
        let outputs = document.querySelectorAll('#dogecoin_tx_outs>.txOut');
        outputs.forEach((output) => {
            let amount = parseInt(output.querySelector('b').innerHTML.replace(/,/g, ''));
            if (amount > 0) {
                psbt.addOutput({
                    address: output.querySelector('span').getAttribute('title'),
                    value: amount
                });
            } else {//在比特币区块链上存储数据
                let content = Buffer.Buffer.from(output.querySelector('span').getAttribute('title'), 'utf8');
                let data = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, content]);
                psbt.addOutput({
                    script: data,
                    value: 0
                });
            }
        });
    })
    document.getElementById('dogecoin_private_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('dogecoin_tx_private').setAttribute('type', 'text');
    })

    document.getElementById('dogecoin_private_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('dogecoin_tx_private').setAttribute('type', 'password');
    })

    document.getElementById('dogecoin_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('dogecoin_tx_password').setAttribute('type', 'text');
    })

    document.getElementById('dogecoin_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('dogecoin_tx_password').setAttribute('type', 'password');
    })

    document.getElementById('dogecoin_tx_sign').addEventListener('click', async (ev) => {
        if (!psbt_bak) {
            psbt_bak = psbt.clone();
        }
        if (ev.target.dataset.id && ev.target.dataset.id == "0") {
            alert('No inputs to sign!');
            return;
        }
        let sign_inputs = document.querySelectorAll("input[name='dogecoin_tx_signs']:checked");
        if (sign_inputs.length == 0) {
            alert("Please select the input that needs to be signed!");
            return;
        }
        let private = document.getElementById('dogecoin_tx_private').value.trim();
        document.getElementById('dogecoin_tx_private').value = '****';
        if (private.length < 51) {
            alert('No private key entered or the private key is not valid!');
            return;
        }

        let ins = [];
        sign_inputs.forEach((e) => {
            ins.push(parseInt(e.value));
        })
        let inputs = document.querySelectorAll(".dogecoin_import_txIn");

        if (private.slice(0, 2) == '6P') {
            let password = document.getElementById('dogecoin_tx_password').value;
            if (password == '') {
                alert('The private key has been encrypted, but the password to protect the private key has not been provided!');
                private = null;
                //                closeModal();
                return;
            } else {
                try {
                    await openModal('Please wait, decrypting and signing…');
                    if (!bip38.verify(private)) {
                        throw new Error('Not a valid encrypted private key!');
                    }
                    let N = parseInt(document.getElementById('dogecoin_N_sign').value.trim());
                    let r = parseInt(document.getElementById('dogecoin_r_sign').value.trim());
                    let p = parseInt(document.getElementById('dogecoin_p_sign').value.trim());
                    let decryptKey = bip38.decrypt(private, password, null, { N: N, r: r, p: p });
                    private = wif.encode({ version: dogecoin_network.wif, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
                    closeModal();
                } catch (error) {
                    private = null;
                    closeModal();
                    alert(error);
                    return;
                };
            }
        }

        try {
            let keyPair = ECPair.fromWIF(private, dogecoin_network);
            ins.forEach((i) => {
                if (inputs[i].dataset.type == '5') {//P2TR地址
                    psbt.updateInput(i, { tapInternalKey: toXOnly(keyPair.publicKey) });
                    keyPair = tweakSigner(keyPair, { network: dogecoin_network });
                }
                psbt.signInput(i, keyPair);
            });
            keyPair = null;
        } catch (err) {
            private = null;
            alert(err);
            return;
        }
        private = null;
        ins.forEach((e) => {
            document.getElementById(`dogecoin_td${e}${sign_index}`).style.color = 'green';
        })

        sign_inputs.forEach((e) => {
            e.checked = false;
        })
        sign_index++;
        try {
            let signs = document.querySelector('#dogecoin_sign_table>tbody>tr').querySelectorAll('td[class="dogecoin_signed"').length;
            if (sign_index == signs) {
                document.querySelector(`#dogecoin_sign_table>thead>tr>th[colspan="${sign_index}"]`).setAttribute('colspan', `${sign_index + 1}`);
                let thNode = document.createElement('th');
                thNode.innerText = `${sign_index + 1}`;
                document.querySelectorAll('#dogecoin_sign_table>thead>tr')[1].appendChild(thNode);
                document.querySelectorAll('#dogecoin_sign_table>tbody>tr').forEach((e, i) => {
                    let tdNode = document.createElement("td");
                    tdNode.setAttribute('class', 'dogecoin_signed');
                    tdNode.setAttribute('id', `td${i}${sign_index}`);
                    tdNode.innerText = '√';
                    e.insertBefore(tdNode, e.querySelector('td[class="dogecoin_choosed"]'));
                });
            }
        } catch (err) {
            alert(err);
        }
    });


    document.getElementById('dogecoin_tx_delete_sign').addEventListener('click', (ev) => {
        if (psbt_bak) {
            psbt = psbt_bak.clone();
            document.querySelectorAll('#dogecoin_sign_table .signed').forEach(e => { e.style.color = 'white' });
            sign_index = 0;
        }
    });

    document.getElementById('dogecoin_output_tx_hex').addEventListener('click', (ev) => {
        if (!psbt) {
            alert("You haven't created a transaction!");
            return;
        }
        for (let i = 0; i < psbt.data.inputs.length; i++) {
            psbt.validateSignaturesOfInput(i, psbt.data.inputs[i].tapInternalKey ? validator_schnorr : validator);//验证签名
        }
        psbt.finalizeAllInputs();
        let tx = psbt.extractTransaction();
        document.getElementById('dogecoin_txHex_edit').innerText = tx.toHex();
        //        document.getElementById('txHex_edit').innerText = document.getElementById('tx_hex').innerText;
        let tx_fee = document.getElementById('dogecoin_tx_fee').innerHTML.replace(/,/g, '');
        document.getElementById('dec_fee').innerHTML = `Transaction's Id: ${tx.getId()}<span style="float: right">Fee: ${tx_fee} Satoshi (${document.getElementById('dogecoin_tx_fee_dollar').innerHTML} USD )</span>`;
    });

    document.getElementById('dogecoin_deconstruction_tx').addEventListener('click', (ev) => {
        let rawTx = document.getElementById('dogecoin_txHex_edit').value.trim();
        if (rawTx == '') {
            alert('Please enter the raw transaction Hex code first!');
            return;
        }
        document.getElementById('dis_raw_hex').innerHTML = rawTx;
        let tx = '';
        try {
            tx = bitcoin.Transaction.fromHex(rawTx);
        } catch (err) {
            alert(`Illegal transaction data\n${err}`);
            return;
        }

        if (document.getElementById('dec_fee').innerHTML == '') {
            document.getElementById('dec_fee').innerHTML = `Transaction's Id:${tx.getId()}`;
        }
        let deconstruction = `
                <tr>
                    <td colspan="4" style="vertical-align: top;">Version</td>
                    <td>${tx.version}<br><span style="font-size: 0.8rem; color: #aaa">${rawTx.slice(0, 8)}</span>
                    </td>
                </tr>`;
        let wids = '';
        if (rawTx.slice(8, 12) == '0001') {//隔离见证交易
            deconstruction = deconstruction + `
                <tr>
                    <td colspan="4">Marker</td>
                    <td>${rawTx.slice(8, 10)}</td>
                </tr>
                <tr>
                    <td colspan="4">Flag</td>
                    <td>${rawTx.slice(10, 12)}</td>
                </tr>`;
        } else {
            wids = 'width: 15rem;';
        }
        deconstruction = deconstruction + `
        <tr>
            <td colspan="4">Number of Inputs</td>
            <td>${tx.ins.length}</td>
        </tr>`;
        for (let i = 0; i < tx.ins.length; i++) {
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="${tx.ins[i].script.length > 0 ? 5 : 4}" style="width: 5rem;">${i + 1}th input</td>
                    <td colspan="3" style="vertical-align: top; ${wids}">Trans. id</td>
                    <td>${tx.ins[i].hash.toString('hex').replace(/(.{2})/g, "$1 ").split(" ").reverse().join("")}<br><span
                            style="font-size: 0.8rem; color: #aaa">${tx.ins[i].hash.toString('hex')}(Little-endian)</small>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">Output NO.</td>
                    <td>${tx.ins[i].index}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].index, 8)}</span></td>
                </tr>
                <tr>
                    <td colspan="3">Input script length</td>
                    <td>${tx.ins[i].script.length}</td>
                </tr>`;
            if (tx.ins[i].script.length > 0) {
                deconstruction = deconstruction + `
                    <tr>
                        <td colspan="3" style="vertical-align: top;">Input Script</td>
                        <td>${tx.ins[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.ins[i].script)}</span></td>
                    </tr>`;
            }
            deconstruction = deconstruction + `
            <tr>
                    <td colspan="3" style="vertical-align: top;">Sequence</td>
                    <td>${tx.ins[i].sequence}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].sequence, 8)} (Hexadecimal) </span></td>
                </tr>`;
        }
        deconstruction = deconstruction + `
            <tr>
            <td colspan="4">Number of Output</td>
            <td>${tx.outs.length}</td>
        </tr>`;
        for (let i = 0; i < tx.outs.length; i++) {
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="4">${i + 1}th output</td>
                    <td colspan="3" style="vertical-align: top;">${tx.outs[i].script[0] == 106 ? 'Data' : 'Addess'}</td>
                    <td>${output2address(tx.outs[i].script.toString('hex'), dogecoin_network)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">Value</td>
                    <td>${tx.outs[i].value}Satoshi<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.outs[i].value, 16)}</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">Output script length</td>
                    <td>${tx.outs[i].script.length}<br><span style="font-size: 0.8rem; color: #aaa">${tx.outs[i].script.length.toString(16)} (Hexadecimal) </span></td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">Output Script</td>
                    <td>${tx.outs[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.outs[i].script)}(Assembly format)</span></td>
                </tr>
        `;
        }
        let rows = 0;
        let end = '';
        if (rawTx.slice(8, 12) == '0001') {
            for (let i = 0; i < tx.ins.length; i++) {
                rows = rows + tx.ins[i].witness.length * 2 + 1;
                end = end + `
                    <td rowspan="${tx.ins[i].witness.length * 2 + 1}" style="width:3rem;">见证${i + 1}</td>
                    <td colspan="2" style="width:6rem">Number of Item</td>
                    <td>${tx.ins[i].witness.length}</td>
                </tr>`;
                for (let j = 0; j < tx.ins[i].witness.length; j++) {
                    end = end + `
                    <tr>
                        <td rowspan="2" style="width:2.5rem">Item ${j + 1}</td>
                        <td style="width:2rem">Length</td>
                        <td>${tx.ins[i].witness[j].length}</td>
                    </tr>
                    <tr>
                        <td>Data</td>
                        <td>${tx.ins[i].witness[j].toString('hex')}</td>
                    </tr>`;
                }
            }
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="${rows}">Witness</td>`;
        }

        deconstruction = deconstruction + end + `
                <tr>
                    <td colspan="4" style="vertical-align: top;">Locktime</td>
                    <td>${tx.locktime}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.locktime, 8)}</span></td>
                </tr>
        `;
        document.querySelector('#deconstruction_table>tbody').innerHTML = deconstruction;
        document.getElementById('dialog_deconstruction_rawtx').showModal();
    });

    document.getElementById('dogecoin_dispatch_tx').addEventListener('click', (ev) => {
        let tx_hex = document.getElementById('dogecoin_txHex_edit').value;
        if (tx_hex == '') {
            return;
        }
        dogecoin_broadcastTx(tx_hex);
    })

})

function dogecoin_recover_wallet() {
    const mnemonic = document.getElementById('dogecoin_mnemonic').value.trim();
    let privateKey = document.getElementById('dogecoin_new_privatekey').value.trim();

    if (!bip39.validateMnemonic(mnemonic, dogecoin_language) && !(privateKey.length == 52 && (privateKey.slice(0, 1) == 'T' || privateKey.slice(0, 1) == 'c')) && !bip38.verify(privateKey)) {
        alert("Enter at least one valid mnemonic, one valid plain text private key, or one valid encrypted private key.");
        return;
    }
    let hd_wallet = {};
    hd_wallet.path = '';
    let mnemonic_passwd;
    let passwd = '';
    if (privateKey != '') {
        if (bip38.verify(privateKey)) {
            const password = document.getElementById('dogecoin_new_private_password').value.trim();
            if (password == '') {
                alert('The decryption password for the private key must be entered!');
                return;
            }
            document.getElementById('dogecoin_mnemonic').value = '';
            document.getElementById('dogecoin_password').value = '';
            wallets.mnemonic = '';
            mnemonic_passwd = '';
            try {
                let N = parseInt(document.getElementById('N_id').value.trim());
                let r = parseInt(document.getElementById('r_id').value.trim());
                let p = parseInt(document.getElementById('p_id').value.trim());
                let decryptKey = bip38.decrypt(privateKey, password, null, { N: N, r: r, p: p });
                privateKey = wif.encode({ version: dogecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
            } catch (error) {
                private = null;
                alert(error);
                return;
            };
        }
        let ecpair = ECPair.fromWIF(privateKey, dogecoin_network);
        hd_wallet.publicKey = ecpair.publicKey;
        privateKey = ecpair.toWIF();
    } else {
        hd_wallet.path = document.getElementById('dogecoin_new_path').value.trim();//格式：m/44'/3'/i'/0|1/j/…'，i,j=1,2,3,...
        const regex = /^m\/44'\/[13]'\/(\d+)'\/([01])(?:\/(\d+))+$/;
        if (!regex.test(hd_wallet.path)) {
            alert("The wallet path format is incorrect!");
            return;
        }
        mnemonic_passwd = document.getElementById('dogecoin_password').value.trim();
        const seed = bip39.mnemonicToSeedSync(mnemonic, mnemonic_passwd);
        const root = bip32.BIP32Factory(bitcoinerlabsecp256k1).fromSeed(seed, dogecoin_network);
        const childNode = root.derivePath(hd_wallet.path);
        hd_wallet.publicKey = childNode.publicKey;

        privateKey = childNode.toWIF();

        passwd = document.getElementById('dogecoin_new_private_password').value.trim();
        if (passwd != '') {
            let N = parseInt(document.getElementById('N_id').value.trim());
            let r = parseInt(document.getElementById('r_id').value.trim());
            let p = parseInt(document.getElementById('p_id').value.trim());
            try {
                privateKey = bip38.encrypt(childNode.privateKey, true, passwd, null, { N: N, r: r, p: p });
            } catch (error) {
                passwd = '';
                alert(`Encrypting private key failed:${error}`);
            }
        }
    }
    const { address: address_p2pkh } = bitcoin.payments.p2pkh({ pubkey: hd_wallet.publicKey, network: dogecoin_network });
    document.getElementById('dogecoin_hd_wallet').innerHTML = `
    Mnemonic: ${mnemonic}<br>
    Private Key: ${privateKey}${passwd == '' ? '' : ' (The private key is protected by encryption)'}<br>
    Public Key: ${Array.from(hd_wallet.publicKey).map(byte => byte.toString(16).padStart(2, '0')).join('')}<br>
    Address: ${address_p2pkh} (P2PKH) <br>
    Path: ${hd_wallet.path}
    `;
}

async function dogecoin_getUtxo(address, isTestNetwork) {
    const url = isTestNetwork ? `https://doge-electrs-testnet-demo.qed.me/address/${address}/utxo` : `https://api.blockcypher.com/v1/doge/main/addrs/${address}?unspentOnly=true`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`API request failed, status code: ${res.status}`);
        }
        const data = await res.json();
        return data;
    } catch (err) {
        alert("Request error, please check whether the Dogecoin network is selected correctly!", err);
        return [];
    }
}

async function dogecoin_view_tx(tx_hash) {
    await openModal('Please wait, retrieving…');
    const reg = new RegExp(`.{1,${70}}`, 'g');
    dogecoin_getTxDetail(tx_hash, dogecoin_network == dogecoinTestnet, false).then((ret) => {
        let dialog = document.getElementById('wallet_dialog');
        dialog.querySelector('h3').innerHTML = `Query transaction ${tx_hash}`;
        dialog.querySelector('p').innerHTML = `Amount ${ret.total} satoshi, fee: ${ret.fee} satoshi, date: ${ret.confirmed}`;
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
            td1 = td1 + `Transfer to address:<br>Address type:<br>Amount:<br>Output script:<br>Output index:<br><br>`;
            td2 = td2 + `${outp.addresses[0]}<br>${outp.script_type}<br>${outp.value}<br>${outp.script}<br>${i}<br><br>`;
            i++;
        });
        dialog.querySelector('#tx_hd2').innerHTML = `${ret.outputs.length} outputs`;
        dialog.querySelector('#tx_td3').innerHTML = td1;
        dialog.querySelector('#tx_td4').innerHTML = td2;
        document.getElementById('view_raw_tx').style.visibility = 'hidden';
        closeModal();
        dialog.showModal();
    }).catch(err => {
        closeModal();
        alert(err);
    });
}


async function dogecoin_getTxDetail(txHash, isTestNetwork, isRaw) {
    /*
    For testnet:
    https://doge-electrs-testnet-demo.qed.me/tx/${txid}
    https://doge-electrs-testnet-demo.qed.me/tx/${txid}/hex
    d46072579b36a93d53448ff84cb8388080e842b00dd31dfdb4f04b6a68b9e21d
    For Mainnet:
    https://api.blockcypher.com/v1/doge/main/txs/${txid}
    https://api.blockcypher.com/v1/doge/main/txs/${txid}?includeHex=true
    3d66e1ec806c311cd4dd36c03c3b092fb41883f5ac139a4cf3f05eb305b103f7
    */
    isTestNetwork = isTestNetwork || false;
    isRaw = isRaw || false;
    let url = '';
    if (isTestNetwork) {
        url = isRaw ? `https://doge-electrs-testnet-demo.qed.me/tx/${txHash}/hex` : `https://doge-electrs-testnet-demo.qed.me/tx/${txHash}`;
    } else {
        url = isRaw ? `https://api.blockcypher.com/v1/doge/main/txs/${txHash}?includeHex=true` : `https://api.blockcypher.com/v1/doge/main/txs/${txHash}`;
    }
    const res = await fetch(url);
    if (isRaw) {
        if (isTestNetwork) {
            return await res.text();
        } else {
            let a = await res.json();
            return a.hex;
        }
    } else {
        return await res.json();
    }
}

async function dogecoin_broadcastTx(tx_hex) {
    await openModal('Please wait, publishing…');
    let url;
    let url2;
    if (dogecoin_network == dogecoinMainnet) {
        url = 'https://api.blockchair.com/doegcoin/push/transaction';//https://dogechain.info/api/v1/pushtx;https://api.blockcypher.com/v1/doge/main/txs/push;https://sochain.com/api/v2/send_tx/DOGE
        url2 = 'https://blockchair.com/dogecoin';
    } else {
        url = `https://sochain.com/api/v2/send_tx/DOGETEST`;
        url2 = 'https://blockchair.com/dogecoin/test';
    }
    let dis = document.getElementById('dogecoin_dispatch_result');
    dis.innerHTML = '';

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tx: tx_hex
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            closeModal();
            throw new Error(`Broadcast failed: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        if (data.status === "success") {
            dis.innerHTML = `The transaction has been posted!<br>Transaction ID: ${data.data.txid}<br>
    A few minutes later, you can use this transaction ID to check whether the transaction is completed at <a href="${url2}" target="_blank">${url2}</a>.`;
        } else {
            dis.innerHTML = `The transaction cannot be sent!<br>Reported error message: ${data}<br>Please check if your network can access the internet, or check if the "Litecoin Network" selection at the top right of the screen is correct.`;
        }
    } catch (error) {
        dis.innerHTML = `Transaction release failed!<br>${error.response ? error.response.data : error.message}. You can try again after a while, or copy it to another website to release.`;
    }

    document.getElementById('dogecoin_dispatch_tx').removeAttribute('disabled');
    closeModal();
}

function gen_redeem_script(pubKeys) {
    let pubKeys_arr = pubKeys.map(hex => Buffer.Buffer.from(hex, 'hex')).sort((a, b) => a.compare(b));
    if (pubKeys_arr.length < 2) { return };
    let signs = parseInt(document.getElementById('signs').value);
    let redeem_script = bitcoin.payments.p2ms({ m: signs, pubkeys: pubKeys_arr, network: bitcoin_network });
    document.getElementById('dogecoin_multi_redeem').value = bitcoin.script.toASM(redeem_script.output);
}