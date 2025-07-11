window.addEventListener("load", (evt) => {
    document.getElementById('select_language').addEventListener('change', (evt) => {
        let pathname = '';
        if (evt.target.value == "en") {
            let path = location.pathname.split('/');
            path.pop();
            path.pop();
            pathname = path.join('/');
        } else {
            let path = location.pathname.split('/');
            path.pop();
            path.push('zh');
            pathname = path.join('/');
        }
        localStorage.setItem('lang', evt.target.value);
        window.open(location.origin + pathname + '/index.html', '_self');
    })

    document.getElementById('choose_net').addEventListener('click', (ev) => {
        isTestNet_bitcoin = true;
        switch (parseInt(document.getElementById('bitcoin_gloabal_pars').querySelector('select').value)) {
            case 0: network = bitcoin.networks.bitcoin;
                isTestNet_bitcoin = false;
                break;
            case 1: network = bitcoin.networks.testnet;
                break;
            case 2: network = bitcoin.networks.regtest;
                break;
            default: break;
        }
        wallets.path = `m/84'/${isTestNet_bitcoin ? '1' : '0'}${wallets.path.slice(7)}`;
        switch (document.getElementById('grobal_pars_language').value) {
            case 'cn':
                bitcoin_language = bip39.wordlists.chinese_simplified;
                ethereum_language = wordlistsExtra.LangZh.wordlist("cn");
                break;
            case 'tw':
                bitcoin_language = bip39.wordlists.chinese_traditional;
                ethereum_language = wordlistsExtra.LangZh.wordlist("tw");
                break;
            case 'ja':
                bitcoin_language = bip39.wordlists.japanese;
                ethereum_language = wordlistsExtra.LangJa.wordlist("ja");
                break;
            case 'es':
                bitcoin_language = bip39.wordlists.spanish;
                ethereum_language = wordlistsExtra.LangEs.wordlist("es");
                break;
            case 'fr':
                bitcoin_language = bip39.wordlists.french;
                ethereum_language = wordlistsExtra.LangFr.wordlist("fr");
                break;
            case 'it':
                bitcoin_language = bip39.wordlists.italian;
                ethereum_language = wordlistsExtra.LangIt.wordlist("it");
                break;
            case 'ko':
                bitcoin_language = bip39.wordlists.korean;
                ethereum_language = wordlistsExtra.LangKo.wordlist("ko");
                break;
            case 'pt':
                bitcoin_language = bip39.wordlists.portuguese;
                ethereum_language = wordlistsExtra.LangPt.wordlist("pt");
                break;
            case 'cz':
                bitcoin_language = bip39.wordlists.czech;
                ethereum_language = wordlistsExtra.LangCz.wordlist("cz");
                break;
            default:
                bitcoin_language = bip39.wordlists.english;
                ethereum_language = ethers.wordlists.en;
                break;
        }

        bitcoin_rate = parseFloat(document.getElementById('bitcoin_gloabal_pars').querySelector('input').value.trim());
        fee = Math.ceil(100000000 / bitcoin_rate) * fee_dollars;
        document.getElementById('fee').innerText = fee;
        document.getElementById('fee_dollars').innerText = fee_dollars;
        document.getElementById('cover_crypto').style.visibility = 'visible';
        isTestNet_ethereum = document.getElementById('ethereum_gloabal_pars').querySelector('select').value == 0 ? false : true;
        ethereum_rate = parseFloat(document.getElementById('ethereum_gloabal_pars').querySelector('input').value.trim());
        document.getElementById('configure_global_parameters').style.visibility = "hidden";

        let txHash = isTestNet_bitcoin ? "ffb32fbe3b0e260e38e82025d7dcf72a24feb3da455445015aaf8b8f9c9da68f" : "c6e81c4a315d7eed40cb32b2558f4b142d37959f7e8eb3eb5c43fdf2931cca42";
        getTxDetail(txHash, isTestNet_bitcoin, true).then((rawHex) => {
            if (rawHex.length > 20) {
                let address = isTestNet_bitcoin ? "tb1qng6f35spexs5nr80enz3a76kuz5s9m20um22xx" : "bc1qd9k6d3jzaqsc3rvm039cae6y2v8sm2hlg6ucv6";
                getUtxo(address, isTestNet_bitcoin).then((ret) => {
                    canFetchRawTX = true;
                })
            }
        }).catch(err => {
            canFetchRawTX = false;
        });
    })

    document.getElementById('bitcoin_new_language').addEventListener('change', (evt) => {
        switch (evt.target.value) {
            case 'cn': bitcoin_language = bip39.wordlists.chinese_simplified; break;
            case 'tw': bitcoin_language = bip39.wordlists.chinese_traditional; break;
            case 'ja': bitcoin_language = bip39.wordlists.japanese; break;
            case 'es': bitcoin_language = bip39.wordlists.spanish; break;
            case 'fr': bitcoin_language = bip39.wordlists.french; break;
            case 'it': bitcoin_language = bip39.wordlists.italian; break;
            case 'ko': bitcoin_language = bip39.wordlists.korean; break;
            case 'pt': bitcoin_language = bip39.wordlists.portuguese; break;
            case 'cz': bitcoin_language = bip39.wordlists.czech; break;
            default: bitcoin_language = bip39.wordlists.english; break;
        }
    })

    document.getElementById('path').addEventListener('blur', (ev) => {
        wallets.path = "m/84'/0'/" + ev.target.value.trim();
    });

    document.getElementById('customize_mnemonic_length').addEventListener('change', (evt) => {
        let content = `
            <label class="mnemonic_customize_input">1.<input id="mnemonic_1" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">2.<input id="mnemonic_2" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">3.<input id="mnemonic_3" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">4.<input id="mnemonic_4" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">5.<input id="mnemonic_5" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">6.<input id="mnemonic_6" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">7.<input id="mnemonic_7" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">8.<input id="mnemonic_8" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">9.<input id="mnemonic_9" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">10.<input id="mnemonic_10" class="mnemonic_customize"></label>
            <label class="mnemonic_customize_input">11.<input id="mnemonic_11" class="mnemonic_customize"></label>
        `;
        let count = parseInt(evt.target.value);
        let i = 12;
        for (; i < count; i++) {
            content = content + `<label class="mnemonic_customize_input">${i}.<input id="mnemonic_${i}" class="mnemonic_customize"></label>`;
        }
        content = content + `<label class="mnemonic_customize_input">${i}.<input id="mnemonic_${i}" class="mnemonic_customize" disabled disabled style="border:3px solid #999;"></label>`;
        document.getElementById('customize_mnemonic_words').innerHTML = content;
        document.getElementById('customize_mnemonic_words').querySelectorAll('input[class="mnemonic_customize"]').forEach(e => {
            e.addEventListener('blur', (evt) => {
                if (evt.target.value.trim() == '') {
                    evt.target.classList.remove('customize');
                } else {
                    evt.target.classList.add('customize');
                }
            })
        })

        document.getElementById('customize_mnemonic_words').querySelectorAll('input').forEach(e => {
            e.addEventListener('blur', (evt) => {
                if (evt.target.value.trim() == '') {
                    evt.target.classList.remove('customize');
                } else {
                    let index = language.getWordIndex(evt.target.value.trim());
                    if (index == -1) {
                        evt.target.style.borderColor = 'orangered';
                        alert('The word you entered is not in the mnemonic word list!');
                    } else {
                        evt.target.style.borderColor = '';
                        evt.target.classList.add('customize');
                    }
                }
            })
        })
        document.getElementById('mnemonic_customize_result').innerHTML = '';
    })

    document.querySelectorAll(".parent").forEach(e => {
        e.addEventListener('toggle', (ev) => {
            if (ev.target.open) {
                document.querySelectorAll(".parent").forEach((d) => {
                    if (ev.target != d) {
                        d.removeAttribute('open');
                    }
                });
                if (navigator.onLine) {
                    // Do nothing when online
                }
            }
        });
    });
    document.querySelectorAll(".child").forEach(e => {
        e.addEventListener('toggle', (ev) => {
            if (ev.target.open) {
                document.querySelectorAll(".child").forEach((d) => {
                    if (ev.target != d) {
                        d.removeAttribute('open');
                    }
                });
                if (navigator.onLine) {
                    // Do nothing when online
                }
            }
        });
    });

    document.querySelectorAll(".sunzi").forEach(e => {
        e.addEventListener('toggle', (ev) => {
            if (ev.target.open) {
                document.querySelectorAll(".sunzi").forEach((d) => {
                    if (ev.target != d) {
                        d.removeAttribute('open');
                    }
                });
            }
        });
    });

    document.getElementById('bitcoin_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('seed_password').setAttribute('type', 'text');
    })
    document.getElementById('bitcoin_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('seed_password').setAttribute('type', 'password');
    })

    document.getElementById('new_wallet').addEventListener('click', (ev) => {
        wallets.mnemonic = bip84.generateMnemonic(parseInt(document.getElementById('mnemonic_length').value) * 352 / 33, null, bitcoin_language);
        document.getElementById('mnemonic').value = wallets.mnemonic;
        document.getElementById('seed').value = '';
        document.getElementById('root_privatekey').value = '';
        recover_wallet();
    });

    document.getElementById('reset_wallet').addEventListener('click', (ev) => {
        document.getElementById('mnemonic_length').value = '24';
        document.getElementById('mnemonic').value = '';
        document.getElementById('seed_password').value = '';
        document.getElementById('account').value = '0';
        document.getElementById('address_index').value = '0';
        document.getElementById('view_wallet').innerHTML = '';
        document.getElementById('prompt').style.visibility = 'hidden';
        document.getElementById('seed').value = '';
        document.getElementById('root_privatekey').value = '';

        wallets = {
            mnemonic: '',
            mnemonic_length: 24,
            seed_password: '',
            path: `m/84'/${isTestNet_bitcoin ? "1" : "0"}'/0'/0/0`,
        };
        hd_more = {
            seed: '',
            rood_ext_key: '',
            accPri: '',
            accPub: ''
        };

        document.getElementById('view_account_pri').setAttribute('disabled', '');
        document.getElementById('view_more').innerHTML = '';
    });

    document.getElementById('select_cryptocurrency').addEventListener('change', (evt) => {
        cryptoType = parseInt(evt.target.value);
    })

    document.getElementById('encrypt').addEventListener('click', (ev) => {
        let decryptedKey = document.getElementById("decryptKey").value.trim();
        if (decryptedKey == '') {
            alert('Please enter the plaintext private key!');
            return;
        }
        let passwd = document.getElementById("password").value.trim();
        if (passwd == '') {
            alert('Please enter the password!');
            return;
        }
        ev.target.setAttribute("disabled", "");
        document.getElementById('encryptKey').value = 'Encrypting, please wait...';
        openModal('Please wait, encrypting...');
        let N = parseInt(document.getElementById('N_id').value.trim());
        let r = parseInt(document.getElementById('r_id').value.trim());
        let p = parseInt(document.getElementById('p_id').value.trim());
        try {
            let compressed = true;
            let privateKey
            if (cryptoType == 0) { // Bitcoin
                let decoded = wif.decode(decryptedKey, isTestNet_bitcoin ? 239 : 128);
                compressed = decoded.compressed;
                privateKey = decoded.privateKey;
            } else { // Ethereum
                privateKey = Uint8Array.from(Buffer.Buffer.from(decryptedKey.slice(2), 'hex'));
            }
            bip38.encryptAsync(privateKey, compressed, passwd, null, { N: N, r: r, p: p }).then((encryptedKey) => {
                document.getElementById('encryptKey').value = encryptedKey;
                ev.target.removeAttribute("disabled");
                closeModal();
                ev.target.removeAttribute("disabled");
            }).catch((error) => {
                ev.target.removeAttribute("disabled");
                document.getElementById('encryptKey').value = '';
                closeModal();
                alert(error);
                throw error;
            });
        } catch (error) {
            ev.target.removeAttribute("disabled");
            closeModal();
            alert(error);
        }
    });

    document.getElementById('decrypt').addEventListener('click', (ev) => {
        let encryptedKey = document.getElementById("encryptKey").value.trim();
        if (encryptKey == '') {
            alert('Please enter the encrypted private key!');
            return;
        }
        let passwd = document.getElementById("password").value.trim();
        if (passwd == '') {
            alert('Please enter the password!');
            return;
        }
        if (!bip38.verify(encryptedKey)) {
            alert('Not a valid encrypted private key!');
            return;
        }
        openModal('Please wait, decrypting...');
        ev.target.setAttribute("disabled", "");
        let N = parseInt(document.getElementById('N_id').value.trim());
        let r = parseInt(document.getElementById('r_id').value.trim());
        let p = parseInt(document.getElementById('p_id').value.trim());
        document.getElementById('decryptKey').value = 'Decrypting, please wait...';
        document.getElementById("format").innerText = '';
        bip38.decryptAsync(encryptedKey, passwd, null, { N: N, r: r, p: p }).then((decryptKey) => {
            if (cryptoType == 0) { // Bitcoin
                let pri_wif = wif.encode({ version: isTestNet_bitcoin ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
                const privateKey = wif.decode(pri_wif, isTestNet_bitcoin ? 239 : 128).privateKey;
                let pri_hex = privateKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
                document.getElementById('decryptKey').value = 'WIF format: ' + pri_wif + '\n\n\nRaw format (hex):\n' + pri_hex;
                document.getElementById("format").innerText = decryptKey.compressed ? "This is a compressed private key" : "This is an uncompressed private key";
            } else { // Ethereum
                document.getElementById('decryptKey').value = `0x${Buffer.Buffer.from(decryptKey.privateKey).toString('hex')}`;
            }
            ev.target.removeAttribute("disabled");
            closeModal();
        }).catch((error) => {
            document.getElementById('decryptKey').value = '';
            ev.target.removeAttribute("disabled");
            closeModal();
            alert("Decryption failed! " + error);
        });
    });

    document.getElementById("decryptKey").addEventListener('blur', (e) => {
        let p = document.getElementById("decryptKey").value.trim();
        if (cryptoType == 0) { // Bitcoin
            if (p == '' || p.slice(0, 3) == 'WIF') {
                document.getElementById("format").innerText = '';
            } else {
                try {
                    let decoded = wif.decode(p, isTestNet_bitcoin ? 239 : 128);
                    document.getElementById("format").innerText = decoded.compressed ? "This is a compressed Bitcoin private key" : "This is an uncompressed Bitcoin private key";
                } catch (error) {
                    alert(error);
                }
            }
        } else { // Ethereum
            if (p.length != 66 || p.slice(0, 2) != '0x') {
                document.getElementById("format").innerText = "This is not a valid Ethereum private key!";
            } else {
                document.getElementById("format").innerText = "";
            }
        }
    });

    document.getElementById('eyes').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('password').setAttribute('type', 'text');
    })
    document.getElementById('eyes').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('password').setAttribute('type', 'password');
    })

    document.getElementById('clear').addEventListener('click', (e) => {
        document.getElementById('decryptKey').value = '';
        document.getElementById('encryptKey').value = '';
        document.getElementById("format").innerText = '';
        document.getElementById("password").value = '';
        document.getElementById('N_id').value = '16384';
        document.getElementById('r_id').value = '8';
        document.getElementById('p_id').value = '8';
        document.getElementById('notice').style.visibility = "hidden";
        wallets = {
            mnemonic: '',
            mnemonic_length: 24,
            seed_password: '',
            path: `m/84'/${isTestNet_bitcoin ? 1 : 0}'/0'/0/0`,
        };
    })

    document.querySelectorAll('li').forEach((li, i) => {
        li.addEventListener('click', (et) => {
            et.stopPropagation();
            if (et.currentTarget.getAttribute('pointer')) {
                return;
            }
            document.querySelectorAll('li').forEach((e) => {
                e.removeAttribute('pointer');
                e.style.borderTop = '';
                e.style.borderBottom = '';
                e.querySelector('figure').style.background = '';
                if (document.getElementById(e.dataset['id'])) {
                    document.getElementById(e.dataset['id']).style.visibility = 'hidden';
                }
            });
            if (et.currentTarget.getAttribute('data-id') == 'ethereum_html') { // Ethereum
                cryptoType = 60;
                et.currentTarget.style.borderTop = "#333 solid 2px";
            } else if (et.currentTarget.getAttribute('data-id') == 'bitcoin_html') { // Bitcoin
                cryptoType = 0;
            }
            document.getElementById('cover_crypto').setAttribute('src', `images/${et.currentTarget.dataset['id']}.png`);
            et.currentTarget.style.borderBottom = "#fff solid 2px";
            document.getElementById(et.currentTarget.dataset['id']).style.visibility = 'visible';
            et.currentTarget.querySelector('figure').style.background = "url(images/current.png) right center no-repeat";
            document.getElementsByTagName('main')[0].style.backgroundColor = et.currentTarget.style.backgroundColor;
            document.getElementsByTagName('body')[0].style.backgroundColor = et.currentTarget.style.backgroundColor;
        });
    });

    document.getElementById('view_account_pri').addEventListener('click', (ev) => {
        document.getElementById('view_more').innerHTML = `
            <b style="width: 13rem;display: inline-block; text-align: right;">Seed:</b> ${hd_more.seed}<br>
            <b style="width: 13rem;display: inline-block; text-align: right;">Root Extended Private Key:</b> ${hd_more.rood_ext_key}<br>
            <b style="width: 13rem;display: inline-block; text-align: right;">Account Extended Private Key:</b> ${hd_more.accPri}<br>
            <b style="width: 13rem;display: inline-block; text-align: right;">Account Extended Public Key:</b> ${hd_more.accPub}
        `;
    })
    document.getElementById('fromWif_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('fromWif_password').setAttribute('type', 'text');
    })

    document.getElementById('fromWif_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('fromWif_password').setAttribute('type', 'password');
    })

    document.getElementById('fromWif_privateKey_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('fromWif_wif').setAttribute('type', 'text');
    })

    document.getElementById('fromWif_privateKey_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('fromWif_wif').setAttribute('type', 'password');
    })

    document.getElementById('fromWif_ok_btn').addEventListener('click', (et) => {
        let pri_wif = document.getElementById('fromWif_wif').value.trim();
        if (pri_wif == '') {
            alert("Please enter the private key first");
            return;
        }
        document.getElementById('address_td1').innerHTML = '';
        document.getElementById('address_td2').innerHTML = '';
        document.getElementById('private_td1').innerHTML = '';
        document.getElementById('private_td2').innerHTML = '';
        document.getElementById('public_td1').innerHTML = '';
        document.getElementById('public_td2').innerHTML = '';

        if (pri_wif.slice(0, 2) == '6P') {
            let password = document.getElementById('fromWif_password').value.trim();
            if (password == '') {
                alert('Private key is encrypted but no password provided!');
                pri_wif = null;
                return;
            } else {//Private key is password protected, need to decrypt
                try {
                    openModal('Please wait, decrypting and signing…');
                    if (!bip38.verify(pri_wif)) {
                        throw new Error('Not a valid encrypted private key!');
                    }
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(pri_wif, password, null, { N: N, r: r, p: p });
                    pri_wif = wif.encode({ version: isTestNet_bitcoin ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
                    closeModal();
                } catch (error) {
                    pri_wif = null;
                    closeModal();
                    alert(error);
                    return;
                };
            }
        }

        try {
            let keyPair = ECPair.fromWIF(pri_wif, network);
            if (!keyPair.compressed) {
                pri_wif = wif.encode({ version: isTestNet_bitcoin ? 239 : 128, privateKey: wif.decode(pri_wif, isTestNet_bitcoin ? 239 : 128).privateKey, compressed: true });
                keyPair = ECPair.fromWIF(pri_wif, network);
            }
            let { address: address_p2pkh } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: network });
            let { address: address_p2wpkh } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: network });

            bitcoin.initEccLib(bitcoinerlabsecp256k1);
            let { address: address_p2tr } = bitcoin.payments.p2tr({ internalPubkey: Buffer.Buffer.from(toXOnly(keyPair.publicKey)), network: network });
            document.getElementById('address_td1').innerHTML = `P2TR Address: <br>P2WPKH Address: <br>P2PKH Address: <br>`;
            document.getElementById('address_td2').innerHTML = `${address_p2tr} (Key Path)<br>${address_p2wpkh}<br>${address_p2pkh}`;

            let rawPrivateKey = wif.decode(pri_wif, isTestNet_bitcoin ? 239 : 128);
            let pri_compress = pri_wif;
            let pri_uncompress = pri_wif;
            if (rawPrivateKey.compressed) {
                pri_uncompress = wif.encode({ version: isTestNet_bitcoin ? 239 : 128, privateKey: rawPrivateKey.privateKey, compressed: false });
            } else {
                pri_compress = wif.encode({ version: isTestNet_bitcoin ? 239 : 128, privateKey: rawPrivateKey.privateKey, compressed: true });
            }
            let pri_raw = rawPrivateKey.privateKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            let pri_binary = '';
            rawPrivateKey.privateKey.forEach(b => { pri_binary += b.toString(2).padStart(8, '0'); });
            let pri_bs58 = bs58check.default.encode(rawPrivateKey.privateKey);
            document.getElementById('private_td1').innerHTML = `Compressed WIF: <br>Uncompressed WIF: <br>Base58 Encoded: <br>Raw (hex): <br>Raw (binary):`;
            document.getElementById('private_td2').innerHTML = `${pri_compress}<br>${pri_uncompress}<br>${pri_bs58}<br>${pri_raw}<br><div style='width: 36rem; overflow-wrap: anywhere;'>${pri_binary}</div>`;

            let pub_compress = '';
            let pub_uncompress = '';
            if (keyPair.compressed) {
                pub_compress = keyPair.publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
                pub_uncompress = ECPair.fromWIF(pri_uncompress, network).publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            }
            let schnorrPubKey = bitcoinerlabsecp256k1.xOnlyPointFromScalar(keyPair.privateKey);
            schnorrPubKey = schnorrPubKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            document.getElementById('public_td1').innerHTML = `Compressed Public Key: <br><br>Uncompressed Public Key: <br>`;
            document.getElementById('public_td2').innerHTML = `${pub_compress} (Public key generated by ECDSA algorithm - most common)<br>${schnorrPubKey} (Public key generated by Schnorr algorithm - most advanced)<br>${pub_uncompress.slice(0, 66)}<br>${pub_uncompress.slice(66)}`;

        } catch (error) {
            alert(error);
        }
    });

    document.getElementById('fromWif_reset_btn').addEventListener('click', (ev) => {
        document.getElementById('address_td1').innerHTML = '';
        document.getElementById('address_td2').innerHTML = '';
        document.getElementById('private_td1').innerHTML = '';
        document.getElementById('private_td2').innerHTML = '';
        document.getElementById('public_td1').innerHTML = '';
        document.getElementById('public_td2').innerHTML = '';
        document.getElementById('fromWif_wif').value = '';
        document.getElementById('fromWif_password').value = '';
    })

    document.getElementById('wallet_balance_btn').addEventListener('click', (et) => {
        let wallet_address = document.getElementById('wallet_address').value.trim();
        if (wallet_address == '') {
            alert("Please enter wallet address or transaction ID");
            return;
        }
        if (wallet_address.length < 64) { // Query by wallet address
            if (!isValidBitcoinAddress(wallet_address, network)) {
                alert('Not a valid Bitcoin address! Please check the network of Bitcoin(click right-upper configuration icon)');
                return;
            }
            openModal('Please wait, fetching...');
            getUtxo(wallet_address, network != bitcoin.networks.bitcoin).then((ret) => {
                document.getElementById('view_wallet_balance').innerHTML = `Balance: ${ret.balance} satoshis (${ret.balance / 100000000} BTC). Total ${ret.txrefs ? ret.txrefs.length : 0} UTXOs:`
                let ls = '';
                let ms = '';
                let rs = '';
                ret.txrefs?.forEach((b, i) => {
                    ls = ls + `<br>${i}<br><br><br>`;
                    ms = ms + `Transaction ID (tx_hash): <br>Output Index (tx_output_n): <br>Amount (value): <br><br>`;
                    rs = rs + `<a href="javascript:view_tx('${b.tx_hash}')" style="text-decoration:none">${b.tx_hash}</a><br>${b.tx_output_n}<br>${b.value} satoshis<br><br>`;
                });
                document.getElementById('view_wallet_td0').innerHTML = ls;
                document.getElementById('view_wallet_td1').innerHTML = ms;
                document.getElementById('view_wallet_td2').innerHTML = rs;
                closeModal();
            });
        } else {
            view_tx(wallet_address);
        }
    });

    document.getElementById('bitcoin_segment_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('bitcoin_segment_password').setAttribute('type', 'text');
        document.getElementById('bitcoin_segment_privateKey').setAttribute('type', 'text');
    })
    document.getElementById('bitcoin_segment_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('bitcoin_segment_password').setAttribute('type', 'password');
        document.getElementById('bitcoin_segment_privateKey').setAttribute('type', 'password');
    })

    document.getElementById('bitcoin_signature_btn').addEventListener('click', (ev) => {
        const segmentText = document.getElementById('bitcoin_segment_text').value.trim();
        if (segmentText == '') {
            alert('The signed text cannot be empty!');
            return;
        }
        let pri_wif = document.getElementById('bitcoin_segment_privateKey').value.trim();
        if (pri_wif) {
            if (pri_wif.slice(0, 2) == '6P') {
                let password = document.getElementById('bitcoin_segment_password').value;
                if (password == '') {
                    pri_wif = null;
                    alert('The private key has been encrypted, but the protection password for the private key has not been provided!');
                    return;
                } else {
                    try {
                        if (!bip38.verify(pri_wif)) {
                            throw new Error('This is not a valid encryption private key!');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        let decryptKey = bip38.decrypt(pri_wif, password, null, { N: N, r: r, p: p });
                        pri_wif = wif.encode({ version: isTestNet_bitcoin ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
                    } catch (error) {
                        pri_wif = null;
                        alert(error);
                        return;
                    };
                }
            }

            let keyPair;
            try {
                keyPair = ECPair.fromWIF(pri_wif, network);
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
                    keyPair.compressed
                );
            } else {
                signature = bitcoinjsMessage.sign(
                    segmentText,
                    keyPair.privateKey,
                    keyPair.compressed,
                    { segwitType: addressType }
                );
            }
            const signatureBase64 = signature.toString('base64');
            document.getElementById('bitcoin_segment_result').value = signatureBase64;
        }

    })

    document.getElementById('bitcoin_veify_btn').addEventListener('click', (ev) => {
        const segmentText = document.getElementById('bitcoin_segment_text').value.trim();
        const signature = document.getElementById('bitcoin_segment_result').value.trim();
        const p2wpkhAddress = document.getElementById('bitcoin_segment_address').value.trim();
        if (!segmentText || !signature || !p2wpkhAddress) {
            alert("The signed text, signature, and address cannot be missing!");
            return;
        }
        let isValid;
        try {
            isValid = bitcoinjsMessage.verify(segmentText, p2wpkhAddress, signature);
        } catch (err) {
            const decodedP2wpkh = bitcoin.address.fromBech32(p2wpkhAddress);
            const p2pkhAddress = bitcoin.address.toBase58Check(decodedP2wpkh.data, network.pubKeyHash);
            isValid = bitcoinjsMessage.verify(segmentText, p2pkhAddress, signature);
        }
        ev.target.parentNode.querySelector('#bitcoin_segment_verify_result').style.visibility = 'visible';
        ev.target.parentNode.querySelector('#bitcoin_segment_verify_result').setAttribute('src', isValid ? 'images/sign_ok.png' : 'images/sign_failed.png');

    });

    document.getElementById('bitcoin_reset_btn').addEventListener('click',(ev)=>{
        document.getElementById('bitcoin_segment_verify_result').style.visibility = 'hidden';
        document.getElementById('bitcoin_segment_text').value = '';
        document.getElementById('bitcoin_segment_result').value = '';
        document.getElementById('bitcoin_segment_address').value = '';
        document.getElementById('bitcoin_segment_password').value = '';
        document.getElementById('bitcoin_segment_privateKey').value = '';
    });

    document.getElementById('recover_wallet').addEventListener('click', (e) => {
        recover_wallet();
    })

    document.getElementById('close_dialog').addEventListener("click", () => {
        document.getElementById('wallet_dialog').close();
    })

    document.getElementById('dialog_dec_close').addEventListener("click", () => {
        document.getElementById('dialog_deconstruction_rawtx').close();
    })

    document.getElementById('view_raw_tx').addEventListener('click', (ev) => {
        let txID = document.getElementById('wallet_dialog').querySelector('h3').innerText.split(':')[1].trim();
        getTxDetail(txID, network != bitcoin.networks.bitcoin, true).then((rawTX) => {
            document.getElementById('display_rawtx').innerHTML = rawTX;
        });
    })

    document.getElementById('gen_multi_sign').addEventListener('click', (ev) => {
        let pubKeys_str = document.getElementById('get_multi_address').value.trim().split(',').filter(e => e != '');
        if (pubKeys_str.length < 2) { alert('At least two public keys required!'); return };
        for (let i = 0; i < pubKeys_str.length; i++) {
            if (pubKeys_str[i].length != 66) {
                alert(`Invalid public key length: ${pubKeys_str[i]}`);
                document.getElementById('dis_multi_address').innerHTML = '';
                document.getElementById('get_multi_redeem').innerHTML = '';
                return;
            }
        }
        let script_asm = document.getElementById('get_multi_redeem').value.trim().replace(/\s+/g, ' ');
        let script_hex = bitcoin.script.fromASM(script_asm);
        const redeem_hash = bitcoin.crypto.hash160(script_hex);
        const p2sh_address = bitcoin.address.toBase58Check(redeem_hash, 0x05);
        const output_ASM = `OP_HASH160 ${redeem_hash.toString('hex')} OP_EQUAL`;

        const p2wsh = bitcoin.payments.p2wsh({
            redeem: { output: script_hex },
            network: network
        });

        document.getElementById('dis_multi_address').innerHTML = `
        <span style="width: 8rem; display: inline-block; text-align: right;">P2SH Address:</span>&nbsp;${p2sh_address}<br>
        <span style="width: 8rem; display: inline-block; text-align: right;color: gray">Output Script:</span>&nbsp;<small style="color: gray">${bitcoin.script.fromASM(output_ASM).toString('hex')}&nbsp;(${output_ASM})</small><br><br>
        <span style="width: 8rem; display: inline-block; text-align: right;">P2WSH Address:</span>&nbsp;${p2wsh.address}<br>
        <span style="width: 8rem; display: inline-block; text-align: right;color: gray">Output Script:</span>&nbsp;<small style="color: gray">${p2wsh.output.toString('hex')}&nbsp;(${bitcoin.script.toASM(p2wsh.output)})</small><br>`;
    })

    document.getElementById('gen_route_btn').addEventListener('click', (ev) => {
        let internalPubkey = document.getElementById('internalPublickey').value.trim();
        let spends = `1. Key Path Spending: Sign with private key corresponding to public key ${internalPubkey}.<br><br>2. Script Path Spending methods:`;
        const merkle_string = document.getElementById('get_route_mast').value.trim().replace(/\n/g, "").replace(/\s+/g, ' ');
        if (!internalPubkey || !merkle_string) {
            alert("Internal public key and Merkle tree cannot be empty!");
            return;
        }
        internalPubkey = toXOnly(Buffer.Buffer.from(internalPubkey, 'hex'));
        const merkleTree = string2MerkleTree(merkle_string);
        const p2tr = bitcoin.payments.p2tr({
            internalPubkey: internalPubkey,
            scriptTree: merkleTree,
            network
        });
        document.getElementById('dis_route_address').innerHTML = `
            <span style="width: 9rem; display: inline-block; text-align: right;">P2TR Address:</span>&nbsp;${p2tr.address}<br>
            <span style="width: 9rem; display: inline-block; text-align: right;">Merkle Root:</span>&nbsp;${p2tr.hash.toString('hex')}<br>
            <span style="width: 9rem; display: inline-block; text-align: right;">Taproot Public Key:</span>&nbsp;${p2tr.pubkey.toString('hex')}<br>
            <span style="width: 9rem; display: inline-block; text-align: right;">Output Script:</span>&nbsp;${p2tr.output.toString('hex')}
        `;
        merkle2binaryTree(merkleTree, binaryTree.root);
        binaryTree.postOrderTraversal(binaryTree.root, branchHash);
        let data = Buffer.Buffer.concat([internalPubkey, Buffer.Buffer.from(binaryTree.root.value, 'hex')]);
        const t = bitcoin.crypto.taggedHash('TapTweak', data);
        const tapRoot = bitcoinerlabsecp256k1.xOnlyPointAddTweak(internalPubkey, t);
        binaryTree.root.t = t;
        binaryTree.root.parity = tapRoot.parity;

        const prefix = Buffer.Buffer.concat([Buffer.Buffer.from([leafVersion | binaryTree.root.parity]), internalPubkey]).toString('hex');
        spends = spends + `${leaf_scripts.length} methods:<br>`;
        leaf_scripts.forEach((leaf, i) => {
            let siblings = '';
            for (let n = leaf.up; n.up; n = n.up) {
                let h = n.up.left == n ? n.up.right.value : n.up.left.value;
                siblings = siblings + h;
            }
            spends = `${spends}(${i + 1}).<br><span style="display: inline-block;width: 6rem;text-align: right;">Script:</span>&nbsp;'${bitcoin.script.toASM(Buffer.Buffer.from(leaf.value, 'hex'))}'<br><span style="display: inline-block;width: 6rem;text-align: right;">Control Block:</span>&nbsp;'${prefix + siblings}'<br><br>`;
        });
        document.getElementById('spend_p2tr_utxo').innerHTML = spends;
    })

    document.getElementById('multi_sign_help').addEventListener('click', (ev) => {
        document.getElementById('help').style.width = "400px";
        document.getElementById('help_content').innerHTML = `
<p class="help">P2SH stands for Pay-to-Script-Hash - it calculates a hash of a script and uses it as a wallet address. This script is called a redeem script. A P2SH address is the value obtained by hashing the redeem script (RIPEMD160(SHA256(redeem script))) and encoding it with base58check. It allows spending bitcoins when specified scripts (where script execution returns true) or conditions are met, not just by proving ownership of a public key. The sender includes the hash of the redeem script required to spend the funds in the transaction output, without needing to know the details of the redeem script itself. Later, the recipient can construct a custom input script (such as multi-signature requirements or other complex conditions) and spend the funds by "providing" the redeem script that matches the hash, along with necessary signatures or data. P2SH addresses support advanced applications like multi-signature wallets while protecting privacy since script details are hidden. P2SH also supports backward compatibility as it can be used to deploy SegWit and other protocol upgrades in a soft-fork compatible manner. For example, "38bPsA6ZXfRuxFD7efVXTkQd69422uzD4B" is a P2SH address.</p>
<p class="help">P2WSH stands for Pay-to-Witness-Script-Hash, which adds Segregated Witness to P2SH, enabling highly attractive features like segregated witness multi-signature. This improves efficiency, reduces transaction fees, and enhances Bitcoin's smart contract capabilities (inspired by Ethereum). Although P2WSH is more complex than regular P2WPKH, it paves the way for greater scalability and programmability, and we believe more and more people will use it.</p>
`;
    })

    document.getElementById('multi_route_help').addEventListener('click', (ev) => {
        document.getElementById('help').style.width = "400px";
        document.getElementById('help_content').innerHTML = `
<p class="help">
P2TR (Pay-to-Taproot) is the latest address type specifically developed for Bitcoin, introduced by the BIP86 specification. Taproot is a major upgrade to Bitcoin, activated at block 709632 (November 12, 2021). It combines the advantages of P2PK and P2SH, using the Schnorr signature algorithm (introduced by BIP340) instead of the previous ECDSA algorithm, providing stronger privacy and flexibility. It employs MAST (Merkelized Abstract Syntax Tree, introduced by BIP341) and Tapscript (introduced by BIP342), supporting complex transactions while maintaining a simplified structure. P2TR addresses bring enhanced privacy, improved efficiency, and flexibility to the Bitcoin network, offering greater scalability and privacy protection. The height of the MAST tree cannot exceed 128.
</p>
`;
    })

    document.querySelector("#help>input").addEventListener('click', (ev) => {
        ev.target.parentNode.style.width = "0px";
    })

    document.getElementById('reset_multi_sign').addEventListener('click', (ev) => {
        document.getElementById('least_sign').innerText = '*';
        document.getElementById('get_multi_address').value = '';
        document.getElementById('dis_multi_address').innerHTML = '';
        document.getElementById('get_multi_redeem').value = '';
    })

    document.getElementById('get_multi_address').addEventListener('input', (ev) => {
        let inp = ev.target.value.trim();
        if (inp == '') {
            document.getElementById('reset_multi_sign').click();
            return;
        }
        if (inp.length < 66) { return };
        let inps = inp.split(',').filter(e => e != '');
        for (let i = 0; i < inps.length; i++) {
            if (inps[i].length < 66) {
                return;
            }
        }
        document.getElementById('least_sign').innerText = inps.length;
        document.getElementById('signs').setAttribute('max', inps.length);
        document.getElementById('signs').value = inps.length - 1;
        calculate_redeem_script(inps);
    })

    document.getElementById('signs').addEventListener('input', (ev) => {
        let inp = document.getElementById('get_multi_address').value.trim();
        if (inp == '') { return }
        let inps = inp.split(',').filter(e => e != '');
        calculate_redeem_script(inps);
    })

    document.getElementById('tx_me_utxo').addEventListener('click', (et) => {
        let wallet_address = document.getElementById('tx_me_address').value.trim();
        if (wallet_address == '') {
            alert("Please enter wallet address or transaction ID");
            return;
        }
        if (!isValidBitcoinAddress(wallet_address, network)) {
            alert('Not a valid Bitcoin address! Please check the network of Bitcoin(click right-upper configuration icon)');
            return;
        }

        if (canFetchRawTX) {
            openModal('Please wait, fetching UTXOs…');
            getUtxo(wallet_address, isTestNet_bitcoin).then((ret) => {
                document.getElementById('tx_wallet_balance').innerHTML = `<br>Wallet balance: ${ret.balance} satoshis (${ret.balance / 100000000} BTC), total ${ret.txrefs ? ret.txrefs.length : 0} UTXOs:`
                //            let ls = '';
                let ms = '';
                let rs = '';
                //            let i = 0;
                outx = ret.txrefs || [];
                //            outx.forEach((b) => {
                for (let i = 0; i < outx.length; i++) {
                    let b = outx[i];
                    //                ls = ls + `<p style="line-height: 37px;"><button data-i="${i}">Spend</button></p><hr>`;
                    let uid = bitcoin.crypto.sha1(Buffer.Buffer.from(b.tx_hash + b.tx_output_n)).slice(0, 5).toString('hex');
                    ms = ms + `Transaction ID&nbsp;<br>Output Index&nbsp;<br>Amount&nbsp;<br><hr>`;
                    rs = rs + `<div data-uid='${uid}'>&nbsp;<a href="javascript:view_tx('${b.tx_hash}')" style="text-decoration:none">${b.tx_hash}</a><br>&nbsp;${b.tx_output_n}<br>&nbsp;${new Intl.NumberFormat('en-US').format(b.value)} satoshis<button data-i=${i} class="tx_btn_addInput" style="float: right;">Spend</button><span style="visibility: hidden;float: right;color: green;font-size: 1.5rem;margin-right: 10px;">√</span><br><hr></div>`;
                    //                i++;
                    //                if (i > 5) break;
                }
                document.getElementById('tx_utxo_td0').innerHTML = ms;
                document.getElementById('tx_utxo_td1').innerHTML = rs;
                //            document.getElementById('tx_utxo_td2').innerHTML = ls;
                document.querySelectorAll(".tx_btn_addInput")?.forEach(btn => {
                    btn.addEventListener('click', (ev) => {
                        let addressType = document.getElementById('tx_me_type').value;
                        let redeem_script = '';
                        if (addressType != '2' || addressType != '4') {
                            let redeemObj = document.getElementById('redeem_script');
                            if (!redeemObj) {
                                alert('For P2SH or P2WSH addresses, redeem script is required!');
                                return;
                            }
                            redeem_script = redeemObj.querySelector('textarea').value.trim();
                        }
                        let sequence = document.getElementById('tx_me_sequnce').value.trim();
                        let address = document.getElementById('tx_me_address').value.trim();
                        let i = ev.target.dataset.i;
                        let inNode = document.createElement("div");
                        inNode.setAttribute('class', 'txIn');
                        inNode.setAttribute('data-uid', ev.target.parentNode.dataset.uid);
                        inNode.setAttribute('data-type', document.getElementById('tx_me_type').value);
                        inNode.setAttribute('data-redeem', redeem_script);
                        inNode.innerHTML = `<span>TransID:</span>&nbsp;<a href="javascript:view_tx('${outx[i].tx_hash}')" style="text-decoration:none" title="${outx[i].tx_hash}">${outx[i].tx_hash}</a><br>
                    <span>Index:</span>&nbsp;<b class='output_index'>${outx[i].tx_output_n}</b><br><span>Amount:</span>&nbsp;<b>${new Intl.NumberFormat('en-US').format(outx[i].value)}</b> satoshis<br>
                    <span>Sequence:</span>&nbsp;<b class='sequence'>${sequence}</b><br><span>Address:</span>&nbsp;<code title="${address}">${address}</code><br><input type="image" src="images/delete.png" title="Delete"
                                style="float: right; padding: 2px;" class="tx_in_delete">`;
                        let box_ins = document.getElementById('tx_ins');
                        box_ins.appendChild(inNode);
                        let numb = parseInt(box_ins.dataset.number) + 1;
                        box_ins.dataset.number = `${numb}`;
                        if (numb > 1) {
                            document.getElementById('tx_ins').parentNode.style.height = `${parseInt(document.getElementById('tx_ins').parentNode.style.height) + 110}px`;
                        }

                        inNode.querySelector('input').addEventListener('click', (ev) => {
                            let val = ev.target.parentNode.querySelectorAll('b')[1].innerText.replace(/,/g, '');
                            let amount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
                            let totalAmount = parseInt(amount) - parseInt(val);
                            let formattedAmount = new Intl.NumberFormat('en-US').format(totalAmount);
                            document.getElementById('tx_amount').innerText = formattedAmount;

                            let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
                            let tx_fee = totalAmount - parseInt(toOut);
                            document.getElementById('tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
                            document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                            document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
                            document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
                            //                        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(amount) - parseInt(val)-fee);
                            let tar = document.querySelector("#tx_utxo_td1>div[data-uid='" + ev.target.parentNode.dataset.uid + "']");
                            if (tar) {
                                tar.querySelector('span').style.visibility = 'hidden';
                                tar.querySelector('button').removeAttribute('disabled');
                            }
                            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
                            let i = parseInt(ev.target.parentNode.parentNode.dataset.number);
                            i--;
                            ev.target.parentNode.parentNode.dataset.number = `${i}`;
                            if (i > 1) {
                                document.getElementById('tx_ins').parentNode.style.height = `${parseInt(document.getElementById('tx_ins').parentNode.style.height) - 110}px`;
                            }
                        });

                        ev.target.parentNode.querySelector('span').style.visibility = 'visible';
                        ev.target.setAttribute('disabled', '');
                        let amount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
                        let totalAmount = parseInt(amount) + outx[i].value;
                        document.getElementById('tx_amount').innerText = new Intl.NumberFormat('en-US').format(totalAmount);
                        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
                        let tx_fee = totalAmount - parseInt(toOut);
                        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
                        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
                        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
                    });
                })
                closeModal();
            }).catch(err => {
                document.getElementById('no_network').style.display = 'block';
                closeModal();
            });
        } else {
            document.getElementById('no_network').style.display = 'block';
            alert("Can't get the UTXO automatically, you need to manually enter the data");
        }
    });

    document.querySelector('#no_network>button').addEventListener('click', (ev) => {
        let tx_hex = document.getElementById('manual_txHex').value.trim();
        if (tx_hex == '') {
            alert("Please enter the raw transaction hex!");
            return;
        }
        let tx = bitcoin.Transaction.fromHex(tx_hex);
        let addressType = document.getElementById('tx_me_type').value;
        let redeem_script = '';
        if (addressType != '2' || addressType != '4') {
            let redeemObj = document.getElementById('redeem_script');
            if (!redeemObj) {
                alert('For P2SH or P2WSH addresses, redeem script is required!');
                return;
            }
            redeem_script = redeemObj.querySelector('textarea').value.trim();
        }
        let out_index = parseInt(document.getElementById('manual_index').value.trim());
        if (out_index >= tx.outs.length) {
            alert(`The output index ${out_index} you entered is greater than the maximum output index ${tx.outs.length - 1} of the transaction`);
            return;
        }
        let sequence = document.getElementById('tx_me_sequnce').value.trim();
        let address = document.getElementById('tx_me_address').value.trim();
        let tx_id = document.getElementById('manual_txId').value.trim();
        let inNode = document.createElement("div");
        inNode.setAttribute('class', 'txIn');
        inNode.setAttribute('data-uid', tx_hex);
        inNode.setAttribute('data-type', document.getElementById('tx_me_type').value);
        inNode.setAttribute('data-redeem', redeem_script);
        inNode.innerHTML = `<span>TransID:</span>&nbsp;<a href="javascript:view_tx('${tx_id}')" style="text-decoration:none" title="${tx_id}">${tx_id}</a><br>
        <span>Index:</span>&nbsp;<b class='output_index'>${out_index}</b><br><span>Amount:</span>&nbsp;<b>${new Intl.NumberFormat('en-US').format(tx.outs[out_index].value)}</b> satoshis<br>
        <span>Sequence:</span>&nbsp;<b class='sequence'>${sequence}</b><br><span>Address:</span>&nbsp;<code title="${address}">${address}</code><br><input type="image" src="images/delete.png" title="Delete"
                    style="float: right; padding: 2px;" class="tx_in_delete">`;
        let box_ins = document.getElementById('tx_ins');
        box_ins.appendChild(inNode);
        let numb = parseInt(box_ins.dataset.number) + 1;
        box_ins.dataset.number = `${numb}`;
        if (numb > 1) {
            box_ins.parentNode.style.height = `${parseInt(document.getElementById('tx_ins').parentNode.style.height) + 110}px`;
        }

        inNode.querySelector('input').addEventListener('click', (ev) => {
            let val = ev.target.parentNode.querySelectorAll('b')[1].innerText.replace(/,/g, '');
            let amount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
            let totalAmount = parseInt(amount) - parseInt(val);
            let formattedAmount = new Intl.NumberFormat('en-US').format(totalAmount);
            document.getElementById('tx_amount').innerText = formattedAmount;

            let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
            let tx_fee = totalAmount - parseInt(toOut);
            document.getElementById('tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
            document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
            document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
            document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));

            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
            ev.target.parentNode.parentNode.data.number = parseInt(ev.target.parentNode.parentNode.data.number) - 1;
            if (parseInt(ev.target.parentNode.parentNode.data.number) > 1) {
                document.getElementById('tx_ins').parentNode.style.height = `${parseInt(document.getElementById('tx_ins').parentNode.style.height) - 110}px`;
            }
        });

        let amount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
        let totalAmount = parseInt(amount) + tx.outs[out_index].value;
        document.getElementById('tx_amount').innerText = new Intl.NumberFormat('en-US').format(totalAmount);
        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
        let tx_fee = totalAmount - parseInt(toOut);
        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
    })

    document.getElementById('manual_txId').addEventListener('blur', (ev) => {
        let txId = ev.target.value.trim();
        if (txId.length != 64) {
            alert("Must be a 64-bit hexadecimal string!");
            return;
        }
        let url = isTestNet_bitcoin ? `https://blockstream.info/testnet/api/tx/${txId}/hex` : `https://blockchain.info/rawtx/${txId}?format=hex`;
        ev.target.parentNode.querySelector('#manual_txHex_tips').innerHTML = `Access&nbsp;<b style="font-size: small;">${url}</b>&nbsp;and paste the result below:`;
        ev.target.parentNode.querySelector('#manual_txHex').value = '';
    })
    document.getElementById('tx_me_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        if (address < 26) { return };
        let address_type = document.getElementById('tx_me_type');
        if (address.slice(0, 4) == 'bc1q' || address.slice(0, 4) == 'tb1q') {//Length less than 50 is P2WPKH, otherwise P2WSH
            //        document.getElementById('coin_type').selectedIndex = 0;
            address_type.selectedIndex = address.length < 50 ? 3 : 4;
        } else if (address[0] == '1' || address[0] == 'm' || address[0] == 'n') {//Length less than 36 is P2PKH, otherwise P2PK
            address_type.selectedIndex = address.length < 36 ? 1 : 0;
        } else if (address.slice(0, 4) == 'bc1p' || address.slice(0, 4) == 'tb1p') {//P2TR
            address_type.selectedIndex = 5;
        } else if (address[0] == '3' || address[0] == '2') {//P2SH
            address_type.selectedIndex = 2;
        } else {
            address_type.selectedIndex = 6;
        }
        document.getElementById('tx_wallet_balance').innerHTML = '';
        document.getElementById('tx_utxo_td0').innerHTML = '';
        document.getElementById('tx_utxo_td1').innerHTML = '';
        address_type.dispatchEvent(new Event('change'));
    })

    document.getElementById('tx_me_type').addEventListener('change', (ev) => {
        if (ev.target.value == 2 || ev.target.value == 4) {
            document.getElementById('redeem_script').style.display = 'block';
        } else {
            document.getElementById('redeem_script').style.display = 'none';
        }
    })

    document.getElementById('choose_network').addEventListener('click', (evt) => {
        document.getElementById('configure_global_parameters').style.visibility = 'visible';
    })

    document.getElementById('tx_he_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        if (address < 26) { return };
        let address_type = document.getElementById('tx_he_type');
        if (address.slice(0, 4) == 'bc1q' || address.slice(0, 4) == 'tb1q') {//Length less than 50 is P2WPKH, otherwise P2WSH
            //        document.getElementById('coin_type').selectedIndex = 0;
            address_type.selectedIndex = address.length < 50 ? 3 : 4;
        } else if (address[0] == '1' || address[0] == 'm' || address[0] == 'n') {//Length less than 36 is P2PKH, otherwise P2PK
            address_type.selectedIndex = address.length < 36 ? 1 : 0;
        } else if (address.slice(0, 4) == 'bc1p' || address.slice(0, 4) == 'tb1p') {//P2TR
            address_type.selectedIndex = 5;
        } else if (address[0] == '3' || address[0] == '2') {//P2SH
            address_type.selectedIndex = 2;
        } else {
            address_type.selectedIndex = 7;
        }
    });

    document.getElementById('tx_he_type').addEventListener('change', (ev) => {
        if (ev.target.value == '6') {
            document.getElementById('op_return_data').style.display = 'block';
            document.getElementById('tx_he_address').setAttribute('disabled', '');
            document.getElementById('tx_he_amount').value = '0';
            document.getElementById('tx_he_amount').setAttribute('disabled', '');
        } else {
            document.getElementById('op_return_data').style.display = 'none';
            document.getElementById('tx_he_address').removeAttribute('disabled');
            document.getElementById('tx_he_amount').removeAttribute('disabled');
            document.getElementById('tx_he_amount').value = '';
        }
    });

    document.getElementById('op_data').addEventListener('input', (ev) => {
        let count = Buffer.Buffer.from(ev.target.value.trim(), 'utf8').length;
        let node = ev.target.parentNode.querySelector('span');
        if (count < 81) {
            node.innerText = `Bytes entered: ${count}`;
            node.style.color = 'black';
        } else {
            node.innerText = `Exceeded 80 bytes: ${count}`;
            node.style.color = 'red';
        }
    })

    document.getElementById('fee_dollars').addEventListener('input', (ev) => {
        rate = parseFloat(document.getElementById('rate').value.replace(/,/g, ''));
        fee = Math.round(ev.target.value / rate * 100000000);
        document.getElementById('fee').innerText = fee;
        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
        let totalAmount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
        let tx_fee = parseInt(totalAmount) - parseInt(toOut);
        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
        fee_dollars = parseFloat(ev.target.value.trim());
        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * rate / 1000000) / 100;
        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));


        //        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(val)-fee);
    })

    document.getElementById('tx_he_output').addEventListener('click', (ev) => {
        if (document.getElementById('tx_he_type').value == '6') {
            let data = document.getElementById('op_data').value.trim();
            if (data != '') {
                storage_data(data);
            } else {
                alert("Please enter content to store on the Bitcoin blockchain!");
            }
            return;
        }
        let toAddress = document.getElementById('tx_he_address').value.trim();
        if (toAddress == '') {
            alert('Please enter recipient address!');
            return;
        }
        if (!isValidBitcoinAddress(toAddress, network)) {
            alert('Not a valid Bitcoin address! Please check the network of Bitcoin(click right-upper configuration icon)');
            return;
        }
        if (document.getElementById('tx_he_amount').value.trim() == '') {
            alert('Please enter amount!');
            return;
        }
        let toAmount = parseInt(document.getElementById('tx_he_amount').value.trim());
        let tx_fee = document.getElementById('tx_fee').innerText.replace(/,/g, '');
        if (toAmount > tx_fee) {
            alert('Recipient amount exceeds total amount!');
            return;
        }
        let inNode = document.createElement("div");
        inNode.setAttribute('class', 'txOut');
        inNode.innerHTML = `Recipient address: <span title='${toAddress}'>${toAddress}</span><br>Amount: <b>${new Intl.NumberFormat('en-US').format(toAmount)}</b> satoshis<br><input type="image" src="images/delete.png" title="Delete"
                    style="float: right; padding: 2px;" class="tx_in_delete">`;
        document.getElementById('tx_outs').appendChild(inNode);
        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
        let outAmount = parseInt(toOut) + toAmount;
        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(outAmount);
        tx_fee = parseInt(tx_fee) - toAmount;
        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));

        inNode.querySelector('input').addEventListener('click', (ev) => {
            let val = ev.target.parentNode.querySelector('b').innerText.replace(/,/g, '');
            let tx_fee = document.getElementById('tx_fee').innerText.replace(/,/g, '');
            let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
            tx_fee = parseInt(tx_fee) + parseInt(val);
            document.getElementById('tx_fee_alarm').style.visibility = tx_fee < fee ? 'visible' : 'hidden';
            document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
            document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
            document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - fee) < 0 ? 0 : (tx_fee - fee));
            document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(toOut) - parseInt(val));
            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
        });
        document.getElementById('tx_he_address').value = '';
        document.getElementById('tx_he_amount').value = '';
    })

    document.getElementById('private_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('tx_private').setAttribute('type', 'text');
    })

    document.getElementById('private_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('tx_private').setAttribute('type', 'password');
    })

    document.getElementById('password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('tx_password').setAttribute('type', 'text');
    })

    document.getElementById('password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('tx_password').setAttribute('type', 'password');
    })

    document.getElementById('import_input').addEventListener('click', (ev) => {
        let txInputs = document.querySelectorAll('#tx_ins>div');
        if (txInputs.length < 1) {
            alert('No inputs to sign!');
            return;
        }
        sign_index = 0;
        let tbody1 = document.querySelector('#sign_table>tbody');
        tbody1.innerHTML = '';
        let i = 0;

        psbt = psbt_bak = null;
        psbt = new bitcoin.Psbt({ network: network });
        psbt.setVersion(parseInt(document.getElementById('tx_version').value));
        psbt.setLocktime(parseInt(document.getElementById('tx_locktime').value));

        txInputs.forEach((inp) => {
            let inp_copy = inp.cloneNode(true);
            inp_copy.removeChild(inp_copy.querySelector('input'));
            psbt_addInput(inp_copy);
            let row = document.createElement('tr');
            row.innerHTML = `               <td></td>
                                            <td class="signed" id="td${i}0">√</td>
                                            <td class="signed" id="td${i}1">√</td>
                                            <td class="signed" id="td${i}2">√</td>
                                            <td class="signed" id="td${i}3">√</td>
                                            <td class="signed" id="td${i}4">√</td>
                                            <td class="signed" id="td${i}5">√</td>
                                            <td class="signed" id="td${i}6">√</td>
                                            <td class="signed" id="td${i}7">√</td>
                                            <td class="signed" id="td${i}8">√</td>
                                            <td class="signed" id="td${i}9">√</td>
                                            <td class="choosed"><input type="checkbox" name="tx_signs" value="${i}"></td>`;
            tbody1.appendChild(row);
            row.querySelector('td').appendChild(inp_copy);
            i++;
        })
        document.getElementById('tx_sign').dataset.id = i;
        let outputs = document.querySelectorAll('#tx_outs>.txOut');
        outputs.forEach((output) => {
            let amount = parseInt(output.querySelector('b').innerHTML.replace(/,/g, ''));
            if (amount > 0) {
                psbt.addOutput({
                    address: output.querySelector('span').getAttribute('title'),
                    value: amount
                });
            } else {//Store data on Bitcoin blockchain
                let content = Buffer.Buffer.from(output.querySelector('span').getAttribute('title'), 'utf8');
                let data = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, content]);
                psbt.addOutput({
                    script: data,
                    value: 0
                });
            }
        });
    })

    document.getElementById('tx_sign').addEventListener('click', (ev) => {
        if (ev.target.dataset.id && ev.target.dataset.id == "0") {
            alert('No inputs to sign!');
            return;
        }
        let sign_inputs = document.querySelectorAll("input[name='tx_signs']:checked");
        if (sign_inputs.length == 0) {
            alert("Please select inputs to sign!");
            return;
        }
        let private = document.getElementById('tx_private').value.trim();
        document.getElementById('tx_private').value = '****';
        if (private.length < 51) {
            alert('No private key entered or invalid private key!');
            return;
        }

        let ins = [];
        sign_inputs.forEach((e) => {
            ins.push(parseInt(e.value));
        })
        let inputs = document.querySelectorAll(".txIn");

        if (private.slice(0, 2) == '6P') {
            let password = document.getElementById('tx_password').value;
            if (password == '') {
                alert('Private key is encrypted but no password provided!');
                private = null;
                //                closeModal();
                return;
            } else {//Private key is password protected, need to decrypt
                try {
                    openModal('Please wait, decrypting and signing…');
                    if (!bip38.verify(private)) {
                        throw new Error('Not a valid encrypted private key!');
                    }
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(private, password, null, { N: N, r: r, p: p });
                    private = wif.encode({ version: isTestNet_bitcoin ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
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
            let keyPair = ECPair.fromWIF(private, network);
            ins.forEach((i) => {
                if (inputs[i].dataset.type == '5') {//P2TR address
                    psbt.updateInput(i, { tapInternalKey: toXOnly(keyPair.publicKey) });
                    keyPair = tweakSigner(keyPair, { network: network });
                }
            });
            if (!psbt_bak) {
                psbt_bak = psbt.clone();
            }
            ins.forEach((i) => {
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
            document.getElementById(`td${e}${sign_index}`).style.color = 'green';
        })

        sign_inputs.forEach((e) => {
            e.checked = false;
        })
        sign_index++;
        try {
            let signs = document.querySelector('#sign_table>tbody>tr').querySelectorAll('td[class="signed"').length;
            if (sign_index == signs) {
                document.querySelector(`#sign_table>thead>tr>th[colspan="${sign_index}"]`).setAttribute('colspan', `${sign_index + 1}`);
                let thNode = document.createElement('th');
                thNode.innerText = `${sign_index + 1}`;
                document.querySelectorAll('#sign_table>thead>tr')[1].appendChild(thNode);
                document.querySelectorAll('#sign_table>tbody>tr').forEach((e, i) => {
                    let tdNode = document.createElement("td");
                    tdNode.setAttribute('class', 'signed');
                    tdNode.setAttribute('id', `td${i}${sign_index}`);
                    tdNode.innerText = '√';
                    e.insertBefore(tdNode, e.querySelector('td[class="choosed"]'));
                });
            }
            //            closeModal();
        } catch (err) {
            //            closeModal();
            alert(err);
        }
    });

    document.getElementById('tx_delete_sign').addEventListener('click', (ev) => {
        //        document.getElementById('import_input').dispatchEvent(new Event('click'));
        if (psbt_bak) {
            psbt = psbt_bak.clone();
            document.querySelectorAll('#sign_table .signed').forEach(e => { e.style.color = 'white' });
            sign_index = 0;
        }
    });

    document.getElementById('output_tx_hex').addEventListener('click', (ev) => {
        for (let i = 0; i < psbt.data.inputs.length; i++) {
            psbt.validateSignaturesOfInput(i, psbt.data.inputs[i].tapInternalKey ? validator_schnorr : validator);//Verify signature
        }
        psbt.finalizeAllInputs();
        let tx = psbt.extractTransaction();
        document.getElementById('tx_hex').innerText = document.getElementById('txHex_edit').innerText = tx.toHex();
        //        document.getElementById('txHex_edit').innerText = document.getElementById('tx_hex').innerText;
        let tx_fee = document.getElementById('tx_fee').innerHTML.replace(/,/g, '');
        document.getElementById('dec_fee').innerHTML = `Transaction ID: ${tx.getId()}<span style="float: right">Fee: ${tx_fee} satoshis (${document.getElementById('tx_fee_dollar').innerHTML} USD)</span>`;
    });

    document.getElementById('deconstruction_tx').addEventListener('click', (ev) => {
        let rawTx = document.getElementById('txHex_edit').value.trim();
        if (rawTx == '') { return; }
        document.getElementById('dispatch_raw_hex').innerText = rawTx;
        document.getElementById('dispatch_result').parentNode.style.visibility = 'hidden';
        document.getElementById('dispatch_tx').removeAttribute('disabled');
        document.getElementById('dis_raw_hex').innerHTML = rawTx;
        let tx = '';
        try {
            tx = bitcoin.Transaction.fromHex(rawTx);
        } catch (err) {
            alert(`Invalid transaction data\n${err}`);
            return;
        }

        if (document.getElementById('tx_hex').innerHTML.trim() == '') {
            document.getElementById('dec_fee').innerHTML = `Transaction ID: ${tx.getId()}`;
        }
        let deconstruction = `
                <tr>
                    <td colspan="4" style="vertical-align: top;">Version</td>
                    <td>${tx.version}<br><span style="font-size: 0.8rem; color: #aaa">${rawTx.slice(0, 8)}</span>
                    </td>
                </tr>`;
        let wids = '';
        if (rawTx.slice(8, 12) == '0001') {//SegWit transaction
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
            <td colspan="4">Input count</td>
            <td>${tx.ins.length}</td>
        </tr>`;
        for (let i = 0; i < tx.ins.length; i++) {
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="${tx.ins[i].script.length > 0 ? 5 : 4}" style="width: 5.5rem;">Input ${i + 1}</td>
                    <td colspan="3" style="vertical-align: top; ${wids}">Transaction ID</td>
                    <td>${tx.ins[i].hash.toString('hex').replace(/(.{2})/g, "$1 ").split(" ").reverse().join("")}<br><span
                            style="font-size: 0.8rem; color: #aaa">${tx.ins[i].hash.toString('hex')} (little-endian)</small>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">Output index</td>
                    <td>${tx.ins[i].index}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].index, 8)}</span></td>
                </tr>
                <tr>
                    <td colspan="3">Input script length</td>
                    <td>${tx.ins[i].script.length}</td>
                </tr>`;
            if (tx.ins[i].script.length > 0) {
                deconstruction = deconstruction + `
                        <tr>
                            <td colspan="3" style="vertical-align: top;">Input script</td>
                            <td>${tx.ins[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.ins[i].script)}</span></td>
                        </tr>`;
            }
            deconstruction = deconstruction + `
                <tr>
                        <td colspan="3" style="vertical-align: top;">Sequence</td>
                        <td>${tx.ins[i].sequence}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].sequence, 8)} (hex)</span></td>
                    </tr>`;
        }
        deconstruction = deconstruction + `
                <tr>
                <td colspan="4">Output count</td>
                <td>${tx.outs.length}</td>
            </tr>`;
        for (let i = 0; i < tx.outs.length; i++) {
            deconstruction = deconstruction + `
                    <tr>
                        <td rowspan="4">Output ${i + 1}</td>
                        <td colspan="3" style="vertical-align: top;">${tx.outs[i].script[0] == 106 ? 'Stored content' : 'Address'}</td>
                        <td>${output2address(tx.outs[i].script.toString('hex'), !isTestNet_bitcoin)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="vertical-align: top;">Amount</td>
                        <td>${tx.outs[i].value} satoshis<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.outs[i].value, 16)}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="vertical-align: top;">Output script length</td>
                        <td>${tx.outs[i].script.length}<br><span style="font-size: 0.8rem; color: #aaa">${tx.outs[i].script.length.toString(16)} (hex)</span></td>
                    </tr>
                    <tr>
                        <td colspan="3" style="vertical-align: top;">Output script</td>
                        <td>${tx.outs[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.outs[i].script)} (assembly format)</span></td>
                    </tr>
            `;
        }
        let rows = 0;
        let end = '';
        if (rawTx.slice(8, 12) == '0001') {//Segregated Witness exists
            for (let i = 0; i < tx.ins.length; i++) {
                rows = rows + tx.ins[i].witness.length * 2 + 1;
                end = end + `
                        <td rowspan="${tx.ins[i].witness.length * 2 + 1}" style="width:4rem;">Witness ${i + 1}</td>
                        <td colspan="2" style="width:6rem">Item count</td>
                        <td>${tx.ins[i].witness.length}</td>
                    </tr>`;
                for (let j = 0; j < tx.ins[i].witness.length; j++) {
                    end = end + `
                        <tr>
                            <td rowspan="2" style="width:3rem">Item ${j + 1}</td>
                            <td style="width:4rem">Length</td>
                            <td>${tx.ins[i].witness[j].length}</td>
                        </tr>
                        <tr>
                            <td>Content</td>
                            <td>${tx.ins[i].witness[j].toString('hex')}</td>
                        </tr>`;
                }
            }
            deconstruction = deconstruction + `
                    <tr>
                        <td rowspan="${rows}">Witness data</td>`;
        }

        deconstruction = deconstruction + end + `
                    <tr>
                        <td colspan="4" style="vertical-align: top;">Locktime</td>
                        <td>${tx.locktime}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.locktime, 8)}</span></td>
                    </tr>
            `;
        document.querySelector('#deconstruction_table>tbody').innerHTML = deconstruction;
        document.getElementById('dialog_deconstruction_rawtx').showModal();
    })

    document.getElementById('tx_raw_copy').addEventListener('mouseover', (ev) => {
        ev.target.parentNode.querySelector('input').style.visibility = 'visible';
    })

    document.getElementById('tx_raw_copy').addEventListener('mouseout', (ev) => {
        ev.target.parentNode.querySelector('input').style.visibility = 'hidden';
        ev.target.parentNode.querySelector('span').style.visibility = 'hidden';
    })

    document.getElementById('tx_raw_copy').querySelector('input').addEventListener('click', (ev) => {
        let copyNode = document.getElementById('dispatch_raw_hex');
        let range = document.createRange();
        range.selectNodeContents(copyNode);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        navigator.clipboard.writeText(copyNode.innerText);
        ev.target.parentNode.querySelector('span').style.visibility = 'visible';
    })

    document.getElementById('dispatch_tx').addEventListener('click', (ev) => {
        let tx_hex = document.getElementById('dispatch_raw_hex').innerText;
        if (tx_hex == '') {
            return;
        }

        broadcastTransaction(tx_hex);
    })

    if (window.innerWidth < 1326) {
        alert("I don't allow cryptocurrency trading on mobile devices - they're the least secure! Please use a computer, preferably with Firefox browser.");
        window.close();
    }

    bitcoin.initEccLib(bitcoinerlabsecp256k1);

    doing = document.getElementById('waiting');
    //    document.getElementById('dialog_deconstruction_rawtx').showModal();

    checkEnv();
    window.addEventListener("online", checkEnv);
    window.addEventListener("offline", checkEnv);
});

(async function () {
    let l = window.location.pathname.split('/');
    let la = l[l.length - 2];
    if (!['zh', 'en', 'ar', 'ja', 'ko', 'es', 'fr'].includes(la)) {
        let langOld = lang;
        await openPage();
        if (langOld != lang) {
            l.splice(l.length - 1, 0, lang);
//            let newUrl = ;
            window.open(window.location.origin + l.join('/'), '_self');
        }
    }
})();
