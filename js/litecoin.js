window.addEventListener("load", () => {

    document.getElementById('litecoin_configure_network').addEventListener('change', (ev) => {
        litecoin_network = ev.target.value == 0 ? litecoinMainnet : litecoinTestnet;
        document.getElementById('litecoin_new_path').value = `m/84'/${ev.target.value == 0 ? 2: 1}'/0'/0/0`;
        document.getElementById('litecoin_new_path').parentNode.querySelector('span').innerHTML = `(Note:
                                        The path m/84'/${ev.target.value == 0 ? 2: 1}'/i'/0/j indicates the j-th wallet in the i-th account, where
                                        i,j=0,1,2,…)`;
    });

    document.getElementById('litecoin_configure_rate').addEventListener('blur', (ev) => {
        litecoin_rate = parseFloat(ev.target.value.trim());
    });

    document.getElementById('litecoin_configure_fee').addEventListener('blur', (ev) => {
        litecoin_fee_dollars = parseFloat(ev.target.value.trim());
        litecoin_fee_litoshi = Math.round(litecoin_fee_dollars / litecoin_rate * 100000000);
        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
        let totalAmount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
        let tx_fee = parseInt(totalAmount) - parseInt(toOut);
        document.getElementById('litecoin_tx_fee_alarm').style.visibility = tx_fee < litecoin_fee_satoshi ? 'visible' : 'hidden';
        document.getElementById('litecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('litecoin_tx_fee_dollar').innerText = Math.round(tx_fee * litecoin_rate / 1000000) / 100;
        document.getElementById('litecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - litecoin_fee_litoshi) < 0 ? 0 : (tx_fee - litecoin_fee_litoshi));
    });

    document.getElementById('litecoin_configure_language').addEventListener('change', (ev) => {
        switch (ev.target.value) {
            case 'cn':
                litecoin_language = bip39.wordlists.chinese_simplified;
                break;
            case 'tw':
                litecoin_language = bip39.wordlists.chinese_traditional;
                break;
            case 'ja':
                litecoin_language = bip39.wordlists.japanese;
                break;
            case 'es':
                litecoin_language = bip39.wordlists.spanish;
                break;
            case 'fr':
                litecoin_language = bip39.wordlists.french;
                break;
            case 'it':
                litecoin_language = bip39.wordlists.italian;
                //                ethereum_language = wordlistsExtra.LangIt.wordlist("it");
                break;
            case 'ko':
                litecoin_language = bip39.wordlists.korean;
                break;
            case 'pt':
                litecoin_language = bip39.wordlists.portuguese;
                break;
            case 'cz':
                litecoin_language = bip39.wordlists.czech;
                break;
            default:
                litecoin_languagee = bip39.wordlists.english;
                break;
        }
    });

    document.getElementById('litecoin_mnemonic_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('litecoin_password').setAttribute('type', 'text');
    })
    document.getElementById('litecoin_mnemonic_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('litecoin_password').setAttribute('type', 'password');
    })

    document.getElementById('litecoin_new_wallet').addEventListener('click', async (ev) => {
        document.getElementById('litecoin_new_privatekey').value = '';
        document.getElementById('litecoin_mnemonic').value = bip84.generateMnemonic(parseInt(document.getElementById('litecoin_mnemonic_length').value) * 32 / 3, null, litecoin_language);
        await openModal('Please wait, processing...');
        litecoin_recover_wallet();
        closeModal();
    });

    document.getElementById('litecoin_recover_wallet').addEventListener('click', async (evt) => {
        await openModal('Please wait, processing...');
        litecoin_recover_wallet();
        closeModal();
    });

    document.getElementById('litecoin_new_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('litecoin_new_private_password').setAttribute('type', 'text');
        document.getElementById('litecoin_new_privatekey').setAttribute('type', 'text');
    })
    document.getElementById('litecoin_new_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('litecoin_new_private_password').setAttribute('type', 'password');
        document.getElementById('litecoin_new_privatekey').setAttribute('type', 'password');
    })

    document.getElementById('litecoin_reset_wallet').addEventListener('click', (evt) => {
        document.getElementById('litecoin_mnemonic_length').value = "24";
        document.getElementById('litecoin_mnemonic').value = '';
        document.getElementById('litecoin_password').value = '';
        document.getElementById('litecoin_hd_wallet').innerHTML = '';
        document.getElementById('litecoin_new_privatekey').value = '';
        document.getElementById('litecoin_new_path').value = `m/84'/${litecoin_network.wif == 0xb0 ? 2 : 1}'/0'/0/0`;
        document.getElementById('litecoin_new_path').nextSibling.innerHTML = `(Note: The path m/84'/${litecoin_network.wif == 0xb0 ? 2 : 1}'/i'/0/j indicates the j-th wallet in the i-th account, wherei,j=0、1、2、…)`;
        document.getElementById('litecoin_new_private_password').value = '';
    });

    document.getElementById('litecoin_fromWif_privateKey_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('litecoin_fromPrivateKey_private').setAttribute('type', 'text');
    })

    document.getElementById('litecoin_fromWif_privateKey_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('litecoin_fromPrivateKey_private').setAttribute('type', 'password');
    })

    document.getElementById('litecoin_fromWif_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('litecoin_fromWif_password').setAttribute('type', 'text');
    })

    document.getElementById('litecoin_fromWif_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('litecoin_fromWif_password').setAttribute('type', 'password');
    })

    document.getElementById('litecoin_fromPrivateKey_ok_btn').addEventListener('click', async (et) => {
        let pri_key = document.getElementById('litecoin_fromPrivateKey_private').value.trim();
        if (pri_key == '') {
            alert("Please input the private key!");
            return;
        }
        document.getElementById('litecoin_address_td1').innerHTML = '';
        document.getElementById('litecoin_address_td2').innerHTML = '';
        document.getElementById('litecoin_private_td1').innerHTML = '';
        document.getElementById('litecoin_private_td2').innerHTML = '';
        document.getElementById('litecoin_public_td1').innerHTML = '';
        document.getElementById('litecoin_public_td2').innerHTML = '';

        if (pri_key.slice(0, 2) == '6P') {
            let password = document.getElementById('litecoin_fromWif_password').value.trim();
            if (password == '') {
                alert('The private key has been encrypted, but no protection password for the private key has been provided!');
                pri_key = null;
                return;
            } else {
                try {
                    await openModal('Please wait, decrypting ...');
                    if (!bip38.verify(pri_key)) {
                        throw new Error('Not a valid encryption private key!');
                    }
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(pri_key, password, null, { N: N, r: r, p: p });
                    pri_key = wif.encode({ version: litecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
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
            //1. Generate various types of addresses:
            if (/^[0-9a-fA-F]{64}$/.test(pri_key)) {
                //                pri_key = ECPair.fromPrivateKey(Buffer.Buffer.from(pri_key, 'hex'), { network: network }).toWIF();
                pri_key = wif.encode({ version: litecoin_network.wif, privateKey: Buffer.Buffer.from(pri_key, 'hex'), compressed: true });
            }
            let keyPair = ECPair.fromWIF(pri_key, litecoin_network);
            if (!keyPair.compressed) {
                pri_key = wif.encode({ version: litecoin_network.wif, privateKey: wif.decode(pri_key, litecoin_network.wif).privateKey, compressed: true });
                keyPair = ECPair.fromWIF(pri_key, litecoin_network);
            }
            let { address: address_p2pkh } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: litecoin_network });
            let { address: address_p2wpkh } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: litecoin_network });

            // 下面产生p2sh-p2wpkh地址：
            const { address: address_p2sh_p2wpkh } = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({
                    pubkey: keyPair.publicKey,
                    network: litecoin_network
                }),
                network: litecoin_network,
            });

            let { address: address_p2tr } = bitcoin.payments.p2tr({
                pubkey: keyPair.publicKey.slice(1, 33),
                network: litecoin_network
            });
            document.getElementById('litecoin_address_td1').innerHTML = `P2TR address: <br>P2WPKH address: <br>P2SH-P2WPKH address: <br>P2PKH address: <br>`;
            document.getElementById('litecoin_address_td2').innerHTML = `${address_p2tr}(Key Path)<br>${address_p2wpkh}<br>${address_p2sh_p2wpkh}<br>${address_p2pkh}`;

            let rawPrivateKey = wif.decode(pri_key, litecoin_network.wif);
            let pri_compress = pri_key;
            let pri_uncompress = pri_key;
            if (rawPrivateKey.compressed) {
                pri_uncompress = wif.encode({ version: litecoin_network.wif, privateKey: rawPrivateKey.privateKey, compressed: false });
            } else {
                pri_compress = wif.encode({ version: litecoin_network.wif, privateKey: rawPrivateKey.privateKey, compressed: true });
            }
            let pri_raw = rawPrivateKey.privateKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            let pri_binary = '';
            rawPrivateKey.privateKey.forEach(b => { pri_binary += b.toString(2).padStart(8, '0'); });
            let pri_bs58 = bs58check.default.encode(rawPrivateKey.privateKey);
            document.getElementById('litecoin_private_td1').innerHTML = `Compressed WIF: <br>Uncompressed WIF: <br>Base58 codes: <br>Raw (Hexadecimal): <br>Raw (binary):`;
            document.getElementById('litecoin_private_td2').innerHTML = `${pri_compress}<br>${pri_uncompress}<br>${pri_bs58}<br>${pri_raw}<br><div style='width: 36rem; overflow-wrap: anywhere;'>${pri_binary}</div>`;

            let pub_compress = '';
            let pub_uncompress = '';
            if (keyPair.compressed) {
                pub_compress = keyPair.publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
                pub_uncompress = ECPair.fromWIF(pri_uncompress, litecoin_network).publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            }
            document.getElementById('litecoin_public_td1').innerHTML = `Compressed public key:<br>Uncompressed public key:<br>`;
            document.getElementById('litecoin_public_td2').innerHTML = `${pub_compress} (Public key generated by ECDSA algorithm - most common)<br>${pub_uncompress}`;

        } catch (error) {
            alert(error);
        }
    });

    document.getElementById('litecoin_fromPrivateKey_reset_btn').addEventListener('click', (ev) => {
        document.getElementById('litecoin_address_td1').innerHTML = '';
        document.getElementById('litecoin_address_td2').innerHTML = '';
        document.getElementById('litecoin_private_td1').innerHTML = '';
        document.getElementById('litecoin_private_td2').innerHTML = '';
        document.getElementById('litecoin_public_td1').innerHTML = '';
        document.getElementById('litecoin_public_td2').innerHTML = '';
        document.getElementById('litecoin_fromWif_password').value = '';
        document.getElementById('litecoin_fromPrivateKey_private').value = '';
    })

    document.getElementById('litecoin_wallet_balance_btn').addEventListener('click', async (et) => {
        let wallet_address = document.getElementById('litecoin_wallet_address').value.trim();
        if (wallet_address == '') {
            alert("Please enter the wallet address or transaction ID first.");
            return;
        }//bc1qujepl0k5n0ga2e86yskvxa6auehpf6dlf84dx0或者3Nntbr1ReGL4hCzgr8fGhFvKJvKzcAYENC或者7548329a72f9982bbe50fecad6fe9b4242877c75b1c950c3660b839e41f2e989
        if (wallet_address.length < 64) {
            if (!isValidAddress(wallet_address, litecoin_network)) {
                alert('Not a valid Litecoin address!');
                return;
            }
            await openModal('Please wait, fetching ...');
            litecoin_getUtxo(wallet_address, litecoin_network == litecoinTestnet).then((utxoes) => {
                let balance = utxoes.reduce((totalAmount, e) => totalAmount + e.value, 0);
                document.getElementById('litecoin_view_wallet_balance').innerHTML = `Balance: ${balance} Litoshi（${balance / 100000000} LTC）。There are a total of ${utxoes.length} UTXOs:`
                let ls = '';
                let ms = '';
                let rs = '';
                //                let i = 1;
                utxoes.forEach((b, i) => {
                    ls = ls + `<br>${i}<br><br><br>`;
                    //                    i++;
                    ms = ms + `tx_hash:<br>tx_output_n:<br>value:<br><br>`;
                    rs = rs + `<a href="javascript:litecoin_view_tx('${b.txid}')" style="text-decoration:none">${b.txid}</a><br>${b.vout}<br>${b.value} Litoshi<br><br>`;
                });
                document.getElementById('litecoin_view_wallet_td0').innerHTML = ls;
                document.getElementById('litecoin_view_wallet_td1').innerHTML = ms;
                document.getElementById('litecoin_view_wallet_td2').innerHTML = rs;
                closeModal();
            });
        } else {
            litecoin_view_tx(wallet_address, litecoin_network == litecoinTestnet);
        }
    });

    document.getElementById('litecoin_segment_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('litecoin_segment_password').setAttribute('type', 'text');
        document.getElementById('litecoin_segment_privateKey').setAttribute('type', 'text');
    })
    document.getElementById('litecoin_segment_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('litecoin_segment_password').setAttribute('type', 'password');
        document.getElementById('litecoin_segment_privateKey').setAttribute('type', 'password');
    })

    document.getElementById('litecoin_signature_btn').addEventListener('click', async (ev) => {
        const segmentText = document.getElementById('litecoin_segment_text').value.trim();
        if (segmentText == '') {
            alert('The signed text cannot be empty!');
            return;
        }
        let pri_wif = document.getElementById('litecoin_segment_privateKey').value.trim();
        if (pri_wif) {
            if (bip38.verify(pri_wif)) {//加了密的私钥
                const password = document.getElementById('litecoin_segment_password').value.trim();
                if (password == '') {
                    alert('You must enter the decryption password for the private key!');
                    return;
                }
                try {
                    await openModal('Please wait ....');
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(pri_wif, password, null, { N: N, r: r, p: p });
                    pri_wif = wif.encode({ version: litecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
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
                keyPair = ECPair.fromWIF(pri_wif, litecoin_network);
            } catch (err) {
                alert(err);
                return;
            }

            const types = document.getElementsByName('addressType');
            let addressType = 'p2pkh';
            for (const e of types) {
                if (e.checked) {
                    addressType = e.value;
                    break;
                }
            }
            let signature;
            if (addressType == 'p2pkh') {
                signature = bitcoinjsMessage.sign(
                    segmentText,
                    keyPair.privateKey,
                    keyPair.compressed,
                    litecoin_network.messagePrefix
                );
            } else {
                signature = bitcoinjsMessage.sign(
                    segmentText,
                    keyPair.privateKey,
                    keyPair.compressed,
                    litecoin_network.messagePrefix,
                    {
                        segwitType: addressType,
                        //                        extraEntropy: ethers.randomBytes(32)
                    }
                );
            }
            const signatureBase64 = signature.toString('base64');
            document.getElementById('litecoin_segment_result').value = signatureBase64;
        }
    })

    document.getElementById('litecoin_veify_btn').addEventListener('click', (ev) => {
        const segmentText = document.getElementById('litecoin_segment_text').value.trim();
        const signature = document.getElementById('litecoin_segment_result').value.trim();
        const p2wpkhAddress = document.getElementById('litecoin_segment_address').value.trim();
        if (!segmentText || !signature || !p2wpkhAddress) {
            alert("The signed text, signature and address must not be missing!");
            return;
        }
        let isValid;
        //        try {
        isValid = bitcoinjsMessage.verify(segmentText, p2wpkhAddress, signature, litecoin_network.messagePrefix);
        // } catch (err) {
        //     const decodedP2wpkh = bitcoin.address.fromBech32(p2wpkhAddress);
        //     const p2pkhAddress = bitcoin.address.toBase58Check(decodedP2wpkh.data, litecoin_network.pubKeyHash);
        //     isValid = bitcoinjsMessage.verify(segmentText, p2pkhAddress, signature, litecoin_network.messagePrefix);
        // }
        ev.target.parentNode.querySelector('#litecoin_segment_verify_result').style.visibility = 'visible';
        ev.target.parentNode.querySelector('#litecoin_segment_verify_result').setAttribute('src', isValid ? 'images/sign_ok.png' : 'images/sign_failed.png');

    });

    document.getElementById('litecoin_reset_btn').addEventListener('click', (ev) => {
        document.getElementById('litecoin_segment_verify_result').style.visibility = 'hidden';
        document.getElementById('litecoin_segment_text').value = '';
        document.getElementById('litecoin_segment_result').value = '';
        document.getElementById('litecoin_segment_address').value = '';
        document.getElementById('litecoin_segment_password').value = '';
        document.getElementById('litecoin_segment_privateKey').value = '';
    });

    document.getElementById('litecoin_tx_me_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        if (address.length < 34) { return };
        let address_type = document.getElementById('litecoin_tx_me_type');
        if (address.slice(0, 5) == 'ltc1q' || address.slice(0, 6) == 'tltc1q') {//为P2WPKH
            address_type.selectedIndex = 1;
        } else if ((address[0] == 'L' || address[0] == 'm' || address[0] == 'n') && address.length == 34) {//为P2PKH
            address_type.selectedIndex = 0;
        } else if ((address[0] == 'M' || address[0] == 'Q') && address.length == 34) {//为P2SH-P2WPKH
            address_type.selectedIndex = 3;
        } else if (address.slice(0, 5) == 'ltc1p' || address.slice(0, 6) == 'tltc1p') {//为P2TR
            address_type.selectedIndex = 2;
        } else {
            address_type.selectedIndex = 4;
        }
        document.getElementById('litecoin_tx_wallet_balance').innerHTML = '';
        document.getElementById('litecoin_tx_utxo_td0').innerHTML = '';
        document.getElementById('litecoin_tx_utxo_td1').innerHTML = '';
        address_type.dispatchEvent(new Event('change'));
    })

    document.getElementById('litecoin_tx_me_type').addEventListener('change', (ev) => {
        if (ev.target.value == 6) {
            document.getElementById('litecoin_redeem_script').style.display = 'block';
        } else {
            document.getElementById('litecoin_redeem_script').style.display = 'none';
        }
    })

    document.getElementById('litecoin_tx_he_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        if (address.length < 34) { return };
        let address_type = document.getElementById('litecoin_tx_he_type');
        if (address.slice(0, 4) == 'ltc1' || address.slice(0, 5) == 'tltc1') {//为P2WPKH
            address_type.selectedIndex = 1;
        } else if ((address[0] == 'L' || address[0] == 'm' || address[0] == 'n') && address.length == 34) {//为P2PKH
            address_type.selectedIndex = 0;
        } else if ((address[0] == 'M' || address[0] == 'Q') && address.length == 34) {//为P2SH-P2WPKH
            address_type.selectedIndex = 3;
        } else if (address.slice(0, 5) == 'ltc1p' || address.slice(0, 6) == 'tltc1p') {//为P2TR
            address_type.selectedIndex = 2;
        } else {
            address_type.selectedIndex = 5;
        }
    });

    document.getElementById('litecoin_tx_me_utxo').addEventListener('click', async (et) => {
        let wallet_address = document.getElementById('litecoin_tx_me_address').value.trim();
        if (wallet_address == '') {
            alert("Please enter the wallet address or transaction ID first.");
            return;
        }
        if (!isValidAddress(wallet_address, litecoin_network)) {
            alert('Not a valid Litecoin address!');
            return;
        }

        if (canFetchRawTX) {
            await openModal('Please hold on, fetching UTXO ...');
            litecoin_getUtxo(wallet_address, litecoin_network == litecoinTestnet).then((utxoes) => {
                let balance = utxoes.reduce((totalAmount, e) => totalAmount + e.value, 0);
                document.getElementById('tx_wallet_balance').innerHTML = `<br>Balance: ${balance} Litoshi (${balance / 100000000} LTC), there are a total of ${utxoes.length} UTXOs:`
                let ms = '';
                let rs = '';
                //            let i = 0;
                outx = utxoes;
                for (let i = 0; i < utxoes.length; i++) {
                    let b = outx[i];
                    //                ls = ls + `<p style="line-height: 37px;"><button data-i="${i}">花费</button></p><hr>`;
                    let uid = bitcoin.crypto.sha1(Buffer.Buffer.from(b.txid + b.vout)).slice(0, 5).toString('hex');
                    ms = ms + `TxID&nbsp;<br>output_no&nbsp;<br>balance&nbsp;<br><hr>`;
                    rs = rs + `<div data-uid='${uid}'>&nbsp;<a href="javascript:view_tx('${b.txid}')" style="text-decoration:none">${b.txid}</a><br>&nbsp;${b.vout}<br>&nbsp;${new Intl.NumberFormat('en-US').format(b.value)} Litoshi<button data-i=${i} class="litecoin_tx_btn_addInput" style="float: right;">Spend</button><span style="visibility: hidden;float: right;color: green;font-size: 1.5rem;margin-right: 10px;">√</span><br><hr></div>`;
                    //                i++;
                    //                if (i > 5) break;
                }
                document.getElementById('litecoin_tx_utxo_td0').innerHTML = ms;
                document.getElementById('litecoin_tx_utxo_td1').innerHTML = rs;
                //            document.getElementById('tx_utxo_td2').innerHTML = ls;
                document.querySelectorAll(".litecoin_tx_btn_addInput")?.forEach(btn => {
                    btn.addEventListener('click', (ev) => {
                        let addressType = document.getElementById('litecoin_tx_me_type').value;
                        let publicKey = '';
                        if (addressType == '2' || addressType == '4' || addressType == '6') {
                            let publicKeyObj = document.getElementById('litecoin_redeem_script');
                            if (!publicKeyObj) {
                                alert('For P2SH-P2WPKH addresses, a public key must be provided!');
                                return;
                            }
                            publicKey = publicKeyObj.querySelector('input').value.trim();
                        }
                        let sequence = document.getElementById('litecoin_tx_me_sequnce').value.trim();
                        let address = document.getElementById('litecoin_tx_me_address').value.trim();
                        let i = ev.target.dataset.i;
                        let inNode = document.createElement("div");
                        inNode.setAttribute('class', 'litecoin_txIn');
                        inNode.setAttribute('data-uid', ev.target.parentNode.dataset.uid);
                        inNode.setAttribute('data-type', document.getElementById('litecoin_tx_me_type').value);
                        inNode.setAttribute('data-redeem', publicKey);
                        inNode.innerHTML = `<span>TxID: </span><a href="javascript:view_tx('${outx[i].txid}')" style="text-decoration:none" title="${outx[i].txid}">${outx[i].txid}</a><br>
                    <span>SN.: </span><b class='output_index'>${outx[i].vout}</b><br><span>value: </span><b class='value'>${new Intl.NumberFormat('en-US').format(outx[i].value)}</b> Litoshi<br>
                    <span>Sequence: </span><b class='sequence'>${sequence}</b><br><span>Address: </span><code title="${address}">${address}</code><br><input type="image" src="images/delete.png" title="Delete"
                                style="float: right; padding: 2px;" class="litecoin_tx_in_delete">`;
                        let box_ins = document.getElementById('litecoin_tx_ins');
                        box_ins.appendChild(inNode);
                        let numb = parseInt(box_ins.dataset.number) + 1;
                        box_ins.dataset.number = `${numb}`;
                        if (numb > 1) {
                            document.getElementById('litecoin_tx_ins').parentNode.style.height = `${parseInt(document.getElementById('litecoin_tx_ins').parentNode.style.height) + 110}px`;
                        }

                        inNode.querySelector('input').addEventListener('click', (ev) => {
                            let val = ev.target.parentNode.querySelectorAll('b')[1].innerText.replace(/,/g, '');
                            let amount = document.getElementById('litecoin_tx_amount').innerText.replace(/,/g, '');
                            let totalAmount = parseInt(amount) - parseInt(val);
                            let formattedAmount = new Intl.NumberFormat('en-US').format(totalAmount);
                            document.getElementById('litecoin_tx_amount').innerText = formattedAmount;

                            let toOut = document.getElementById('litecoin_tx_itInput').innerText.replace(/,/g, '');
                            let tx_fee = totalAmount - parseInt(toOut);
                            document.getElementById('litecoin_tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
                            document.getElementById('litecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                            document.getElementById('litecoin_tx_fee_dollar').innerText = Math.round(tx_fee * litecoin_rate / 1000000) / 100;
                            document.getElementById('litecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
                            //                        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(amount) - parseInt(val)-fee);
                            let tar = document.querySelector("#litecoin_tx_utxo_td1>div[data-uid='" + ev.target.parentNode.dataset.uid + "']");
                            if (tar) {
                                tar.querySelector('span').style.visibility = 'hidden';
                                tar.querySelector('button').removeAttribute('disabled');
                            }
                            let i = parseInt(ev.target.parentNode.parentNode.dataset.number);
                            i--;
                            ev.target.parentNode.parentNode.dataset.number = `${i}`;
                            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
                            if (i > 1) {
                                document.getElementById('litecoin_tx_ins').parentNode.style.height = `${parseInt(document.getElementById('litecoin_tx_ins').parentNode.style.height) - 110}px`;
                            }
                        });

                        ev.target.parentNode.querySelector('span').style.visibility = 'visible';
                        ev.target.setAttribute('disabled', '');
                        let amount = document.getElementById('litecoin_tx_amount').innerText.replace(/,/g, '');
                        let totalAmount = parseInt(amount) + outx[i].value;
                        document.getElementById('litecoin_tx_amount').innerText = new Intl.NumberFormat('en-US').format(totalAmount);
                        let toOut = document.getElementById('litecoin_tx_itInput').innerText.replace(/,/g, '');
                        let tx_fee = totalAmount - parseInt(toOut);
                        document.getElementById('litecoin_tx_fee_alarm').style.visibility = tx_fee < litecoin_fee_litoshi ? 'visible' : 'hidden';
                        document.getElementById('litecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                        document.getElementById('litecoin_tx_fee_dollar').innerText = Math.round(tx_fee * litecoin_rate / 1000000) / 100;
                        document.getElementById('litecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - litecoin_fee_litoshi) < 0 ? 0 : (tx_fee - litecoin_fee_litoshi));
                    });
                })
                closeModal();
            }).catch(err => {
                document.getElementById('litecoin_no_network').style.display = 'block';
                closeModal();
                alert(err);
            });
        } else {
            document.getElementById('litecoin_no_network').style.display = 'block';
            alert("Cannot automatically retrieve UTXO, you need to input it manually!");
        }
    });

    document.getElementById('litecoin_tx_he_type').addEventListener('change', (ev) => {
        if (ev.target.value == '7') {//OP_RETURN
            document.getElementById('litecoin_op_return_data').style.display = 'block';
            //            document.getElementById('litecoin_tx_he_address').setAttribute('disabled', '');
            document.getElementById('litecoin_tx_he_amount').value = '0';
            document.getElementById('litecoin_tx_he_amount').setAttribute('disabled', '');
        } else {
            document.getElementById('litecoin_op_return_data').style.display = 'none';
            //            document.getElementById('litecoin_tx_he_address').removeAttribute('disabled');
            document.getElementById('litecoin_tx_he_amount').removeAttribute('disabled');
            document.getElementById('litecoin_tx_he_amount').value = '';
        }
    });

    document.getElementById('litecoin_tx_he_output').addEventListener('click', (ev) => {
        if (document.getElementById('litecoin_tx_he_type').value == '7') {//OP_RETURN
            let data = document.getElementById('litecoin_op_data').value.trim();
            if (data != '') {
                storage_data(data);
            } else {
                alert("You need to input the content stored on the Bitcoin chain!");
            }
            return;
        }
        let toAddress = document.getElementById('litecoin_tx_he_address').value.trim();
        if (toAddress == '') {
            alert("Please enter the other party's address!");
            return;
        }
        if (!isValidAddress(toAddress, litecoin_network)) {
            alert('Not a valid Bitcoin address!');
            return;
        }
        if (document.getElementById('litecoin_tx_he_amount').value.trim() == '') {
            alert('Please enter the amount to be credited!');
            return;
        }
        let toAmount = parseInt(document.getElementById('litecoin_tx_he_amount').value.trim());
        let tx_fee = document.getElementById('litecoin_tx_fee').innerText.replace(/,/g, '');
        if (toAmount > tx_fee) {
            alert("The other party's deposit is greater than the total amount!");
            return;
        }
        let inNode = document.createElement("div");
        inNode.setAttribute('class', 'txOut');
        inNode.innerHTML = `to Address: <span title='${toAddress}'>${toAddress}</span><br>value: <b>${new Intl.NumberFormat('en-US').format(toAmount)}</b> Litoshi<br><input type="image" src="images/delete.png" title="Delete"
                    style="float: right; padding: 2px;" class="litecoin_tx_in_delete">`;
        document.getElementById('litecoin_tx_outs').appendChild(inNode);
        let toOut = document.getElementById('litecoin_tx_itInput').innerText.replace(/,/g, '');
        let outAmount = parseInt(toOut) + toAmount;
        document.getElementById('litecoin_tx_itInput').innerText = new Intl.NumberFormat('en-US').format(outAmount);
        tx_fee = parseInt(tx_fee) - toAmount;
        document.getElementById('litecoin_tx_fee_alarm').style.visibility = tx_fee < litecoin_fee_litoshi ? 'visible' : 'hidden';
        document.getElementById('litecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('litecoin_tx_fee_dollar').innerText = Math.round(tx_fee * litecoin_rate / 1000000) / 100;
        document.getElementById('litecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - litecoin_fee_litoshi) < 0 ? 0 : (tx_fee - litecoin_fee_litoshi));

        inNode.querySelector('input').addEventListener('click', (ev) => {
            let val = ev.target.parentNode.querySelector('b').innerText.replace(/,/g, '');
            let tx_fee = document.getElementById('litecoin_tx_fee').innerText.replace(/,/g, '');
            let toOut = document.getElementById('litecoin_tx_itInput').innerText.replace(/,/g, '');
            tx_fee = parseInt(tx_fee) + parseInt(val);
            document.getElementById('litecoin_tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
            document.getElementById('litecoin_tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
            document.getElementById('litecoin_tx_fee_dollar').innerText = Math.round(tx_fee * litecoin_rate / 1000000) / 100;
            document.getElementById('litecoin_tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
            document.getElementById('litecoin_tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(toOut) - parseInt(val));
            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
        });
        document.getElementById('litecoin_tx_he_address').value = '';
        document.getElementById('litecoin_tx_he_amount').value = '';
    })

    document.getElementById('litecoin_import_input').addEventListener('click', (ev) => {
        let txInputs = document.querySelectorAll('#litecoin_tx_ins>div');
        if (txInputs.length < 1) {
            alert('No input available for signing!');
            return;
        }
        sign_index = 0;
        let tbody1 = document.querySelector('#litecoin_sign_table>tbody');
        tbody1.innerHTML = '';
        let i = 0;

        psbt = psbt_bak = null;
        psbt = new bitcoin.Psbt({ network: litecoin_network });
        psbt.setVersion(parseInt(document.getElementById('litecoin_tx_version').value));
        psbt.setLocktime(parseInt(document.getElementById('litecoin_tx_locktime').value));

        txInputs.forEach((inp) => {
            let inp_copy = inp.cloneNode(true);
            inp_copy.removeChild(inp_copy.querySelector('input'));
            inp_copy.setAttribute('class', 'litecoin_import_txIn');
            psbt_addInput(inp_copy);
            let row = document.createElement('tr');
            row.innerHTML = `               <td></td>
                                            <td class="signed" id="litecoin_td${i}0">√</td>
                                            <td class="signed" id="litecoin_td${i}1">√</td>
                                            <td class="signed" id="litecoin_td${i}2">√</td>
                                            <td class="signed" id="litecoin_td${i}3">√</td>
                                            <td class="signed" id="litecoin_td${i}4">√</td>
                                            <td class="signed" id="litecoin_td${i}5">√</td>
                                            <td class="signed" id="litecoin_td${i}6">√</td>
                                            <td class="signed" id="litecoin_td${i}7">√</td>
                                            <td class="signed" id="litecoin_td${i}8">√</td>
                                            <td class="signed" id="litecoin_td${i}9">√</td>
                                            <td class="choosed"><input type="checkbox" name="litecoin_tx_signs" value="${i}"></td>`;
            tbody1.appendChild(row);
            row.querySelector('td').appendChild(inp_copy);
            i++;
        })
        document.getElementById('litecoin_tx_sign').dataset.id = i;
        let outputs = document.querySelectorAll('#litecoin_tx_outs>.txOut');
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
    document.getElementById('litecoin_private_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('litecoin_tx_private').setAttribute('type', 'text');
    })

    document.getElementById('litecoin_private_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('litecoin_tx_private').setAttribute('type', 'password');
    })

    document.getElementById('litecoin_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('litecoin_tx_password').setAttribute('type', 'text');
    })

    document.getElementById('litecoin_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('litecoin_tx_password').setAttribute('type', 'password');
    })

    document.getElementById('litecoin_tx_sign').addEventListener('click', async (ev) => {
        if (!psbt_bak) {
            psbt_bak = psbt.clone();
        }
        if (ev.target.dataset.id && ev.target.dataset.id == "0") {
            alert('No input available for signing!');
            return;
        }
        let sign_inputs = document.querySelectorAll("input[name='litecoin_tx_signs']:checked");
        if (sign_inputs.length == 0) {
            alert("Please select the input that needs to be signed!");
            return;
        }
        let private = document.getElementById('litecoin_tx_private').value.trim();
        document.getElementById('litecoin_tx_private').value = '****';
        if (private.length < 51) {
            alert('No private key entered or it is not a valid private key!');
            return;
        }

        let ins = [];
        sign_inputs.forEach((e) => {
            ins.push(parseInt(e.value));
        })
        let inputs = document.querySelectorAll(".litecoin_import_txIn");

        if (private.slice(0, 2) == '6P') {
            let password = document.getElementById('litecoin_tx_password').value;
            if (password == '') {
                alert('The private key has been encrypted, but no protection password for the private key has been provided!');
                private = null;
                //                closeModal();
                return;
            } else {//私钥被密码保护，需要解密
                try {
                    await openModal('Please wait, decrypting and signing ...');
                    if (!bip38.verify(private)) {
                        throw new Error('Not a valid encryption private key!');
                    }
                    let N = parseInt(document.getElementById('litecoin_N_sign').value.trim());
                    let r = parseInt(document.getElementById('litecoin_r_sign').value.trim());
                    let p = parseInt(document.getElementById('litecoin_p_sign').value.trim());
                    let decryptKey = bip38.decrypt(private, password, null, { N: N, r: r, p: p });
                    private = wif.encode({ version: litecoin_network.wif, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
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
            let keyPair = ECPair.fromWIF(private, litecoin_network);
            ins.forEach((i) => {
                if (inputs[i].dataset.type == '5') {//P2TR地址
                    psbt.updateInput(i, { tapInternalKey: toXOnly(keyPair.publicKey) });
                    keyPair = tweakSigner(keyPair, { network: litecoin_network });
                }
                psbt.signInput(i, keyPair);
            });
            keyPair = null;
        } catch (err) {
            private = null;
            //            closeModal();
            alert(err);
            //            document.getElementById("run_dog").style.visibility = "hidden";
            return;
        }
        private = null;
        //        keyPair = null;
        //        document.getElementById("run_dog").style.visibility = "hidden";
        ins.forEach((e) => {
            document.getElementById(`litecoin_td${e}${sign_index}`).style.color = 'green';
        })

        sign_inputs.forEach((e) => {
            e.checked = false;
        })
        sign_index++;
        try {
            let signs = document.querySelector('#litecoin_sign_table>tbody>tr').querySelectorAll('td[class="litecoin_signed"').length;
            if (sign_index == signs) {
                document.querySelector(`#litecoin_sign_table>thead>tr>th[colspan="${sign_index}"]`).setAttribute('colspan', `${sign_index + 1}`);
                let thNode = document.createElement('th');
                thNode.innerText = `${sign_index + 1}`;
                document.querySelectorAll('#litecoin_sign_table>thead>tr')[1].appendChild(thNode);
                document.querySelectorAll('#litecoin_sign_table>tbody>tr').forEach((e, i) => {
                    let tdNode = document.createElement("td");
                    tdNode.setAttribute('class', 'litecoin_signed');
                    tdNode.setAttribute('id', `td${i}${sign_index}`);
                    tdNode.innerText = '√';
                    e.insertBefore(tdNode, e.querySelector('td[class="litecoin_choosed"]'));
                });
            }
            //            closeModal();
        } catch (err) {
            //            closeModal();
            alert(err);
        }
    });


    document.getElementById('litecoin_tx_delete_sign').addEventListener('click', (ev) => {
        //        document.getElementById('import_input').dispatchEvent(new Event('click'));
        if (psbt_bak) {
            psbt = psbt_bak.clone();
            document.querySelectorAll('#litecoin_sign_table .signed').forEach(e => { e.style.color = 'white' });
            sign_index = 0;
        }
    });

    document.getElementById('litecoin_output_tx_hex').addEventListener('click', (ev) => {
        if (!psbt) {
            alert('You have not created a transaction!');
            return;
        }
        for (let i = 0; i < psbt.data.inputs.length; i++) {
            psbt.validateSignaturesOfInput(i, psbt.data.inputs[i].tapInternalKey ? validator_schnorr : validator);//验证签名
        }
        psbt.finalizeAllInputs();
        let tx = psbt.extractTransaction();
        document.getElementById('litecoin_txHex_edit').innerText = tx.toHex();
        //        document.getElementById('txHex_edit').innerText = document.getElementById('tx_hex').innerText;
        let tx_fee = document.getElementById('litecoin_tx_fee').innerHTML.replace(/,/g, '');
        document.getElementById('dec_fee').innerHTML = `TxId: ${tx.getId()}<span style="float: right">Fee: ${tx_fee} Litoshi（${document.getElementById('litecoin_tx_fee_dollar').innerHTML} US dollars）</span>`;
    });

    document.getElementById('litecoin_deconstruction_tx').addEventListener('click', (ev) => {
        let rawTx = document.getElementById('litecoin_txHex_edit').value.trim();
        if (rawTx == '') {
            alert('Please enter the original transaction Hex code first!');
            return;
        }
        //        document.getElementById('litecoin_dispatch_raw_hex').innerText = rawTx;
        //        document.getElementById('litecoin_dispatch_result').parentNode.style.visibility = 'hidden';
        //        document.getElementById('litecoin_dispatch_tx').removeAttribute('disabled');
        document.getElementById('dis_raw_hex').innerHTML = rawTx;
        let tx = '';
        try {
            tx = bitcoin.Transaction.fromHex(rawTx);
        } catch (err) {
            alert(`Illegal trading data\n${err}`);
            return;
        }

        if (document.getElementById('dec_fee').innerHTML == '') {
            document.getElementById('dec_fee').innerHTML = `TxId: ${tx.getId()}`;
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
            <td colspan="4">Number of input</td>
            <td>${tx.ins.length}</td>
        </tr>`;
        for (let i = 0; i < tx.ins.length; i++) {
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="${tx.ins[i].script.length > 0 ? 5 : 4}" style="width: 5rem;"> <i>${i + 1}</i>th input</td>
                    <td colspan="3" style="vertical-align: top; ${wids}">Txid</td>
                    <td>${tx.ins[i].hash.toString('hex').replace(/(.{2})/g, "$1 ").split(" ").reverse().join("")}<br><span
                            style="font-size: 0.8rem; color: #aaa">${tx.ins[i].hash.toString('hex')}(Little-endian)</small>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">Output_n</td>
                    <td>${tx.ins[i].index}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].index, 8)}</span></td>
                </tr>
                <tr>
                    <td colspan="3">length of input script</td>
                    <td>${tx.ins[i].script.length}</td>
                </tr>`;
            if (tx.ins[i].script.length > 0) {
                deconstruction = deconstruction + `
                    <tr>
                        <td colspan="3" style="vertical-align: top;">Output script</td>
                        <td>${tx.ins[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.ins[i].script)}</span></td>
                    </tr>`;
            }
            deconstruction = deconstruction + `
            <tr>
                    <td colspan="3" style="vertical-align: top;">Sequence</td>
                    <td>${tx.ins[i].sequence}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].sequence, 8)}(hexadecimal)</span></td>
                </tr>`;
        }
        deconstruction = deconstruction + `
            <tr>
            <td colspan="4">Number of output</td>
            <td>${tx.outs.length}</td>
        </tr>`;
        for (let i = 0; i < tx.outs.length; i++) {
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="4"><i>${i + 1}</i>th output</td>
                    <td colspan="3" style="vertical-align: top;">${tx.outs[i].script[0] == 106 ? 'data' : 'address'}</td>
                    <td>${output2address(tx.outs[i].script.toString('hex'), litecoin_network)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">value</td>
                    <td>${tx.outs[i].value} Litoshi <br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.outs[i].value, 16)}</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">Length of output script</td>
                    <td>${tx.outs[i].script.length}<br><span style="font-size: 0.8rem; color: #aaa">${tx.outs[i].script.length.toString(16)}(hexadecimal)</span></td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">output script</td>
                    <td>${tx.outs[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.outs[i].script)}(Assembly)</span></td>
                </tr>
        `;
        }
        let rows = 0;
        let end = '';
        if (rawTx.slice(8, 12) == '0001') {//存在隔离见证
            for (let i = 0; i < tx.ins.length; i++) {
                rows = rows + tx.ins[i].witness.length * 2 + 1;
                end = end + `
                    <td rowspan="${tx.ins[i].witness.length * 2 + 1}" style="width:3rem;">witness ${i + 1}</td>
                    <td colspan="2" style="width:6rem">number of item</td>
                    <td>${tx.ins[i].witness.length}</td>
                </tr>`;
                for (let j = 0; j < tx.ins[i].witness.length; j++) {
                    end = end + `
                    <tr>
                        <td rowspan="2" style="width:50px">item${j + 1}</td>
                        <td style="width:60px">length</td>
                        <td>${tx.ins[i].witness[j].length}</td>
                    </tr>
                    <tr>
                        <td>data</td>
                        <td>${tx.ins[i].witness[j].toString('hex')}</td>
                    </tr>`;
                }
            }
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="${rows}">witness</td>`;
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

    document.getElementById('litecoin_dispatch_tx').addEventListener('click', (ev) => {
        let tx_hex = document.getElementById('litecoin_txHex_edit').value;
        if (tx_hex == '') {
            return;
        }
        litecoin_broadcastTx(tx_hex);
    })

})


function litecoin_recover_wallet() {
    const mnemonic = document.getElementById('litecoin_mnemonic').value.trim();
    let privateKey = document.getElementById('litecoin_new_privatekey').value.trim();

    //    var rootNode;
    if (!bip39.validateMnemonic(mnemonic, litecoin_language) && !(privateKey.length == 52 && (privateKey.slice(0, 1) == 'T' || privateKey.slice(0, 1) == 'c')) && !bip38.verify(privateKey)) {
        alert("Please enter at least one valid mnemonic, a valid plain text private key, or a valid encrypted private key.");
        return;
    }
    let hd_wallet = {};
    hd_wallet.path = '';
    let mnemonic_passwd;
    let passwd = '';
    if (privateKey != '') {//从私钥恢复钱包
        if (bip38.verify(privateKey)) {//加了密的私钥
            const password = document.getElementById('litecoin_new_private_password').value.trim();
            if (password == '') {
                alert('You must enter the decryption password for the private key!');
                return;
            }
            document.getElementById('litecoin_mnemonic').value = '';
            document.getElementById('litecoin_password').value = '';
            wallets.mnemonic = '';
            mnemonic_passwd = '';
            try {
                let N = parseInt(document.getElementById('N_id').value.trim());
                let r = parseInt(document.getElementById('r_id').value.trim());
                let p = parseInt(document.getElementById('p_id').value.trim());
                let decryptKey = bip38.decrypt(privateKey, password, null, { N: N, r: r, p: p });
                privateKey = wif.encode({ version: litecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
            } catch (error) {
                private = null;
                alert(error);
                return;
            };
        }
        let ecpair = ECPair.fromWIF(privateKey, litecoin_network);
        hd_wallet.publicKey = ecpair.publicKey;
        privateKey = ecpair.toWIF();
    } else {//从助记词恢复钱包
        hd_wallet.path = document.getElementById('litecoin_new_path').value.trim();//格式：m/84'/2'/i'/0|1/j/…'，i,j=1,2,3,...
        const regex = /^m\/84'\/[12]'\/(\d+)'\/([01])(?:\/(\d+))+$/;
        if (!regex.test(hd_wallet.path)) {
            alert("The wallet path format is incorrect!");
            return;
        }
        mnemonic_passwd = document.getElementById('litecoin_password').value.trim();

        // 1. 从助记词生成种子
        const seed = bip39.mnemonicToSeedSync(mnemonic, mnemonic_passwd);

        // 2. 从种子生成主节点
        const root = bip32.BIP32Factory(bitcoinerlabsecp256k1).fromSeed(seed, litecoin_network);

        // 3. 根据BIP44路径派生莱特币账户
        const childNode = root.derivePath(hd_wallet.path);
        hd_wallet.publicKey = childNode.publicKey;

        // 4. 获取私钥和地址
        privateKey = childNode.toWIF();

        passwd = document.getElementById('litecoin_new_private_password').value.trim();
        if (passwd != '') {//需要加密私钥
            let N = parseInt(document.getElementById('N_id').value.trim());
            let r = parseInt(document.getElementById('r_id').value.trim());
            let p = parseInt(document.getElementById('p_id').value.trim());
            //            privateKey = Uint8Array.from(Buffer.Buffer.from(hd_wallet.privateKey.slice(2), 'hex'));
            try {
                privateKey = bip38.encrypt(childNode.privateKey, true, passwd, null, { N: N, r: r, p: p });
            } catch (error) {
                passwd = '';
                alert(`Encrypting private key failed:${error}`);
            }
        }
    }
    //    const { address: address_p2pkh } = litecoin.payments.p2pkh({ pubkey: hd_wallet.publicKey, network: litecoin_network });
    const { address: address_p2wpkh } = bitcoin.payments.p2wpkh({ pubkey: hd_wallet.publicKey, network: litecoin_network });
    document.getElementById('litecoin_hd_wallet').innerHTML = `
    <span style="color:gray;width: 90px;display: inline-block;text-align: right;">Mnemonic:</span> ${mnemonic}<br>
    <span style="color:gray;width: 90px;display: inline-block;text-align: right;">Private Key:</span> ${privateKey}${passwd == '' ? '' : ' (The private key is protected by encryption)'}<br>
    <span style="color:gray;width: 90px;display: inline-block;text-align: right;">Public Key:</span> ${Array.from(hd_wallet.publicKey).map(byte => byte.toString(16).padStart(2, '0')).join('')}<br>
    <span style="color:gray;width: 90px;display: inline-block;text-align: right;">Address:</span> ${address_p2wpkh}（P2WPKH）<br>
    <span style="color:gray;width: 90px;display: inline-block;text-align: right;">Path:</span> ${hd_wallet.path}
    `;
}

async function litecoin_getUtxo(address, isTestNetwork) {
    //主网地址：ltc1qr07zu594qf63xm7l7x6pu3a2v39m2z6hh5pp4t 有utxo
    //测试网地址：n2s5GjRQQXp8Mti2S1NpGtH86MqcnSAWDv、tltc1qpjay39ntltfg5umy0wt5l3xhxgxkr7rfa2a7dr
    //主网：  https://api.blockcypher.com/v1/ltc/main/addrs/${address}?unspentOnly=true
    //       https://litecoinspace.org/api/address/{address}/utxo
    //测试网：https://api.blockcypher.com/v1/ltc/test3/addrs/${address}?unspentOnly=true
    //       https://litecoinspace.org/testnet/api/address/{address}/utxo

    const url = isTestNetwork ? `https://litecoinspace.org/testnet/api/address/${address}/utxo` : `https://litecoinspace.org/api/address/${address}/utxo`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`API request failed, status code: ${res.status}`);
        }
        const data = await res.json();
        return data;
    } catch (err) {
        alert("Request error:", err);
        return [];
    }
    /*
        const apiUrl = `https://api.blockcypher.com/v1/ltc/${isTestNetwork ? 'test3' : 'main'}/addrs/${address}?unspentOnly=true`;
        try {
            const response = await fetch(apiUrl);
    
            if (!response.ok) {
                throw new Error(`API请求失败，状态码: ${response.status}`);
            }
    
            const data = await response.json();
    
            return data;
    
        } catch (error) {
            console.error('查询UTXO时发生错误:', error);
            return [];
        }
    */
}

async function litecoin_view_tx(tx_hash) {
    await openModal('Please wait, retrieving ...');
    const reg = new RegExp(`.{1,${70}}`, 'g');
    litecoin_getTxDetail(tx_hash, litecoin_network == litecoinTestnet, false).then((ret) => {
        let dialog = document.getElementById('wallet_dialog');
        dialog.querySelector('h3').innerHTML = `Query transaction ${tx_hash}`;
        dialog.querySelector('p').innerHTML = `value: ${ret.total} Litoshi, Fee: ${ret.fees} Litoshi, Date: ${ret.confirmed}`;
        let td1 = '';
        let td2 = '';
        let input_script = '';
        let i = 0;
        ret.inputs = ret.inputs || [];
        ret.inputs.forEach(inp => {
            td1 = td1 + 'TxID: <br>Output_n: <br>Output script:';
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
            td1 = td1 + '<br>value: <br> from Address: <br>Type of address: <br>Witness: <br>';
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
            td1 = td1 + `to Adress: <br>Type of address: <br>value: <br>Output script: <br>Output_n: <br><br>`;
            td2 = td2 + `${outp.addresses[0]}<br>${outp.script_type}<br>${outp.value}<br>${outp.script}<br>${i}<br><br>`;
            i++;
        });
        dialog.querySelector('#tx_hd2').innerHTML = `${ret.outputs.length}个输出`;
        dialog.querySelector('#tx_td3').innerHTML = td1;
        dialog.querySelector('#tx_td4').innerHTML = td2;
        document.getElementById('view_raw_tx').style.visibility = 'hidden';
        closeModal();
        dialog.showModal();
    });
    //    console.log(tx_hash);
}


async function litecoin_getTxDetail(txHash, isTestNetwork, isRaw) {
    /*
    For testnet:
    https://api.blockcypher.com/v1/ltc/test3/txs/{txid}?includeHex=true
    https://litecoinspace.org/testnet/api/tx/<txid>/hex
    For Mainnet:
    https://api.blockcypher.com/v1/ltc/main/txs/2e849a6224fa717a5bae1447b25a790f70250c4729aa47365517d89679d7b092?includeHex=true
    https://api.blockcypher.com/v1/ltc/main/txs/${utxo.tx_hash}?includeHex=true
    13d3cad5c05dbf29eabe4def25aae6bba8731dbe86ea724e3411376111625f84
    */
    isTestNetwork = isTestNetwork || false;
    isRaw = isRaw || false;
    let url = '';
    if (isTestNetwork) {
        url = isRaw ? `https://litecoinspace.org/testnet/api/tx/${txHash}/hex` : `https://litecoinspace.org/testnet/api/tx/${txHash}`;
    } else {
        url = isRaw ? `https://api.blockcypher.com/v1/ltc/main/txs/${txHash}?includeHex=true` : `https://api.blockcypher.com/v1/ltc/main/txs/${txHash}`;
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

async function litecoin_broadcastTx(tx_hex) {
    await openModal('Please wait, Broadcasting ...');
    let url;
    let url2;
    if (litecoin_network == litecoinMainnet) {
        url = 'https://api.blockcypher.com/v1/ltc/main/txs/push';//https://sochain.com/api/v2/send_tx/LTC;
        url2 = 'https://blockchair.com/litecoin';
    } else {
        url = `https://api.blockcypher.com/v1/ltc/test3/txs/push`;
        url2 = 'https://blockchair.com/litecoin/test';
    }
    let dis = document.getElementById('litecoin_dispatch_result');
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
            dis.innerHTML = `The transaction has been published!<br>TxId: ${data.data.txid}<br>
    You can use this transaction ID to check whether the transaction is completed on the <a href="${url2}" target="_blank">${url2}</a> in a few minutes.`;
        } else {
            dis.innerHTML = `The transaction cannot be sent! <br>Feedback error message: ${data}<br>Please check if the network can access the internet, or check if the 'Litecoin Network' selection in the top right corner of the screen is correct.`;
        }
    } catch (error) {
        dis.innerHTML = `Transaction release failed!<br>${error.response ? error.response.data : error.message}. You can try again in a while, or copy it to another website to publish.`;
    }

    //    dis.parentNode.style.visibility = 'visible';
    document.getElementById('litecoin_dispatch_tx').removeAttribute('disabled');
    closeModal();
}