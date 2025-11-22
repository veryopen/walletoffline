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

    document.getElementById('bitcoin_configure_network').addEventListener('change', (ev) => {
        bitcoin_isTestNet = true;
        let t = document.getElementById('test_or_main');
        t.value = "1";
        switch (parseInt(ev.target.value)) {
            case 0: bitcoin_network = bitcoin.networks.bitcoin;
                bitcoin_isTestNet = false;
                t.value = "0";
                break;
            case 1: bitcoin_network = bitcoin.networks.testnet;
                break;
            case 2: bitcoin_network = bitcoin.networks.regtest;
                break;
            default: break;
        }
        wallets.path = `m/84'/${bitcoin_isTestNet ? '1' : '0'}${wallets.path.slice(7)}`;
    })

    document.getElementById('bitcoin_configure_rate').addEventListener('blur', (ev) => {
        bitcoin_rate = parseFloat(ev.target.value.trim());
    });

    document.getElementById('bitcoin_configure_fee').addEventListener('blur', (ev) => {
        bitcoin_fee_dollars = parseFloat(ev.target.value.trim());
        bitcoin_fee_satoshi = Math.round(bitcoin_fee_dollars / bitcoin_rate * 100000000);
        //        document.getElementById('bitcoin_fee_satoshi').innerText = bitcoin_fee_satoshi;
        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
        let totalAmount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
        let tx_fee = parseInt(totalAmount) - parseInt(toOut);
        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));
    });

    document.getElementById('bitcoin_configure_language').addEventListener('change', (ev) => {
        switch (ev.target.value) {
            case 'cn':
                bitcoin_language = bip39.wordlists.chinese_simplified;
                //                bitcoin_language = solcoin_language = bip39.wordlists.chinese_simplified;
                break;
            case 'tw':
                bitcoin_language = bip39.wordlists.chinese_traditional;
                break;
            case 'ja':
                bitcoin_language = bip39.wordlists.japanese;
                break;
            case 'es':
                bitcoin_language = bip39.wordlists.spanish;
                break;
            case 'fr':
                bitcoin_language = bip39.wordlists.french;
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
                bitcoin_languagee = bip39.wordlists.english;
                ethereum_language = ethers.wordlists.en;
                break;
        }
    });
    /*
        litecoin_rate = parseFloat(document.getElementById('litecoin_gloabal_pars').querySelector('input').value.trim());
        litecoin_fee = Math.ceil(100000000 / litecoin_rate) * litecoin_fee_dollars;
        document.getElementById('litecoin_fee').innerText = litecoin_fee;
        document.getElementById('litecoin_fee_dollars').innerText = litecoin_fee_dollars;

        solcoin_rate = parseFloat(document.getElementById('solcoin_gloabal_pars').querySelector('input').value.trim());
        solcoin_fee = Math.ceil(solanaWeb3.LAMPORTS_PER_SOL / solcoin_rate) * solcoin_fee_dollars;

        document.getElementById('cover_crypto').style.visibility = 'visible';
        ethereum_isTestNet = document.getElementById('ethereum_gloabal_pars').querySelector('select').value == 0 ? false : true;
        solcoin_network = document.getElementById('solcoin_gloabal_pars').querySelector('select').value;
        isTestNet_solcoin = solcoin_network == 'mainnet-beta' ? false : true;
        litecoin_network = document.getElementById('litecoin_gloabal_pars').querySelector('select').value == 0 ? litecoinMainnet : litecoinTestnet;
        ethereum_rate = parseFloat(document.getElementById('ethereum_gloabal_pars').querySelector('input').value.trim());
        solcoin_rate = parseFloat(document.getElementById('solcoin_gloabal_pars').querySelector('input').value.trim());
        litecoin_rate = parseFloat(document.getElementById('litecoin_gloabal_pars').querySelector('input').value.trim());
        document.getElementById('configure_global_parameters').style.visibility = "hidden";
        document.getElementById('test_or_main').value = bitcoin_isTestNet ? '1' : '0';

        document.getElementById('litecoin_new_path').value = `m/84'/${litecoin_network.wif == 0xb0 ? 2 : 1}'/0'/0/0`;
        document.getElementById('litecoin_new_path').nextSibling.innerHTML = `　（说明：路径m/84'/${litecoin_network.wif == 0xb0 ? 2 : 1}'/i'/0/j表示第i+1个账户里的第j+1个钱包，i,j=0、1、2、…）`;

        let txHash = bitcoin_isTestNet ? "ffb32fbe3b0e260e38e82025d7dcf72a24feb3da455445015aaf8b8f9c9da68f" : "c6e81c4a315d7eed40cb32b2558f4b142d37959f7e8eb3eb5c43fdf2931cca42";
        getTxDetail(txHash, bitcoin_isTestNet, true).then((rawHex) => {
            if (rawHex.length > 20) {
                let address = bitcoin_isTestNet ? "tb1qng6f35spexs5nr80enz3a76kuz5s9m20um22xx" : "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
                getUtxo(address, bitcoin_isTestNet).then((ret) => {
                    canFetchRawTX = true;
                })
            }
        }).catch(err => {
            canFetchRawTX = false;
        });
    })
*/
    // document.querySelectorAll(".path").forEach(e => {
    //     e.addEventListener('change', ev => {
    //         wallets.path = "m/84'/" + document.getElementById('coin_type').value + "'/" + document.getElementById('account').value;
    //         wallets.path = wallets.path + "'/0/" + document.getElementById('address_index').value;
    //         document.getElementById('hd_path').innerText = "HD钱包路劲：" + wallets.path;
    //     });
    // });
    /*
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
    */

    document.getElementById('path').addEventListener('blur', (ev) => {
        let path1 = ev.target.value.trim();
        const reg_path = /([0-9]+)'\/([01])\/([0-9]+)$/;
        if (!reg_path.test(path1)) {
            alert("钱包路径不对，格式是“i'/0或者1/j”，i,j取值范围[0,2147483647]");
            return;
        }
        let paths = wallets.path.split('/');
        paths.splice(3, 10, path1);
        wallets.path = paths.join('/');
        //        wallets.path = wallets.path + "'/0/" + document.getElementById('address_index').value.trim();
        //        document.getElementById('hd_path').innerText = "HD钱包路劲：" + wallets.path;
    });

    document.getElementById('purpose').addEventListener('blur', (ev) => {
        let purpose = ev.target.value.trim();
        if (!['32', '44', '49', '84', '141'].includes(purpose)) {
            alert('类型必须是32、44、49、84、141之一！');
            return;
        }
        let paths = wallets.path.split('/');
        paths.splice(1, 1, purpose + "'");
        wallets.path = paths.join('/');
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
        document.getElementById('customize_binary').setAttribute('placeholder', `请输入${count * 32 / 3}位二进制（可以不输入）……`);
        let i = 12;
        for (; i < count; i++) {
            content = content + `<label class="mnemonic_customize_input">${i}.<input id="mnemonic_${i}" class="mnemonic_customize"></label>`;
            // if (i == 12) {
            //     content = content + `<br>`;
            // }
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
                    let index = ethereum_language.getWordIndex(evt.target.value.trim());
                    if (index == -1) {
                        evt.target.style.borderColor = 'orangered';
                        alert('你输入的字不在助记词集合中，请重新输入！');
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
                //ev.target.querySelector('div').style.maxHeight = "33rem";
                document.querySelectorAll(".parent").forEach((d) => {
                    if (ev.target != d) {
                        d.removeAttribute('open');
                    }
                });
                if (navigator.onLine) {
                    //alert("请先让浏览器脱机工作（按Alt，左上角“文件”》“脱机工作”）！");
                }
            } /* else {
                ev.target.querySelector('div').style.maxHeight = "0rem";
            } */
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
                //                ev.target.querySelector(".wallet1").style.cssText = "height: 700px; padding: 3rem;";
            } else {
                //                ev.target.querySelector(".wallet1").style.cssText = "height:0px; padding: 0px;";
            }
        });
    });

    document.querySelectorAll(".sunzi").forEach(e => {
        e.addEventListener('toggle', (ev) => {
            if (ev.target.open) {
                document.querySelectorAll(".sunzi").forEach((d) => {
                    if (ev.target != d) {
                        d.removeAttribute('open');
                        d.querySelector('summary').style.borderBottom = '';
                    }
                });
                ev.target.querySelector('summary').style.borderBottom = '1px solid';
            }
        });
    });

    document.getElementById('bitcoin_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('seed_password').setAttribute('type', 'text');
    });

    document.getElementById('bitcoin_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('seed_password').setAttribute('type', 'password');
    });

    document.getElementById('new_wallet').addEventListener('click', (ev) => {
        wallets.mnemonic = bip84.generateMnemonic(parseInt(document.getElementById('mnemonic_length').value) * 32 / 3, null, bitcoin_language);;
        document.getElementById('mnemonic').value = wallets.mnemonic;
        document.getElementById('seed').value = '';
        document.getElementById('root_privatekey').value = '';
        recover_wallet();
    });

    document.getElementById('reset_wallet').addEventListener('click', (ev) => {
        document.getElementById('mnemonic_length').value = '24';
        document.getElementById('mnemonic').value = '';
        document.getElementById('seed_password').value = '';
        document.getElementById('path').value = "0'/0/0";
        document.getElementById('purpose').value = '84';
        //        document.getElementById('address_index').value = '0';
        document.getElementById('view_wallet').innerHTML = '';
        document.getElementById('prompt').style.visibility = 'hidden';
        document.getElementById('seed').value = '';
        document.getElementById('root_privatekey').value = '';

        wallets = {
            mnemonic: '',
            mnemonic_length: 24,
            seed_password: '',
            path: `m/84'/${bitcoin_isTestNet ? "1" : "0"}'/0'/0/0`,
        };
        hd_more = {
            seed: '',
            rood_ext_key: '',
            accPri: '',
            accPub: ''
        };

        //        document.getElementById('hd_path').innerText = "HD钱包路劲：" + wallets.path;
        document.getElementById('view_account_pri').setAttribute('disabled', '');
        document.getElementById('view_more').innerHTML = '';
    });

    document.getElementById('select_cryptocurrency').addEventListener('change', (evt) => {
        cryptoType = parseInt(evt.target.value);
        let p = document.getElementById('decryptKey');
        switch (cryptoType) {
            case 0:
            case 2:
            case 3:
                p.setAttribute('placeholder', "输入十六进制私钥（省略前缀0x）或者WIF格式私钥…");
                break;
            case 60:
            case 501:
                p.setAttribute('placeholder', "输入以0x为前缀的十六进制私钥…");
                break;
        }
    });

    document.getElementById('encrypt').addEventListener('click', async (ev) => {
        let decryptKey = document.getElementById("decryptKey").value.trim();
        if (decryptKey == '') {
            alert('请输入明文密钥！');
            return;
        }
        let passwd = document.getElementById("password").value.trim();
        if (passwd == '') {
            alert('请输入密码！');
            return;
        }
        ev.target.setAttribute("disabled", "");
        document.getElementById('encryptKey').value = '正在努力加密，请稍侯……';
        await openModal('请稍后，正在加密…');
        //        let isCompressed = document.querySelector('input[name="isCompressed"]').getAttribute('checked') == '' ? true : false;
        let N = parseInt(document.getElementById('N_id').value.trim());
        let r = parseInt(document.getElementById('r_id').value.trim());
        let p = parseInt(document.getElementById('p_id').value.trim());
        try {
            let compressed = true;
            let privateKey;
            if (decryptKey.slice(0, 2) == '0x' && decryptKey.length == 66) {
                privateKey = Buffer.Buffer.from(decryptKey.slice(2), 'hex');
            } else {
                switch (cryptoType) {
                    case 0://比特币
                        let decoded = wif.decode(decryptKey, bitcoin_isTestNet ? 239 : 128);
                        compressed = decoded.compressed;
                        privateKey = decoded.privateKey;
                        break;
                    case 60://以太币
                        privateKey = Uint8Array.from(Buffer.Buffer.from(decryptKey.slice(2), 'hex'));
                        break;
                    case 2://莱特币
                        privateKey = ECPair.fromWIF(decryptKey, litecoin_network).privateKey;
                        break;
                    case 3://狗狗币
                        privateKey = ECPair.fromWIF(decryptKey, dogecoin_network).privateKey;
                        break;
                    case 501://索拉纳
                        break;
                    default:
                        break;
                }
            }
            bip38.encryptAsync(privateKey, compressed, passwd, null, { N: N, r: r, p: p }).then((encryptedKey) => {
                document.getElementById('encryptKey').value = encryptedKey;
                ev.target.removeAttribute("disabled");
                closeModal();
                ev.target.removeAttribute("disabled");
            }).catch((error) => {
                ev.target.removeAttribute("disabled");
                document.getElementById('encryptKey').value = '';
                //                throw new Error(error);
                throw error;
            });
        } catch (error) {
            ev.target.removeAttribute("disabled");
            closeModal();
            alert(error);
        }
    });

    document.getElementById('decrypt').addEventListener('click', async (ev) => {
        let encryptedKey = document.getElementById("encryptKey").value.trim();
        if (encryptKey == '') {
            alert('请输入密文私钥！');
            return;
        }
        let passwd = document.getElementById("password").value.trim();
        if (passwd == '') {
            alert('请输入密码！');
            return;
        }
        if (!bip38.verify(encryptedKey)) {
            alert('不是一个合法的加密私钥！');
            return;
        }
        await openModal('请稍后，正在解密…');
        ev.target.setAttribute("disabled", "");
        //        let isCompressed = document.querySelector('input[name="isCompressed"]').getAttribute('checked') == '' ? true : false;
        let N = parseInt(document.getElementById('N_id').value.trim());
        let r = parseInt(document.getElementById('r_id').value.trim());
        let p = parseInt(document.getElementById('p_id').value.trim());
        document.getElementById('decryptKey').value = '正在努力解密，请稍侯……';
        document.getElementById("format").innerText = '';
        bip38.decryptAsync(encryptedKey, passwd, null, { N: N, r: r, p: p }).then((decryptKey) => {
            switch (cryptoType) {
                case 0: //比特币（bitcoin）
                    let pri_wif = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
                    const privateKey = wif.decode(pri_wif, bitcoin_isTestNet ? 239 : 128).privateKey;
                    let pri_hex = privateKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
                    document.getElementById('decryptKey').value = 'WIF格式：' + pri_wif + '\n\n\n原始格式（hex):\n' + pri_hex;
                    document.getElementById("format").innerText = decryptKey.compressed ? "这是一个压缩格式的私钥" : "这是一个非压缩格式的私钥";
                    break;
                case 60://以太币（ethereum）
                case 501://索尔币（solana）
                    document.getElementById('decryptKey').value = `0x${Buffer.Buffer.from(decryptKey.privateKey).toString('hex')}`;
                    break;
                case 2://莱特币（litecoin）
                    document.getElementById('decryptKey').value = wif.encode({ version: litecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
                    break;
                case 3://狗狗币（dogecoin）
                    document.getElementById('decryptKey').value = wif.encode({ version: dogecoin_network.wif, privateKey: decryptKey.privateKey, compressed: true });
                    break;
                default:
                    break;
            }
            ev.target.removeAttribute("disabled");
            closeModal();
        }).catch((error) => {
            document.getElementById('decryptKey').value = '';
            ev.target.removeAttribute("disabled");
            closeModal();
            alert("解密失败！" + error);
        });
    });

    document.getElementById("decryptKey").addEventListener('blur', (e) => {
        let privateKey = document.getElementById("decryptKey").value.trim();
        document.getElementById("format").innerText = "";
        privateKey = privateKey.slice(0, 2) == '0x' ? privateKey.slice(2) : privateKey;
        if (privateKey.length === 64) {
            const hexRegex = /^[0-9A-Fa-f]{64}$/;
            if (hexRegex.test(privateKey)) {
                document.getElementById("format").innerText = "这是十六进制私钥"
                return true;
            }
        }
        switch (cryptoType) {
            case 0: //比特币（bitcoin）
                if (privateKey == '' || privateKey.slice(0, 3) == 'WIF') {
                    document.getElementById("format").innerText = '';
                } else {
                    try {
                        let decoded = wif.decode(privateKey, bitcoin_isTestNet ? 239 : 128);
                        document.getElementById("format").innerText = decoded.compressed ? "这是一个压缩格式的比特币私钥" : "这是一个非压缩格式的比特币私钥";
                    } catch (error) {
                        document.getElementById("format").innerText = "这是非法的私钥"
                    }
                }
                break;
            case 60: //以太币（ethereum）
                if (privateKey.length != 66 || privateKey.slice(0, 2) != '0x') {
                    document.getElementById("format").innerText = "这是不是一个合法的以太币私钥！";
                }
                break;
            case 2://莱特币（litecoin）
                // 检查是否为WIF格式 (通常以6、T、K或L开头)
                if (privateKey.length >= 51 && privateKey.length <= 52) {
                    const firstChar = privateKey[0];
                    if (['6', 'T', 'K', 'L'].includes(firstChar)) {
                        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
                        if (base58Regex.test(privateKey)) {
                            return true;
                        }
                    }
                }
                document.getElementById("format").innerText = "这是一个不合法的私钥！";
                break;
            case 501://索尔币（solana）
                break;
            default:
                break;
        }
    });

    document.getElementById('eyes').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('password').setAttribute('type', 'text');
    });

    document.getElementById('eyes').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('password').setAttribute('type', 'password');
    });

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
            path: `m/84'/${bitcoin_isTestNet ? 1 : 0}'/0'/0/0`,
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
                    document.getElementById(e.dataset['id']).querySelector
                }
            });
            switch (et.currentTarget.getAttribute('data-id')) {
                case 'ethereum_html': //以太币
                    cryptoType = 60;
                    et.currentTarget.style.borderTop = "#333 solid 2px";
                    break;
                case 'bitcoin_html': //比特币
                    cryptoType = 0;
                    break;
                case 'litecoin_html': //莱特币
                    cryptoType = 2;
                    et.currentTarget.style.borderTop = "#333 solid 2px";
                    break;
                case 'dogecoin_html': //狗狗币
                    cryptoType = 3;
                    et.currentTarget.style.borderTop = "#333 solid 2px";
                    break;
                default:
                    break;
            }
            document.getElementById('cover_crypto').setAttribute('src', `images/${et.currentTarget.dataset['id']}.png`);
            et.currentTarget.style.borderBottom = "#fff solid 2px";
            document.getElementById(et.currentTarget.dataset['id']).style.visibility = 'visible';
            et.currentTarget.querySelector('figure').style.background = "url(../images/current.png) right center no-repeat";
            document.getElementsByTagName('main')[0].style.backgroundColor = et.currentTarget.style.backgroundColor;
            document.getElementsByTagName('body')[0].style.backgroundColor = et.currentTarget.style.backgroundColor;
        });
    });

    document.getElementById('view_account_pri').addEventListener('click', (ev) => {
        document.getElementById('view_more').innerHTML = `　　　　种子：${hd_more.seed}<br>　根扩展私钥：${hd_more.rood_ext_key}<br>账户扩展私钥：${hd_more.accPri}<br>账户扩展公钥：${hd_more.accPub}`;
    });

    document.getElementById('fromWif_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('fromWif_password').setAttribute('type', 'text');
    });

    document.getElementById('fromWif_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('fromWif_password').setAttribute('type', 'password');
    });
    /*
        document.getElementById('fromWif_privateKey_eye').addEventListener("mousedown", (ev) => {
            ev.target.setAttribute('src', '../images/openeye.png');
            document.getElementById('fromPrivateKey_private').setAttribute('type', 'text');
        });
    
        document.getElementById('fromWif_privateKey_eye').addEventListener("mouseup", (ev) => {
            ev.target.setAttribute('src', '../images/closeeye.png');
            document.getElementById('fromPrivateKey_private').setAttribute('type', 'password');
        });
    */
    document.getElementById('fromPrivateKey_ok_btn').addEventListener('click', async (et) => {
        let pri_key = document.getElementById('fromPrivateKey_private').value.trim();
        if (pri_key == '') {
            alert("请先输入私钥");
            return;
        }
        document.getElementById('address_td1').innerHTML = '';
        document.getElementById('address_td2').innerHTML = '';
        document.getElementById('private_td1').innerHTML = '';
        document.getElementById('private_td2').innerHTML = '';
        document.getElementById('public_td1').innerHTML = '';
        document.getElementById('public_td2').innerHTML = '';

        if (pri_key.slice(0, 2) == '6P') {
            let password = document.getElementById('fromWif_password').value.trim();
            if (password == '') {
                alert('私钥已经加密，但是没有提供私钥的保护密码！');
                pri_key = null;
                return;
            } else {//私钥被密码保护，需要解密
                try {
                    await openModal('请稍后，正在解密…');
                    if (!bip38.verify(pri_key)) {
                        throw new Error('不是一个合法的加密私钥！');
                    }
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(pri_key, password, null, { N: N, r: r, p: p });
                    pri_key = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
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
            if (/^[01]{256}$/.test(pri_key)) {//二进制私钥
                const bytes = pri_key.match(/.{1,8}/g) || [];
                const p = new Uint8Array(
                    bytes.map(byte => parseInt(byte.padEnd(8, '0'), 2))
                );
                pri_key = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: p, compressed: true });
            }else if (/^[0-9a-fA-F]{64}$/.test(pri_key)) {//十六进制私钥（没有前缀0x）
                //                pri_key = ECPair.fromPrivateKey(Buffer.Buffer.from(pri_key, 'hex'), { network: bitcoin_network }).toWIF();
                pri_key = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: Buffer.Buffer.from(pri_key, 'hex'), compressed: true });
            }
            let keyPair = ECPair.fromWIF(pri_key, bitcoin_network);//压缩私钥产生压锁公钥，非压缩私钥产生非压缩公钥。
            if (!keyPair.compressed) {
                pri_key = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: wif.decode(pri_key, bitcoin_isTestNet ? 239 : 128).privateKey, compressed: true });
                keyPair = ECPair.fromWIF(pri_key, bitcoin_network);
            }
            let { address: address_p2pkh } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin_network });
            let { address: address_p2wpkh } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: bitcoin_network });

            // 下面产生p2sh-p2wpkh地址：
            const witnessPubKeyHash = bitcoin.crypto.hash160(keyPair.publicKey);
            const witnessScript = bitcoin.script.compile([
                bitcoin.opcodes.OP_0,
                witnessPubKeyHash
            ]);
            const redeemScript = bitcoin.script.compile([
                bitcoin.opcodes.OP_HASH160,
                bitcoin.crypto.hash160(witnessScript),
                bitcoin.opcodes.OP_EQUAL
            ]);
            const address_p2sh_p2wpkh = bitcoin.address.fromOutputScript(redeemScript, bitcoin_network);
            //let { address: address_p2sh } = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }) });

            //            bitcoin.initEccLib(bitcoinerlabsecp256k1);
            let { address: address_p2tr } = bitcoin.payments.p2tr({ internalPubkey: Buffer.Buffer.from(toXOnly(keyPair.publicKey)), network: bitcoin_network });
            document.getElementById('address_td1').innerHTML = `P2TR地址：<br>P2WPKH地址：<br>P2SH-P2WPKH：<br>P2PKH地址：<br>`;
            document.getElementById('address_td2').innerHTML = `${address_p2tr}（密钥路径）<br>${address_p2wpkh}<br>${address_p2sh_p2wpkh}<br>${address_p2pkh}`;

            //2. 产生各种编码格式的私钥：
            let rawPrivateKey = wif.decode(pri_key, bitcoin_isTestNet ? 239 : 128);//0x80（128）：比特币主网，0xEF（239）：测试网
            let pri_compress = pri_key;
            let pri_uncompress = pri_key;
            if (rawPrivateKey.compressed) {
                pri_uncompress = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: rawPrivateKey.privateKey, compressed: false });
            } else {
                pri_compress = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: rawPrivateKey.privateKey, compressed: true });
            }
            let pri_raw = rawPrivateKey.privateKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            let pri_binary = '';
            rawPrivateKey.privateKey.forEach(b => { pri_binary += b.toString(2).padStart(8, '0'); });
            let pri_bs58 = bs58check.default.encode(rawPrivateKey.privateKey);
            document.getElementById('private_td1').innerHTML = `压缩WIF：<br>非压缩WIF：<br>Base58编码：<br>原始（十六进制）：<br>原始（二进制）：`;
            document.getElementById('private_td2').innerHTML = `${pri_compress}<br>${pri_uncompress}<br>${pri_bs58}<br>${pri_raw}<br><div style='width: 36rem; overflow-wrap: anywhere;'>${pri_binary}</div>`;
            /*
            const { BIP32Factory } = require('bip32');
            const ecc = require('tiny-secp256k1');
            const bip32 = BIP32Factory(ecc);
            const seed_hex = 'b8be3287cf5fa124e7ecf079f02a209d4f77c3dc9d96c0c3c0874c7e9834c5a82c2c4bd9f3223f7a3a25ad670724c044250d2531fd69551b09d82b7f2edcb4a1';
            const seed = Buffer.from(seed_hex,'hex');
            var root = bip32.fromSeed(seed);
            let rootExtendedPrivateKey = root.toBase58();
            */
            //3. 产生各种格式的公钥：
            let pub_compress = '';
            let pub_uncompress = '';
            if (keyPair.compressed) {
                pub_compress = keyPair.publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
                pub_uncompress = ECPair.fromWIF(pri_uncompress, bitcoin_network).publicKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');//非压缩私钥产生非压缩公钥
            }
            let schnorrPubKey = bitcoinerlabsecp256k1.xOnlyPointFromScalar(keyPair.privateKey);//产生Schnorr 公钥
            schnorrPubKey = schnorrPubKey.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
            document.getElementById('public_td1').innerHTML = `压缩公钥：<br><br>非压缩公钥：<br>`;
            document.getElementById('public_td2').innerHTML = `${pub_compress}（ECDSA算法产生的公钥-最普遍）<br>${schnorrPubKey}（Schnorr算法产生的公钥-最先进）<br>${pub_uncompress.slice(0, 66)}<br>${pub_uncompress.slice(66)}`;

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
        document.getElementById('fromPrivateKey_private').value = '';
        document.getElementById('fromWif_password').value = '';
    })

    document.getElementById('wallet_balance_btn').addEventListener('click', async (et) => {
        let wallet_address = document.getElementById('wallet_address').value.trim();
        if (wallet_address == '') {
            alert("请先输入钱包地址或者交易id");
            return;
        }//bc1qujepl0k5n0ga2e86yskvxa6auehpf6dlf84dx0或者3Nntbr1ReGL4hCzgr8fGhFvKJvKzcAYENC或者7548329a72f9982bbe50fecad6fe9b4242877c75b1c950c3660b839e41f2e989
        if (wallet_address.length < 64) {//按钱包地址查询
            if (!isValidAddress(wallet_address, bitcoin_network)) {
                alert('不是合法的比特币地址！');
                return;
            }
            await openModal('请稍后，正在获取…');
            getUtxo(wallet_address, bitcoin_network != bitcoin.networks.bitcoin).then((ret) => {
                document.getElementById('view_wallet_balance').innerHTML = `余额：${ret.balance}聪（${ret.balance / 100000000}比特）。共有${ret.txrefs ? ret.txrefs.length : 0}个UTXO：`
                let ls = '';
                let ms = '';
                let rs = '';
                //                let i = 1;
                ret.txrefs?.forEach((b, i) => {
                    ls = ls + `<br>${i}<br><br><br>`;
                    //                    i++;
                    ms = ms + `交易ID（tx_hash）：<br>输出序号（tx_output_n）：<br>金额（value）：<br><br>`;
                    rs = rs + `<a href="javascript:view_tx('${b.tx_hash}')" style="text-decoration:none">${b.tx_hash}</a><br>${b.tx_output_n}<br>${b.value}聪<br><br>`;
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
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('bitcoin_segment_password').setAttribute('type', 'text');
        document.getElementById('bitcoin_segment_privateKey').setAttribute('type', 'text');
    });

    document.getElementById('bitcoin_segment_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('bitcoin_segment_password').setAttribute('type', 'password');
        document.getElementById('bitcoin_segment_privateKey').setAttribute('type', 'password');
    });

    document.getElementById('bitcoin_signature_btn').addEventListener('click', async (ev) => {
        const segmentText = document.getElementById('bitcoin_segment_text').value.trim();
        if (segmentText == '') {
            alert('被签名的文本不能为空！');
            return;
        }
        let pri_wif = document.getElementById('bitcoin_segment_privateKey').value.trim();
        if (pri_wif) {
            if (pri_wif.slice(0, 2) == '6P') {
                let password = document.getElementById('bitcoin_segment_password').value;
                if (password == '') {
                    pri_wif = null;
                    alert('私钥已经加密，但是没有提供私钥的保护密码！');
                    return;
                } else {//私钥被密码保护，需要解密
                    let brek = 0;
                    try {
                        if (!bip38.verify(pri_wif)) {
                            throw new Error('不是一个合法的加密私钥！');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        await openModal('请稍后，正在解密…');
                        brek = 1;
                        let decryptKey = bip38.decrypt(pri_wif, password, null, { N: N, r: r, p: p });
                        brek = 0;
                        closeModal();
                        pri_wif = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
                    } catch (error) {
                        if (brek == 1) {
                            closeModal();
                        }
                        pri_wif = null;
                        alert(error);
                        return;
                    };
                }
            }

            let keyPair;
            try {
                keyPair = ECPair.fromWIF(pri_wif, bitcoin_network);
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
    });

    document.getElementById('bitcoin_veify_btn').addEventListener('click', (ev) => {
        const segmentText = document.getElementById('bitcoin_segment_text').value.trim();
        const signature = document.getElementById('bitcoin_segment_result').value.trim();
        const p2wpkhAddress = document.getElementById('bitcoin_segment_address').value.trim();
        if (!segmentText || !signature || !p2wpkhAddress) {
            alert("被签名的文本、签名和地址不能缺少！");
            return;
        }
        let isValid;
        try {
            isValid = bitcoinjsMessage.verify(segmentText, p2wpkhAddress, signature);
        } catch (err) {
            const decodedP2wpkh = bitcoin.address.fromBech32(p2wpkhAddress);
            const p2pkhAddress = bitcoin.address.toBase58Check(decodedP2wpkh.data, bitcoin_network.pubKeyHash);
            isValid = bitcoinjsMessage.verify(segmentText, p2pkhAddress, signature);
        }
        ev.target.parentNode.querySelector('#bitcoin_segment_verify_result').style.visibility = 'visible';
        ev.target.parentNode.querySelector('#bitcoin_segment_verify_result').setAttribute('src', isValid ? 'images/sign_ok.png' : 'images/sign_failed.png');

    });

    document.getElementById('bitcoin_reset_btn').addEventListener('click', (ev) => {
        document.getElementById('bitcoin_segment_verify_result').style.visibility = 'hidden';
        document.getElementById('bitcoin_segment_text').value = '';
        document.getElementById('bitcoin_segment_result').value = '';
        document.getElementById('bitcoin_segment_address').value = '';
        document.getElementById('bitcoin_segment_password').value = '';
        document.getElementById('bitcoin_segment_privateKey').value = '';
    });

    document.getElementById('recover_wallet').addEventListener('click', (e) => {
        recover_wallet();
    });

    document.getElementById('close_dialog').addEventListener("click", () => {
        document.getElementById('wallet_dialog').close();
    });

    document.getElementById('dialog_dec_close').addEventListener("click", () => {
        document.getElementById('dialog_deconstruction_rawtx').close();
    });

    document.getElementById('view_raw_tx').addEventListener('click', (ev) => {
        let txID = document.getElementById('wallet_dialog').querySelector('h3').innerText.slice(5);
        getTxDetail(txID, bitcoin_network != bitcoin.networks.bitcoin, true).then((rawTX) => {
            //            const tx = bitcoin.Transaction.fromHex(rawTX);
            document.getElementById('display_rawtx').innerHTML = rawTX;
            //            alert(rawTX);
        });
    });

    document.getElementById('gen_multi_sign').addEventListener('click', (ev) => {
        let pubKeys_str = document.getElementById('get_multi_address').value.trim().split(',').filter(e => e != '');
        if (pubKeys_str.length < 2) { alert('至少两个公钥！'); return };
        for (let i = 0; i < pubKeys_str.length; i++) {
            if (pubKeys_str[i].length != 66) {
                alert(`此公钥长度不对：${pubKeys_str[i]}`);
                document.getElementById('dis_multi_address').innerHTML = '';
                document.getElementById('get_multi_redeem').innerHTML = '';
                return;
            }
        }
        //        let pubKeys_arr = pubKeys_str.map(hex => Buffer.Buffer.from(hex, 'hex'));
        //        let signs = parseInt(document.getElementById('signs').value);
        //        let redeem_script = bitcoin.payments.p2ms({ m: signs, pubkeys: pubKeys_arr });
        let script_asm = document.getElementById('get_multi_redeem').value.trim().replace(/\s+/g, ' ');
        let script_hex = bitcoin.script.fromASM(script_asm);
        const redeem_hash = bitcoin.crypto.hash160(script_hex);
        const p2sh_address = bitcoin.address.toBase58Check(redeem_hash, 0x05);
        const output_ASM = `OP_HASH160 ${redeem_hash.toString('hex')} OP_EQUAL`;
        /*        
                let redeem_script = bitcoin.payments.p2ms({ output: script_hex, network: bitcoin_network });
        
                const p2sh = bitcoin.payments.p2sh({
                    redeem: redeem_script,
                    network: bitcoin_network
                });
        */
        const p2wsh = bitcoin.payments.p2wsh({
            redeem: { output: script_hex },
            //            output: bitcoin.script.fromASM(output_ASM),
            network: bitcoin_network
        });

        document.getElementById('dis_multi_address').innerHTML = `
        <span style="width: 7rem; display: inline-block; text-align: right;">P2SH地址：</span>${p2sh_address}<br>
        <span style="width: 7rem; display: inline-block; text-align: right;color: gray">输出脚本：</span><small style="color: gray">${output_ASM}</small><br>
        <!--span style="width: 7rem; display: inline-block; text-align: right;color: gray">赎回脚本：</span><small style="color: gray">${script_asm}</small><br&nbsp;&nbsp;&nbsp;&nbsp;
        <span style="width: 7rem; display: inline-block; text-align: right;">P2WSH地址：</span>${p2wsh.address}<br>
        <span style="width: 7rem; display: inline-block; text-align: right;color: gray">输出脚本：</span><small style="color: gray">${bitcoin.script.toASM(p2wsh.output)}</small><br>
        <!--span style="width: 7rem; display: inline-block; text-align: right;color: gray">赎回脚本：</span><small style="color: gray">${script_asm}</small><br&nbsp;&nbsp;&nbsp;&nbsp;`;
    })

    document.getElementById('gen_route_btn').addEventListener('click', (ev) => {
        let internalPubkey = document.getElementById('internalPublickey').value.trim();
        let spends = `1. 密钥路径花钱：使用公钥${internalPubkey}对应的私钥签名。<br><br>2. 脚本路径花钱方法有`;
        const merkle_string = document.getElementById('get_route_mast').value.trim().replace(/\n/g, "").replace(/\s+/g, ' ');
        if (!internalPubkey || !merkle_string) {
            alert("内部公钥和默克尔树都不能为空！");
            return;
        }
        internalPubkey = toXOnly(Buffer.Buffer.from(internalPubkey, 'hex'));
        //        console.log(merkle_string);
        const merkleTree = string2MerkleTree(merkle_string);
        const p2tr = bitcoin.payments.p2tr({
            internalPubkey: internalPubkey,                                   // 使用您的公钥作为内部密钥(去掉压缩前缀)
            scriptTree: merkleTree,
            bitcoin_network
        });
        document.getElementById('dis_route_address').innerHTML = `
            <span style="width: 7rem; display: inline-block; text-align: right;">P2TR地址：</span>${p2tr.address}<br>
            <span style="width: 7rem; display: inline-block; text-align: right;">默克尔树根：</span>${p2tr.hash.toString('hex')}<br>
            <span style="width: 7rem; display: inline-block; text-align: right;">Taproot公钥：</span>${p2tr.pubkey.toString('hex')}<br>
            <span style="width: 7rem; display: inline-block; text-align: right;">输出脚本：</span>${p2tr.output.toString('hex')}
        `;
        //下面计算各个叶子脚本对应的控制块，花费时需要用到脚本路径控制块
        merkle2binaryTree(merkleTree, binaryTree.root);
        binaryTree.postOrderTraversal(binaryTree.root, branchHash);//计算非叶子节点的哈希
        let data = Buffer.Buffer.concat([internalPubkey, Buffer.Buffer.from(binaryTree.root.value, 'hex')]);                                            //内部公钥在前面
        const t = bitcoin.crypto.taggedHash('TapTweak', data);
        const tapRoot = bitcoinerlabsecp256k1.xOnlyPointAddTweak(internalPubkey, t);
        binaryTree.root.t = t;
        binaryTree.root.parity = tapRoot.parity;

        //下面计算各个叶子脚本对应的控制块（采用脚本路径花费时需要用到）
        //<0xc0|parity><internalPubkey><从叶子到根路径上的兄弟哈希>
        const prefix = Buffer.Buffer.concat([Buffer.Buffer.from([leafVersion | binaryTree.root.parity]), internalPubkey]).toString('hex');
        spends = spends + `${leaf_scripts.length}种：<br>`;
        leaf_scripts.forEach((leaf, i) => {
            let siblings = '';
            for (let n = leaf.up; n.up; n = n.up) {
                let h = n.up.left == n ? n.up.right.value : n.up.left.value;
                siblings = siblings + h;
            }
            spends = `${spends}(${i + 1}). 脚本 = '${bitcoin.script.toASM(Buffer.Buffer.from(leaf.value, 'hex'))}'<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;控制块 = '${prefix + siblings}'<br><br>`;
            //            console.log(prefix + siblings);
        });
        document.getElementById('spend_p2tr_utxo').innerHTML = spends;
    });

    document.getElementById('multi_sign_help').addEventListener('click', (ev) => {
        document.getElementById('help').style.width = "400px";
        document.getElementById('help_content').innerHTML = `
<p class="help">P2SH是Pay-to-Script-Hash的首字母缩写，意为支付到脚本的哈希——计算一个脚本的哈希并把它当作钱包的地址，这个脚本称为赎回脚本，即P2SH地址就是赎回脚本的哈希值并作base58check编码得到的值，即地址为RIPEMD160(SHA256(赎回脚本))，它允许在满足指定脚本（脚本执行结果为真）或一组条件的情况下使用比特币，而不仅仅是证明公钥的所有权。发送者在交易输出中包含花费资金所需的赎回脚本的哈希值，而无需知道赎回脚本本身的详细信息。以后，接收者可以构建自定义输入脚本（例如多重签名要求或其他复杂条件），并通过“提供”与哈希匹配的赎回脚本、必要的签名或数据来花费资金。P2SH地址支持多重签名钱包等高级应用，同时保护了隐私，因为脚本的细节是隐藏的。P2SH 还支持向后兼容性，因为它可用于以软分叉兼容的方式部署 SegWit 和其他协议升级。比如“38bPsA6ZXfRuxFD7efVXTkQd69422uzD4B”就是一个P2SH地址。
P2SH的一个典型应用案例是多签，即允许多个人签名才能花钱。
</p>
<p class="help">P2WSH是Pay-to-Witness-Script-Hash的首字母缩写，是在P2SH的基础上增加隔离见证，从而实现了隔离见证的多签这种极具吸引力的功能，一方面提高了效率、降低交易费用，另一方面还增强了比特币的智能合约功能（借鉴以太坊）。P2WSH虽然比常规 P2WPKH 更复杂，但为更高级的可扩展性和可编程性铺平了道路，相信会有越来越多人的使用它。</p>
`;
    });

    document.getElementById('bitcoin_customize_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('bitcoin_customize_password').setAttribute('type', 'text');
        document.getElementById('bitcoin_customize_privateKey').setAttribute('type', 'text');
    });

    document.getElementById('bitcoin_customize_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('bitcoin_customize_password').setAttribute('type', 'password');
        document.getElementById('bitcoin_customize_privateKey').setAttribute('type', 'password');
    });

    document.getElementById('bitcoin_customize_go').addEventListener('click', async (ev) => {
        const spendPass = document.getElementById('bitcoin_customize_spendpass').value.trim();
        let pri_wif = document.getElementById('bitcoin_customize_privateKey').value.trim();
        if (spendPass == '' || pri_wif == '') {
            alert('花钱暗语和私钥不能为空！');
            return;
        }
        if (pri_wif) {
            if (pri_wif.slice(0, 2) == '6P') {
                let password = document.getElementById('bitcoin_customize_password').value;
                if (password == '') {
                    pri_wif = null;
                    alert('私钥已经加密，但是没有提供私钥的保护密码！');
                    return;
                } else {//私钥被密码保护，需要解密
                    let brek = 0;
                    try {
                        if (!bip38.verify(pri_wif)) {
                            throw new Error('不是一个合法的加密私钥！');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        await openModal('请稍后，正在生成…');
                        brek = 1;
                        let decryptKey = bip38.decrypt(pri_wif, password, null, { N: N, r: r, p: p });
                        brek = 0;
                        closeModal();
                        pri_wif = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
                    } catch (error) {
                        if (brek == 1) {
                            closeModal();
                        }
                        pri_wif = null;
                        alert(error);
                        return;
                    };
                }
            }
            let keyPair;
            try {
                keyPair = ECPair.fromWIF(pri_wif, bitcoin_network);
            } catch (err) {
                alert(err);
                return;
            }
            const secretHash = bitcoin.crypto.hash160(bitcoin.crypto.sha256(Buffer.Buffer.from(spendPass, 'utf8')));
            const redeemScript = bitcoin.script.compile([
                bitcoin.opcodes.OP_HASH160,
                secretHash,
                bitcoin.opcodes.OP_EQUALVERIFY,
                keyPair.publicKey,
                bitcoin.opcodes.OP_CHECKSIG,
            ]);
            const p2wshPayment = bitcoin.payments.p2wsh({
                redeem: { output: redeemScript, network: bitcoin_network },
                network: bitcoin_network
            });
            document.getElementById('bitcoin_customize_result').innerHTML = `
            P2WSH钱包地址：${p2wshPayment.address}<br>赎回脚本：${bitcoin.script.toASM(redeemScript)}<br><span style="color: #aaa"><span style="width: 1000px; display: inline-block; text-align: right;">（赎回脚本格式：OP_HASH160 &lt;花钱暗语的哈希值的哈希值&gt; OP_EQUALVERIFY  &lt;公钥&gt; OP_CHECKSIG）</span>
            <br>输出脚本：${p2wshPayment.output.toString('hex')}<br>见证数据格式：&lt;签名&gt;&nbsp;&nbsp;&lt;花钱暗语的哈希值&gt;&nbsp;&nbsp;&lt;赎回脚本&gt;</span>
            <p style="color: red">必须牢记私钥、私钥保护密码（如果有）、花钱暗语和赎回脚本。</p>`;
        }
    });

    document.getElementById('bitcoin_customize_reset').addEventListener('click', (ev) => {
        document.getElementById('bitcoin_customize_privateKey').value = '';
        document.getElementById('bitcoin_customize_password').value = '';
        document.getElementById('bitcoin_customize_spendpass').value = '';
        document.getElementById('bitcoin_customize_result').innerHTML = '';
    });

    document.getElementById('multi_route_help').addEventListener('click', (ev) => {
        document.getElementById('help').style.width = "400px";
        document.getElementById('help_content').innerHTML = `
<p class="help">
P2TR（Pay-to-Taproot）是专门针对比特币的一种最新发展起来的地址类型，由BIP86规范引入，Taproot 是 Bitcoin 的一次大升级，在区块 709632 处（2021 年 11 月 12 日）被激活。它结合了P2PK和P2SH的优点，采用施诺尔（Schnorr）签名算法（BIP340规范引入）而不再使用过去的ECDSA算法，从提供更强的隐私性和灵活性，采用了MAST（Merkel抽象语法树，由BIP341规范引入）和Tapscript（由BIP342规范引入），在保持简化结构的同时支持复杂交易。P2TR地址通过增强隐私、提高效率和灵活性，为比特币网络带来更强的扩展性和隐私保护。MAST树的高度不能超过128。
P2TR类型的输出脚本为Schnorr公钥的哈希值加上OP_1前缀组成，这一点与P2PKH一样，只不过后者的公钥是普通的公钥。Schnorr公钥也称为聚合公钥，详见后续介绍内容。
P2TR地址生成方式不同于前述方式，而且采用了Bech32m编码，Bech32m是Bech32的改进，因为后者存在一个缺陷：只要地址的末尾字符为p，那么在它之前不管插入多少个q，都不会影响地址的校验和。
P2TR类型的输出存在两种花费方法：第一种方法是提供聚合签名和聚合公钥，第二种方法是提供MAST树上包含的任一输出脚本对应的输入脚本（类似P2SH）以及路径。矿工判断一笔交易具体采用何种花费方式：如果对应的隔离见证的条款只有一项，说明就是第一种花费方法，如果对应的隔离见证的条款有多项，说明就是第二种花费方法。
</p>
`;
    });

    document.querySelector("#help>input").addEventListener('click', (ev) => {
        ev.target.parentNode.style.width = "0px";
    });

    document.getElementById('reset_multi_sign').addEventListener('click', (ev) => {
        document.getElementById('least_sign').innerText = '*';
        document.getElementById('get_multi_address').value = '';
        document.getElementById('dis_multi_address').innerHTML = '';
        document.getElementById('get_multi_redeem').value = '';
    });

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
    });

    document.getElementById('signs').addEventListener('input', (ev) => {
        let inp = document.getElementById('get_multi_address').value.trim();
        if (inp == '') { return }
        let inps = inp.split(',').filter(e => e != '');
        calculate_redeem_script(inps);
    });
    /*
        document.querySelectorAll('.tx_in_delete')?.forEach(btn => {
            btn.addEventListener('click', (ev) => {
                let val = ev.target.parentNode.querySelector('b').innerText.replace(/,/g,'');
                let amount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
                let formattedAmount = new Intl.NumberFormat('en-US').format(parseInt(amount) - parseInt(val));
                document.getElementById('tx_amount').innerText = formattedAmount;
                let tar = document.querySelector("div[data-uid='"+ev.target.parentNode.dataset.uid+"']");
                if(tar){
                    tar.querySelector('span').style.visibility = 'hidden';
                    tar.querySelector('buttun').removeAttribute('disabled');
                }
                ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
            });
        })
    */
    document.getElementById('tx_me_utxo').addEventListener('click', async (et) => {
        let wallet_address = document.getElementById('tx_me_address').value.trim();
        if (wallet_address == '') {
            alert("请先输入钱包地址或者交易id");
            return;
        }//bc1qujepl0k5n0ga2e86yskvxa6auehpf6dlf84dx0或者3Nntbr1ReGL4hCzgr8fGhFvKJvKzcAYENC或者7548329a72f9982bbe50fecad6fe9b4242877c75b1c950c3660b839e41f2e989
        if (!isValidAddress(wallet_address, bitcoin_network)) {
            alert('不是合法的比特币地址！可能比特币网络选择错误。');
            return;
        }

        if (canFetchRawTX) {
            await openModal('请稍后，正在获取UTXO…');
            getUtxo(wallet_address, bitcoin_network != bitcoin.networks.bitcoin).then((ret) => {
                let balance = ret.txrefs.reduce((total, item) => { return total + item.value; }, 0);
                document.getElementById('tx_wallet_balance').innerHTML = `<br>钱包余额：${balance}聪（${balance / 100000000}个比特币），共有${ret.txrefs ? ret.txrefs.length : 0}个UTXO：`
                let ls = '';
                let ms = '';
                let rs = '';
                //            let i = 0;
                outx = ret.txrefs || [];
                //            outx.forEach((b) => {
                for (let i = 0; i < outx.length; i++) {
                    let b = outx[i];
                    //                ls = ls + `<p style="line-height: 37px;"><button data-i="${i}">花费</button></p><hr>`;
                    let uid = bitcoin.crypto.sha1(Buffer.Buffer.from(b.tx_hash + b.tx_output_n)).slice(0, 5).toString('hex');
                    ms = ms + `交易ID&nbsp;<br>输出序号&nbsp;<br>金额&nbsp;<br><hr>`;
                    rs = rs + `<div data-uid='${uid}'>&nbsp;<a href="javascript:view_tx('${b.tx_hash}')" style="text-decoration:none">${b.tx_hash}</a><br>&nbsp;${b.tx_output_n}<br>&nbsp;${new Intl.NumberFormat('en-US').format(b.value)}聪<button data-i=${i} class="tx_btn_addInput" style="float: right;">花费</button><span style="visibility: hidden;float: right;color: green;font-size: 1.5rem;margin-right: 10px;">√</span><br><hr></div>`;
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
                        if (addressType == '2' || addressType == '4' || addressType == '6') {
                            let redeemObj = document.getElementById('redeem_script');
                            if (!redeemObj) {
                                alert('针对P2SH或P2WSH地址，必须提供赎回脚本！对于P2SH-P2WPKH地址，必须提供公钥！');
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
                        inNode.setAttribute('data-spendpass', document.getElementById('customize_spend_pass').value.trim());
                        inNode.innerHTML = `<span>交易ID：</span><a href="javascript:view_tx('${outx[i].tx_hash}')" style="text-decoration:none" title="${outx[i].tx_hash}">${outx[i].tx_hash}</a><br>
                    <span>序号：</span><b class='output_index'>${outx[i].tx_output_n}</b><br><span>金额：</span><b class="value">${new Intl.NumberFormat('en-US').format(outx[i].value)}</b>聪<br>
                    <span>顺序号：</span><b class='sequence'>${sequence}</b><br><span>地址：</span><code title="${address}">${address}</code><br><input type="image" src="../images/delete.png" title="删除"
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
                            document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
                            document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                            document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
                            document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));
                            //                        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(amount) - parseInt(val)-bitcoin_fee_satoshi);
                            let tar = document.querySelector("#tx_utxo_td1>div[data-uid='" + ev.target.parentNode.dataset.uid + "']");
                            if (tar) {
                                tar.querySelector('span').style.visibility = 'hidden';
                                tar.querySelector('button').removeAttribute('disabled');
                            }
                            let i = parseInt(ev.target.parentNode.parentNode.dataset.number);
                            i--;
                            ev.target.parentNode.parentNode.dataset.number = `${i}`;
                            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
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
                        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
                        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
                        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
                        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));
                    });
                })
                closeModal();
            }).catch(err => {
                document.getElementById('no_network').style.display = 'block';
                closeModal();
                alert(err);
            });
        } else {
            document.getElementById('no_network').style.display = 'block';
            alert("Can't get the UTXO automatically, you need to manually enter the data");
        }
    });

    document.querySelector('#no_network>button').addEventListener('click', (ev) => {
        let tx_hex = document.getElementById('manual_txHex').value.trim();
        if (tx_hex == '') {
            alert("请输入交易的原始Hex串！");
            return;
        }
        let tx = bitcoin.Transaction.fromHex(tx_hex);
        let addressType = document.getElementById('tx_me_type').value;
        let redeem_script = '';
        if (addressType != '2' || addressType != '4') {
            let redeemObj = document.getElementById('redeem_script');
            if (!redeemObj) {
                alert('P2SH或P2WSH类型的地址，必须提供赎回脚本！');
                return;
            }
            redeem_script = redeemObj.querySelector('textarea').value.trim();
        }
        let out_index = parseInt(document.getElementById('manual_index').value.trim());
        if (out_index >= tx.outs.length) {
            alert(`你出入的输出序号${out_index}大于交易的最大输出序号${tx.outs.length - 1}`);
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
        inNode.innerHTML = `<span>交易ID：</span><a href="javascript:view_tx('${tx_id}')" style="text-decoration:none" title="${tx_id}">${tx_id}</a><br>
        <span>序号：</span><b class='output_index'>${out_index}</b><br><span>金额：</span><b class="value">${new Intl.NumberFormat('en-US').format(tx.outs[out_index].value)}</b>聪<br>
        <span>顺序号：</span><b class='sequence'>${sequence}</b><br><span>地址：</span><code title="${address}">${address}</code><br><input type="image" src="../images/delete.png" title="删除"
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
            document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
            document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
            document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
            document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));

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
        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));
    });

    document.getElementById('manual_txId').addEventListener('blur', (ev) => {
        let txId = ev.target.value.trim();
        if (txId.length != 64) {
            alert("必须位64位的十六进制字符串！");
            return;
        }
        let url = bitcoin_isTestNet ? `https://blockstream.info/testnet/api/tx/${txId}/hex` : `https://blockchain.info/rawtx/${txId}?format=hex`;
        ev.target.parentNode.querySelector('#manual_txHex_tips').innerHTML = `访问&nbsp;<b style="font-size: small;">${url}</b>&nbsp;，把结果粘贴在下面：`;
        ev.target.parentNode.querySelector('#manual_txHex').value = '';
    });

    document.getElementById('tx_me_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        if (address.legnth < 26) { return };
        let address_type = document.getElementById('tx_me_type');
        if (address.slice(0, 4) == 'bc1q' || address.slice(0, 4) == 'tb1q') {//长度小于50的为P2WPKH，否则为P2WSH
            address_type.selectedIndex = address.length < 50 ? 3 : 4;
        } else if (address[0] == '1' || address[0] == 'm' || address[0] == 'n') {//长度小于36的为P2PKH，否则为P2PK
            address_type.selectedIndex = address.length < 36 ? 1 : 0;
        } else if (address.slice(0, 4) == 'bc1p' || address.slice(0, 4) == 'tb1p') {//P2TR
            address_type.selectedIndex = 5;
        } else if (address[0] == '3' || address[0] == '2') {//P2SH 或者 P2SH-P2WPKH：3-正式，2-测试。
            try {
                // Decode the address
                const decoded = bitcoin.address.fromBase58Check(address);

                // Check if the address is a P2SH address
                if (decoded.version == bitcoin_network.scriptHash) {

                    // Check if the script is P2WPKH
                    const redeemScript = bitcoin.script.compile([
                        bitcoin.opcodes.OP_0,
                        decoded.hash // This is the 20-byte public key hash
                    ]);

                    // Decompile the redeem script and check if it's a valid P2WPKH format
                    const script = bitcoin.script.decompile(redeemScript);

                    // Check if the script matches the P2WPKH format
                    if (script && script[0] === bitcoin.opcodes.OP_0 && script[1].length === 20) {
                        address_type.selectedIndex = 6;
                    } else {
                        address_type.selectedIndex = 2;
                    }
                }
            } catch (e) {
                return false; // Invalid address format
            }
        } else {
            address_type.selectedIndex = 7;
        }
        document.getElementById('tx_wallet_balance').innerHTML = '';
        document.getElementById('tx_utxo_td0').innerHTML = '';
        document.getElementById('tx_utxo_td1').innerHTML = '';
        address_type.dispatchEvent(new Event('change'));
    });

    document.getElementById('tx_me_type').addEventListener('change', (ev) => {
        if (ev.target.value == 2 || ev.target.value == 4) {
            document.querySelector('#redeem_script>p').innerHTML = '赎回脚本：';
            document.querySelector('#redeem_script>textarea').setAttribute('placeholder', '汇编格式的赎回脚本…');
            document.querySelector('#redeem_script>textarea').setAttribute('rows', '3');
            document.getElementById('redeem_script').style.display = 'block';
        } else if (ev.target.value == 6) {
            document.querySelector('#redeem_script>p').innerHTML = '公钥：';
            document.querySelector('#redeem_script>textarea').setAttribute('placeholder', '输入地址对应的公钥…');
            document.querySelector('#redeem_script>textarea').setAttribute('rows', '1');
            document.getElementById('redeem_script').style.display = 'block';
        } else {
            document.getElementById('redeem_script').style.display = 'none';
            return;
        }
        document.getElementById('customize_checkbox').addEventListener('click', (ev) => {
            if (ev.target.checked) {
                document.getElementById('customize_spend_pass').style.visibility = 'visible';
            } else {
                document.getElementById('customize_spend_pass').style.visibility = 'hidden';
            }
        });
    });

    document.getElementById('tx_he_address').addEventListener('input', (ev) => {
        let address = ev.target.value.trim();
        if (address.length < 26) { return };
        let address_type = document.getElementById('tx_he_type');
        if (address.slice(0, 4) == 'bc1q' || address.slice(0, 4) == 'tb1q') {//长度小于50的为P2WPKH，否则为P2WSH
            //        document.getElementById('coin_type').selectedIndex = 0;
            address_type.selectedIndex = address.length < 50 ? 3 : 4;
        } else if (address[0] == '1' || address[0] == 'm' || address[0] == 'n') {//长度小于36的为P2PKH，否则为P2PK
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
        if (ev.target.value == '7') {
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
            node.innerText = `已输入字节数：${count}`;
            node.style.color = 'black';
        } else {
            node.innerText = `已超过80个字节：${count}`;
            node.style.color = 'red';
        }
    })
    /*
        document.getElementById('bitcoin_fee_dollars').addEventListener('input', (ev) => {
            //        rate = parseFloat(document.getElementById('rate').value.replace(/,/g, ''));
            bitcoin_fee_satoshi = Math.round(ev.target.value / bitcoin_rate * 100000000);
            document.getElementById('bitcoin_fee_satoshi').innerText = bitcoin_fee_satoshi;
            let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
            let totalAmount = document.getElementById('tx_amount').innerText.replace(/,/g, '');
            let tx_fee = parseInt(totalAmount) - parseInt(toOut);
            document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
            bitcoin_fee_dollars = parseFloat(ev.target.value.trim());
            document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
            document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
            document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));
    
    
            //        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(val)-bitcoin_fee_satoshi);
        })
    */
    document.getElementById('tx_he_output').addEventListener('click', (ev) => {
        if (document.getElementById('tx_he_type').value == '6') {//OP_RETURN
            let data = document.getElementById('op_data').value.trim();
            if (data != '') {
                storage_data(data);
            } else {
                alert("要输入存储在比特币链上的内容！");
            }
            return;
        }
        let toAddress = document.getElementById('tx_he_address').value.trim();
        if (toAddress == '') {
            alert('请输入对方地址！');
            return;
        }
        if (!isValidAddress(toAddress, bitcoin_network)) {
            alert('不是合法的比特币地址！');
            return;
        }
        if (document.getElementById('tx_he_amount').value.trim() == '') {
            alert('请输入入账金额！');
            return;
        }
        let toAmount = parseInt(document.getElementById('tx_he_amount').value.trim());
        let tx_fee = document.getElementById('tx_fee').innerText.replace(/,/g, '');
        if (toAmount > tx_fee) {
            alert('对方入账大于总金额！');
            return;
        }
        let inNode = document.createElement("div");
        inNode.setAttribute('class', 'txOut');
        inNode.innerHTML = `对方地址：<span title='${toAddress}'>${toAddress}</span><br>入账金额：<b>${new Intl.NumberFormat('en-US').format(toAmount)}</b>聪<br><input type="image" src="../images/delete.png" title="删除"
                    style="float: right; padding: 2px;" class="tx_in_delete">`;
        document.getElementById('tx_outs').appendChild(inNode);
        let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
        let outAmount = parseInt(toOut) + toAmount;
        document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(outAmount);
        tx_fee = parseInt(tx_fee) - toAmount;
        document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
        document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
        document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
        document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));

        inNode.querySelector('input').addEventListener('click', (ev) => {
            let val = ev.target.parentNode.querySelector('b').innerText.replace(/,/g, '');
            let tx_fee = document.getElementById('tx_fee').innerText.replace(/,/g, '');
            let toOut = document.getElementById('tx_itInput').innerText.replace(/,/g, '');
            tx_fee = parseInt(tx_fee) + parseInt(val);
            document.getElementById('tx_fee_alarm').style.visibility = tx_fee < bitcoin_fee_satoshi ? 'visible' : 'hidden';
            document.getElementById('tx_fee').innerText = new Intl.NumberFormat('en-US').format(tx_fee);
            document.getElementById('tx_fee_dollar').innerText = Math.round(tx_fee * bitcoin_rate / 1000000) / 100;
            document.getElementById('tx_he_amount').setAttribute('placeholder', (tx_fee - bitcoin_fee_satoshi) < 0 ? 0 : (tx_fee - bitcoin_fee_satoshi));
            document.getElementById('tx_itInput').innerText = new Intl.NumberFormat('en-US').format(parseInt(toOut) - parseInt(val));
            ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
        });
        document.getElementById('tx_he_address').value = '';
        document.getElementById('tx_he_amount').value = '';
    });

    document.getElementById('private_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('tx_private').setAttribute('type', 'text');
    });

    document.getElementById('private_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('tx_private').setAttribute('type', 'password');
    });

    document.getElementById('password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('tx_password').setAttribute('type', 'text');
    });

    document.getElementById('password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('tx_password').setAttribute('type', 'password');
    });

    document.getElementById('import_input').addEventListener('click', (ev) => {
        let txInputs = document.querySelectorAll('#tx_ins>div');
        if (txInputs.length < 1) {
            alert('没有可签名的输入！');
            return;
        }
        sign_index = 0;
        let tbody1 = document.querySelector('#sign_table>tbody');
        tbody1.innerHTML = '';
        let i = 0;

        psbt = psbt_bak = null;
        psbt = new bitcoin.Psbt({ network: bitcoin_network });
        psbt.setVersion(parseInt(document.getElementById('tx_version').value));
        psbt.setLocktime(parseInt(document.getElementById('tx_locktime').value));

        txInputs.forEach((inp) => {
            let inp_copy = inp.cloneNode(true);
            inp_copy.removeChild(inp_copy.querySelector('input'));
            inp_copy.setAttribute('class', 'import_txIn');
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
            } else {//在比特币区块链上存储数据
                let content = Buffer.Buffer.from(output.querySelector('span').getAttribute('title'), 'utf8');
                let data = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, content]);
                psbt.addOutput({
                    script: data,
                    value: 0
                });
            }
        });
    });

    document.getElementById('tx_sign').addEventListener('click', async (ev) => {
        if (!psbt_bak) {
            psbt_bak = psbt.clone();
        }
        if (ev.target.dataset.id && ev.target.dataset.id == "0") {
            alert('没有可签名的输入！');
            return;
        }
        let sign_inputs = document.querySelectorAll("input[name='tx_signs']:checked");
        if (sign_inputs.length == 0) {
            alert("请选择需要签名的输入！");
            return;
        }
        let private = document.getElementById('tx_private').value.trim();
        document.getElementById('tx_private').value = '****';
        if (private.length < 51) {
            alert('没输入私钥或者不是合法私钥！');
            return;
        }

        let ins = [];
        sign_inputs.forEach((e) => {
            ins.push(parseInt(e.value));
        })
        let inputs = document.querySelectorAll(".import_txIn");

        if (private.slice(0, 2) == '6P') {
            let password = document.getElementById('tx_password').value;
            if (password == '') {
                alert('私钥已经加密，但是没有提供私钥的保护密码！');
                private = null;
                //                closeModal();
                return;
            } else {//私钥被密码保护，需要解密
                try {
                    await openModal('请稍后，正在解密并签名…');
                    if (!bip38.verify(private)) {
                        throw new Error('不是一个合法的加密私钥！');
                    }
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(private, password, null, { N: N, r: r, p: p });
                    private = wif.encode({ version: bitcoin_isTestNet ? 239 : 128, privateKey: decryptKey.privateKey, compressed: decryptKey.compressed });
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
            let keyPair = ECPair.fromWIF(private, bitcoin_network);
            ins.forEach((i) => {
                if (inputs[i].dataset.type == '5') {//P2TR地址
                    psbt.updateInput(i, { tapInternalKey: toXOnly(keyPair.publicKey) });
                    keyPair = tweakSigner(keyPair, { network: bitcoin_network });
                }
                psbt.signInput(i, keyPair);
                if (inputs[i].dataset.type == '4' && inputs[i].dataset.spendpass != '') {//P2WSH地址
                    // 创建见证数据：签名 + 花钱密码 + 赎回脚本
                    const myFinalizer = (inputIndex, input) => {
                        // 构建正确的 Witness 堆栈：[花钱密码, 签名]
                        const witnessStack = [
                            input.partialSig[0].signature,    // 签名 (Buffer)
                            bitcoin.crypto.sha256(Buffer.Buffer.from(inputs[i].dataset.spendpass, 'utf8')), // 花钱密码 (Buffer)
                            bitcoin.script.fromASM(inputs[i].dataset.redeem)//赎回脚本
                        ];

                        // 序列化 Witness 堆栈
                        // Witness 堆栈需要被序列化为单个 Buffer：
                        // [条目数] [条目1长度] [条目1] [条目2长度] [条目2] ...
                        // 我们使用 `varuint-bitcoin` 库来编码长度。
                        const witness = witnessStackToScriptWitness(witnessStack);

                        return {
                            finalScriptSig: Buffer.Buffer.from(""),
                            finalScriptWitness: witness
                        };
                    };
                    //非标赎回脚本，不需要验证签名。
                    psbt.finalizeInput(0, myFinalizer);
                } else {
                    psbt.validateSignaturesOfInput(i, psbt.data.inputs[i].tapInternalKey ? validator_schnorr : validator);
                    psbt.finalizeInput(i);
                }
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
        let tx = psbt.extractTransaction();
        document.getElementById('tx_hex').innerText = document.getElementById('txHex_edit').innerText = tx.toHex();
        let tx_fee = document.getElementById('tx_fee').innerHTML.replace(/,/g, '');
        document.getElementById('dec_fee').innerHTML = `交易Id：${tx.getId()}<span style="float: right">交易费用：${tx_fee}聪（${document.getElementById('tx_fee_dollar').innerHTML}美元）</span>`;
    });

    document.getElementById('deconstruction_tx').addEventListener('click', (ev) => {
        let rawTx = document.getElementById('txHex_edit').value.trim();
        if (rawTx == '') { return; }
        document.getElementById('dispatch_raw_hex').innerText = rawTx;
        //        document.getElementById('dispatch_result').parentNode.style.visibility = 'hidden';
        document.getElementById('dispatch_tx').removeAttribute('disabled');
        document.getElementById('dis_raw_hex').innerHTML = rawTx;
        let tx = '';
        try {
            tx = bitcoin.Transaction.fromHex(rawTx);
        } catch (err) {
            alert(`非法的交易数据\n${err}`);
            return;
        }

        if (document.getElementById('tx_hex').innerHTML.trim() == '') {
            document.getElementById('dec_fee').innerHTML = `交易Id：${tx.getId()}`;
        }
        let deconstruction = `
                <tr>
                    <td colspan="4" style="vertical-align: top;">版本</td>
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
            <td colspan="4">输入个数</td>
            <td>${tx.ins.length}</td>
        </tr>`;
        for (let i = 0; i < tx.ins.length; i++) {
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="${tx.ins[i].script.length > 0 ? 5 : 4}" style="width: 5rem;">第${i + 1}个输入</td>
                    <td colspan="3" style="vertical-align: top; ${wids}">交易id</td>
                    <td>${tx.ins[i].hash.toString('hex').replace(/(.{2})/g, "$1 ").split(" ").reverse().join("")}<br><span
                            style="font-size: 0.8rem; color: #aaa">${tx.ins[i].hash.toString('hex')}（小端序）</small>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">输出序号</td>
                    <td>${tx.ins[i].index}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].index, 8)}</span></td>
                </tr>
                <tr>
                    <td colspan="3">输入脚本长度</td>
                    <td>${tx.ins[i].script.length}</td>
                </tr>`;
            if (tx.ins[i].script.length > 0) {
                deconstruction = deconstruction + `
                    <tr>
                        <td colspan="3" style="vertical-align: top;">输入脚本</td>
                        <td>${tx.ins[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.ins[i].script)}</span></td>
                    </tr>`;
            }
            deconstruction = deconstruction + `
            <tr>
                    <td colspan="3" style="vertical-align: top;">顺序号</td>
                    <td>${tx.ins[i].sequence}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.ins[i].sequence, 8)}（16进制）</span></td>
                </tr>`;
        }
        deconstruction = deconstruction + `
            <tr>
            <td colspan="4">输出个数</td>
            <td>${tx.outs.length}</td>
        </tr>`;
        for (let i = 0; i < tx.outs.length; i++) {
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="4">第${i + 1}个输出</td>
                    <td colspan="3" style="vertical-align: top;">${tx.outs[i].script[0] == 106 ? '存储内容' : '地址'}</td>
                    <td>${output2address(tx.outs[i].script.toString('hex'), bitcoin_network)}</td>
                </tr> 
                <tr>
                    <td colspan="3" style="vertical-align: top;">金额</td>
                    <td>${tx.outs[i].value}聪<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.outs[i].value, 16)}</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">输出脚本长度</td>
                    <td>${tx.outs[i].script.length}<br><span style="font-size: 0.8rem; color: #aaa">${tx.outs[i].script.length.toString(16)}（16进制）</span></td>
                </tr>
                <tr>
                    <td colspan="3" style="vertical-align: top;">输出脚本</td>
                    <td>${tx.outs[i].script.toString('hex')}<br><span style="font-size: 0.8rem; color: #aaa">${bitcoin.script.toASM(tx.outs[i].script)}（汇编格式）</span></td>
                </tr>
        `;
        }
        let rows = 0;
        let end = '';
        if (rawTx.slice(8, 12) == '0001') {//存在隔离见证
            for (let i = 0; i < tx.ins.length; i++) {
                rows = rows + tx.ins[i].witness.length * 2 + 1;
                end = end + `
                    <td rowspan="${tx.ins[i].witness.length * 2 + 1}" style="width:3rem;">见证${i + 1}</td>
                    <td colspan="2" style="width:6rem">条款数量</td>
                    <td>${tx.ins[i].witness.length}</td>
                </tr>`;
                for (let j = 0; j < tx.ins[i].witness.length; j++) {
                    end = end + `
                    <tr>
                        <td rowspan="2" style="width:2.5rem">条款${j + 1}</td>
                        <td style="width:2rem">长度</td>
                        <td>${tx.ins[i].witness[j].length}</td>
                    </tr>
                    <tr>
                        <td>内容</td>
                        <td>${tx.ins[i].witness[j].toString('hex')}</td>
                    </tr>`;
                }
            }
            deconstruction = deconstruction + `
                <tr>
                    <td rowspan="${rows}">见证数据</td>`;
        }

        deconstruction = deconstruction + end + `
                <tr>
                    <td colspan="4" style="vertical-align: top;">锁住时间</td>
                    <td>${tx.locktime}<br><span style="font-size: 0.8rem; color: #aaa">${decToHex(tx.locktime, 8)}</span></td>
                </tr>
        `;
        document.querySelector('#deconstruction_table>tbody').innerHTML = deconstruction;
        document.getElementById('dialog_deconstruction_rawtx').showModal();
    });

    document.getElementById('tx_raw_copy').addEventListener('mouseover', (ev) => {
        ev.target.parentNode.querySelector('input').style.visibility = 'visible';
    });

    document.getElementById('tx_raw_copy').addEventListener('mouseout', (ev) => {
        ev.target.parentNode.querySelector('input').style.visibility = 'hidden';
        ev.target.parentNode.querySelector('span').style.visibility = 'hidden';
    });

    document.getElementById('tx_raw_copy').querySelector('input').addEventListener('click', (ev) => {
        let copyNode = document.getElementById('dispatch_raw_hex');
        let range = document.createRange();
        range.selectNodeContents(copyNode);
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        navigator.clipboard.writeText(copyNode.innerText);
        ev.target.parentNode.querySelector('span').style.visibility = 'visible';
    });

    document.getElementById('dispatch_tx').addEventListener('click', (ev) => {
        let tx_hex = document.getElementById('dispatch_raw_hex').innerText;
        if (tx_hex == '') {
            return;
        }

        broadcastTransaction(tx_hex);
    });

/*     Array.from(document.querySelectorAll("input")).forEach(inputObj => {
        inputObj.addEventListener("focus", (evt) => {
            //            evt.target.previousElementSibling.style.cssText = "color: blue;font-size: 14px;top: -1.2em;";
            evt.target.style.borderColor = "blue";
        });
        inputObj.addEventListener("blur", (evt) => {
            // if (evt.target.value == "")
            //     evt.target.previousElementSibling.style.cssText = "color: gray;font-size: 18px;top: 2px;";
            evt.target.style.borderColor = "black";
            //            evt.target.previousElementSibling.style.color = "gray";
        });
    });

 */    if (window.innerWidth < 1326) {
        alert("我是不让你在移动设备上买卖加密币的，移动设备是最不安全的！请使用电脑，最好采用火狐浏览器。");
        window.close();
    }

    bitcoin.initEccLib(bitcoinerlabsecp256k1);

    doing = document.getElementById('waiting');

    checkEnv();
    window.addEventListener("online", checkEnv);
    window.addEventListener("offline", checkEnv);
    document.getElementById('cover_crypto').style.visibility = 'visible';
    setTimeout(init_ok, 5000);
});

function init_ok() {
    let txHash = bitcoin_isTestNet ? "ffb32fbe3b0e260e38e82025d7dcf72a24feb3da455445015aaf8b8f9c9da68f" : "c6e81c4a315d7eed40cb32b2558f4b142d37959f7e8eb3eb5c43fdf2931cca42";
    getTxDetail(txHash, bitcoin_isTestNet, true).then((rawHex) => {
        if (rawHex.length > 20) {
            let address = bitcoin_isTestNet ? "tb1qng6f35spexs5nr80enz3a76kuz5s9m20um22xx" : "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
            getUtxo(address, bitcoin_isTestNet).then((ret) => {
                canFetchRawTX = true;
            })
        }
    }).catch(err => {
        canFetchRawTX = false;
    });
} 
