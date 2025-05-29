window.addEventListener("load", () => {
    document.getElementById('ethereum_new_language').addEventListener('change', (evt) => {
        switch (evt.target.value) {
            case 'cn': ethereum_language = wordlistsExtra.LangZh.wordlist("cn"); break;
            case 'tw': ethereum_language = wordlistsExtra.LangZh.wordlist("tw"); break;
            case 'ja': ethereum_language = wordlistsExtra.LangJa.wordlist("ja"); break;
            case 'es': ethereum_language = wordlistsExtra.LangEs.wordlist("es"); break;
            case 'fr': ethereum_language = wordlistsExtra.LangFr.wordlist("fr"); break;
            case 'it': ethereum_language = wordlistsExtra.LangIt.wordlist("it"); break;
            case 'ko': ethereum_language = wordlistsExtra.LangKo.wordlist("ko"); break;
            case 'pt': ethereum_language = wordlistsExtra.LangPt.wordlist("pt"); break;
            case 'cz': ethereum_language = wordlistsExtra.LangCz.wordlist("cz"); break;
            default: ethereum_language = ethers.wordlists.en; break;
        }
    })

    document.getElementById('ethereum_new_wallet').addEventListener('click', (ev) => {
        document.getElementById('ethereum_new_privatekey').value = '';
        //        document.getElementById('ethereum_new_private_password').value = '';
        document.getElementById('ethereum_mnemonic').value = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(parseInt(document.getElementById('ethereum_mnemonic_length').value) * 44 / 33), ethereum_language);
        openModal('Please wait, processing...');
        ethereum_recover_wallet();
        closeModal();
    });

    document.getElementById('ethereum_reset_wallet').addEventListener('click', (evt) => {
        document.getElementById('ethereum_mnemonic_length').value = "24";
        document.getElementById('ethereum_mnemonic').value = '';
        document.getElementById('ethereum_password').value = '';
        document.getElementById('ethereum_hd_wallet').innerHTML = '';
        document.getElementById('ethereum_new_privatekey').value = '';
        document.getElementById('ethereum_new_path').value = "m/44'/60'/0'/0/0";
        document.getElementById('ethereum_new_language').value = 'en';
        document.getElementById('ethereum_new_private_password').value = '';
        ethereum_language = ethers.wordlists.en;
    });

    document.getElementById('ethereum_recover_wallet').addEventListener('click', (evt) => {
        openModal('Please wait, processing...');
        ethereum_recover_wallet();
        closeModal();
    });

    document.getElementById('ethereum_wallet_balance_btn').addEventListener('click', (evt) => {
        let wallet_address = document.getElementById('ethereum_wallet_address').value.trim();
        if (wallet_address == '') {
            alert("Please enter wallet address or transaction ID first");
            return;
        }
        if (wallet_address.length == 42) {//Query by wallet address. 0xDeb5BF379E49300c78276167fBb8E3F18EA6C946
            if (!ethers.isAddress(wallet_address)) {
                alert('Not a valid Ethereum address!');
                return;
            }
            openModal('Please wait, fetching...');
            provider.getBalance(wallet_address).then(balance => {
                document.getElementById('ethereum_view_wallet_balance').innerHTML = `Wallet balance (ETH): ${ethers.formatEther(balance)}`;
                provider.getTransactionCount(wallet_address).then(nonce => {
                    let ret = document.getElementById('ethereum_view_wallet_balance');
                    ret.innerHTML = ret.innerHTML + `, Next available nonce: ${nonce}`;
                })
                closeModal();
            }).catch(err => { closeModal(); })
        } else if (wallet_address.length == 66) {//Query by transaction ID. 0x6ea6ca374431cccfee236eafd24e0d6d326d34e612ecd8b117322205f4e19f9c
            provider.getTransaction(wallet_address).then((tx) => {
                document.getElementById('ethereum_view_wallet_balance').innerHTML = `
                    Transaction hash: ${tx.hash}<br>
                    Block number: ${tx.blockNumber}<br>
                    Data: ${ethers.toUtf8String(tx.data)}<br>
                    From: ${tx.from}<br>
                    To: ${tx.to}<br>
                    Amount: ${ethers.formatEther(tx.value)} ETH<br>
                    Transaction fee: ${ethers.formatEther(tx.gasPrice * tx.gasLimit)} ETH
                `;
            })
        }
    });

    document.getElementById('ethereum_fee').addEventListener('blur', (evt) => {
        document.getElementById('ethereum_priority_fee').value = (parseFloat(evt.target.value.trim()) * 0.99).toFixed(2);
    })

    document.getElementById('ethereum_priority_fee').addEventListener("blur", (evt) => {
        let fee = parseFloat(document.getElementById('ethereum_fee').value.trim());
        if (parseFloat(evt.target.value.trim()) > fee) {
            alert("Tip cannot be greater than transaction fee!");
        }
    })

    document.getElementById('ethereum_ok_transfer').addEventListener('click', async function f(evt) {
        document.getElementById('ethereum_result_transfer').innerHTML = '';
        let to = document.getElementById('ethereum_to').value.trim();
        if (!ethers.isAddress(to)) {
            alert("Invalid recipient address!");
            return;
        }
        let value = document.getElementById('ethereum_value').value.trim();
        let fee = parseFloat(document.getElementById('ethereum_fee').value.trim());
        if (fee > 100 || fee < 0.5) {
            alert("Warning: Transaction fee is too high or too low");
        }
        let privateKey = document.getElementById('ethereum_privateKey').value.trim();
        openModal('Please wait, processing...');
        if (privateKey.slice(0, 2) == '6P') {
            let password = document.getElementById('ethereum_private_password').value;
            if (password == '') {
                privateKey = null;
                closeModal();
                alert('Private key is encrypted but no password provided!');
                return;
            } else {//Private key is password protected, need to decrypt
                try {
                    if (!bip38.verify(privateKey)) {
                        throw new Error('Not a valid encrypted private key!');
                    }
                    let N = parseInt(document.getElementById('N_id').value.trim());
                    let r = parseInt(document.getElementById('r_id').value.trim());
                    let p = parseInt(document.getElementById('p_id').value.trim());
                    let decryptKey = bip38.decrypt(privateKey, password, null, { N: N, r: r, p: p });
                    privateKey = `0x${Buffer.Buffer.from(decryptKey.privateKey).toString('hex')}`;
                } catch (error) {
                    private = null;
                    closeModal();
                    alert(error);
                    return;
                };
            }
        }

        let nonce = parseInt(document.getElementById('ethereum_nonce').value.trim());
        const wallet = new ethers.Wallet(privateKey, provider);
        if (nonce == -1) {
            try {
                nonce = await wallet.getNonce();
                document.getElementById('ethereum_nonce').value = nonce;
            } catch (err) {
                closeModal();
                alert('Network error, please enter nonce manually!');
                document.getElementById('ethereum_nonce').removeAttribute('disabled');
                document.getElementById('ethereum_nonce').style.border = "1px solid red";
                return;
            }
        }
        let data = document.getElementById('ethereum_data').value.trim();
        let comment = '';
        if (data.length > 0) {
            comment = ethers.hexlify(ethers.toUtf8Bytes(data));//String->HEX
        }
        let gasLimit = parseInt(document.getElementById('ethereum_gasLimit').value.trim());
        let type = document.getElementById('ethereum_tx_type').value;
        let tx = {
            to: to,
            value: ethers.parseEther(value),
            data: comment,
            gasLimit: gasLimit,
            nonce: nonce,
            chainId: isTestNet_ethereum ? 11155111 : 1 //Mainnet 1, Sepolia testnet 11155111
        }
        if (type == "0") {
            tx.gasPrice = Math.floor(fee * 10 ** 18 / (gasLimit * ethereum_rate));
            tx.type = 0;
        } else if (type == "2") {
            let max_priority_fee = parseFloat(document.getElementById('ethereum_priority_fee').value.trim());
            tx.type = 2;
            tx.maxFeePerGas = Math.floor(fee * 10 ** 18 / (gasLimit * ethereum_rate));
            tx.maxPriorityFeePerGas = Math.floor(max_priority_fee * 10 ** 18 / (gasLimit * ethereum_rate));
        }
        let txHex = '';
        wallet.signTransaction(tx).then((hex) => {
            txHex = hex;
        });
        let result = document.getElementById('ethereum_result_transfer');
        wallet.sendTransaction(tx).then((transaction) => {
            result.innerHTML = `Transaction sent, ID: ${transaction.hash}<br>Waiting for confirmation...<br>${txHex}<br>`;
            transaction.wait().then((receipt) => {
                result.innerHTML = result.innerHTML + `Transaction confirmed, block number: ${receipt.blockNumber}<br>`;
                provider.getBalance(wallet.address).then((balance) => {
                    result.innerHTML = result.innerHTML + `Wallet balance: ${ethers.formatEther(balance)}`;
                    closeModal();
                }).catch(err => {
                    closeModal();
                    alert(err);
                });
            }).catch(err => {
                closeModal();
                alert(err);
            });
        }).catch(err => {
            closeModal();
            result.innerHTML = `Network error! Please copy the HEX transaction below and broadcast it on a third-party website.<br><br>${txHex}<br><br>Third-party sites for broadcasting:<br>https://etherscan.io/pushTx`;
            alert(err);
        });
    })

    document.getElementById('ethereum_reset_transfer').addEventListener('click', (evt) => {
        document.getElementById('ethereum_to').value = '';
        document.getElementById('ethereum_value').value = '';
        document.getElementById('ethereum_privateKey').value = '';
        document.getElementById('ethereum_private_password').value = '';
        document.getElementById('ethereum_nonce').value = '-1';
        document.getElementById('ethereum_tx_type').value = '2';
        document.getElementById('ethereum_gasLimit').value = '21000';
        document.getElementById('ethereum_fee').value = '5';
        document.getElementById('ethereum_priority_fee').value = '4.9';
        document.getElementById('ethereum_data').value = '';
        document.getElementById('ethereum_result_transfer').innerHTML = '';
    });

    document.getElementById('ethereum_dispatch_tx').addEventListener('click', (evt) => {
        let txHex = document.getElementById('ethereum_dispatch_raw_hex').innerText.trim();
        if (txHex == '') {
            alert("Transaction HEX cannot be empty!");
            return;
        }
        if (provider != '') {
            openModal('Please wait, broadcasting...');
            document.getElementById('ethereum_dispatch_result').parentNode.style.visibility = 'visible';
            provider.broadcastTransaction(txHex).then((txResponse) => {
                let result = document.getElementById('ethereum_dispatch_result');
                result.innerHTML = `Transaction sent, ID: ${txResponse.hash}<br>Waiting for confirmation...`;
                txResponse.wait().then((receipt) => {
                    let result = document.getElementById('ethereum_dispatch_result');
                    result.innerHTML = result.innerHTML + `Transaction confirmed, block number: ${receipt.blockNumber}<br>`;
                    closeModal();
                }).catch(err => {
                    closeModal();
                    alert(err);
                });
            }).catch(err => {
                document.getElementById('ethereum_dispatch_result').innerHTML = `Broadcast failed: ${err}`;
                closeModal();
            });
        } else {
            alert("Network issue, unable to get available provider!");
        }
    })

    document.getElementById('ethereum_decode_tx').addEventListener('click', (evt) => {
        let txHex = document.getElementById('ethereum_dispatch_raw_hex').innerText.trim();
        if (txHex == '') {
            alert("Transaction HEX cannot be empty!");
            return;
        }
        const tx = ethers.Transaction.from(txHex);
        document.getElementById('dis_raw_hex').innerHTML = txHex;
        document.getElementById('dec_fee').innerHTML = `
            Transaction ID: ${tx.hash}　　　　Fee:
            ${tx.type == 2 ? ethers.formatEther(tx.maxFeePerGas * tx.gasLimit) : ethers.formatEther(tx.gasPrice * tx.gasLimit)} ETH
        `;
        let deconstruction = `
            <tr><td colspan="2" style="width: 10rem">From</td><td>${tx.from}</td></tr>
            <tr><td colspan="2">To</td><td>${tx.to}</td></tr>
            <tr><td colspan="2">Amount (ETH)</td><td>${ethers.formatEther(tx.value)}</td></tr>
            <tr><td rowspan="4">Transaction Fee</td><td>Max Fee</td><td>${tx.maxFeePerGas} wei</td></tr>
            <tr><td>Max Priority Fee</td><td>${tx.maxPriorityFeePerGas} wei</td></tr>
            <tr><td>Gas Price</td><td>${tx.gasPrice} wei</td></tr>
            <tr><td>Gas Limit</td><td>${tx.gasLimit}</td></tr>
            <tr><td colspan="2">Chain ID</td><td>${tx.chainId}</td></tr>
            <tr><td colspan="2">Memo</td><td>${ethers.toUtf8String(tx.data)}</td></tr>
            <tr><td colspan="2">Transaction Type</td><td>${tx.type} (${tx.typeName})</td></tr>
            <tr><td colspan="2">Nonce</td><td>${tx.nonce}</td></tr>
        `;
        document.querySelector('#deconstruction_table>tbody').innerHTML = deconstruction;
        document.getElementById('dialog_deconstruction_rawtx').showModal();
    });

    document.getElementById('ethereum_tx_type').addEventListener('change', (evt) => {
        if (evt.target.value == "2") {
            document.getElementById('ethereum_priority_fee').parentNode.style.display = "inline";
        } else {
            document.getElementById('ethereum_priority_fee').parentNode.style.display = "none";
        }
    });

    document.getElementById('ethereum_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('ethereum_private_password').setAttribute('type', 'text');
    })
    document.getElementById('ethereum_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('ethereum_private_password').setAttribute('type', 'password');
    })

    document.getElementById('ethereum_mnemonic_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('ethereum_password').setAttribute('type', 'text');
    })
    document.getElementById('ethereum_mnemonic_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('ethereum_password').setAttribute('type', 'password');
    })

    document.getElementById('ethereum_new_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('ethereum_new_private_password').setAttribute('type', 'text');
    })
    document.getElementById('ethereum_new_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('ethereum_new_private_password').setAttribute('type', 'password');
    })

    document.getElementById('customize_mnemonic_words').querySelectorAll('input[class="mnemonic_customize"]').forEach(e => {
        e.addEventListener('blur', (evt) => {
            if (evt.target.value.trim() == '') {
                evt.target.classList.remove('customize');
            } else {
                let index = ethereum_language.getWordIndex(evt.target.value.trim());
                if (index == -1) {
                    evt.target.style.borderColor = 'orangered';
                    alert('The word you entered is not in the mnemonic wordlist!');
                } else {
                    evt.target.style.borderColor = '';
                    evt.target.classList.add('customize');
                }
            }
        })
    })

    document.getElementById('mnemonic_customize_btn').addEventListener('click', (evt) => {
        const count = parseInt(document.getElementById('customize_mnemonic_length').value);
        const entropy = new Uint8Array(count * 4 / 3);                                                            //16,20,24,28 or 32
        crypto.getRandomValues(entropy);
        const entropyBits = entropy.reduce(
            (acc, byte) => acc + byte.toString(2).padStart(8, '0'), ''
        );
        let chunks = entropyBits.match(/.{1,11}/g) || []; //Split into array by 11-bit length
        const indices = chunks.map(binary => parseInt(binary, 2));
        const inputNodes = document.getElementById('customize_mnemonic_words').querySelectorAll('input');
        for (let i = 0; i < (inputNodes.length - 1); i++) {
            if (inputNodes[i].classList.contains("customize")) {
                let index = ethereum_language.getWordIndex(inputNodes[i].value.trim());
                chunks[i] = index.toString(2).padStart(11, '0');
            } else {
                inputNodes[i].value = ethereum_language.getWord(indices[i]);
            }
        }
        let entropy_modify = new Uint8Array((chunks.join('').match(/.{1,8}/g) || []).map(bin => parseInt(bin, 2)));
        const mnemonic = ethers.Mnemonic.entropyToPhrase(entropy_modify, ethereum_language);
        inputNodes[count - 1].value = mnemonic.split(' ')[count - 1];
        document.getElementById('mnemonic_customize_result').innerHTML = `The mnemonic is below:<br>${mnemonic}`;
    })

    document.getElementById('mnemonic_customize_reset').addEventListener('click', (evt) => {
        let inputNodes = document.getElementById('customize_mnemonic_words').querySelectorAll('input');
        inputNodes.forEach((e) => {
            e.value = '';
            e.classList.remove('customize');
            e.style.borderColor = 'black';
        });
        inputNodes[inputNodes.length - 1].style.borderColor = "rgb(153, 153, 153)";
        document.getElementById('mnemonic_customize_result').innerHTML = '';
    })

    document.getElementById('customize_new_language').addEventListener('change', (evt) => {
        document.getElementById('ethereum_new_language').value = evt.target.value;
        document.getElementById('ethereum_new_language').dispatchEvent(new Event('change'));
        document.getElementById('mnemonic_customize_reset').dispatchEvent(new Event('click'));
    })

    init_ethereum();
    if (!provider) {
        console.log('Failed to initialize provider!');
    }

});

document.getElementById('generate_qrcode_btn').addEventListener('click', (evt) => {
    let content = document.getElementById('qrcode_content').value.trim();
    if (content == '') {
        alert('The content can not be empty!');
        return;
    }
    document.getElementById("qrcode").innerHTML = '';
    document.getElementById('qrcode_title_dis').innerHTML = document.getElementById('qrcode_title').value.trim();
    document.getElementById('qrcode_tail_dis').innerHTML = document.getElementById('qrcode_tail').value.trim();

    try {
        new QRCode(document.getElementById("qrcode"), {
            text: content,
            width: 256,
            height: 256,
            //            colorDark: "#000000",
            //            colorLight: "#ffffff",
            //correctLevel: QRCode.CorrectLevel.H
        });
    } catch (err) {
        alert(err);
    }
})

document.getElementById('qrcode_reset').addEventListener('click', (evt) => {
    document.getElementById("qrcode").innerHTML = '<div style="width: 256px; height: 256px; border: 1px dotted black; line-height: 256px; color: gray;">QR Code</div>';
    document.getElementById('qrcode_content').value = '';
    document.getElementById('qrcode_title_dis').innerHTML = 'HEAD';
    document.getElementById('qrcode_tail_dis').innerHTML = 'TAIL';
    document.getElementById('qrcode_title').value = '';
})

document.getElementById('customize_new_language').addEventListener('change', (evt) => {
    document.getElementById('ethereum_new_language').value = evt.target.value;
    document.getElementById('ethereum_new_language').dispatchEvent(new Event('change'));
    document.getElementById('mnemonic_customize_reset').dispatchEvent(new Event('click'));
})

function ethereum_recover_wallet() {
    wallets.mnemonic = document.getElementById('ethereum_mnemonic').value.trim();
    let privateKey = document.getElementById('ethereum_new_privatekey').value.trim();

    if (!ethers.Mnemonic.isValidMnemonic(wallets.mnemonic, ethereum_language) && !(privateKey.length == 66 && privateKey.slice(0, 2) == '0x') && !bip38.verify(privateKey)) {
        alert("Please enter either a valid mnemonic or a valid plaintext private key or a valid encrypted private key");
        return;
    }
    let hd_wallet;
    let mnemonic_passwd;
    let passwd = '';
    if (privateKey != '') {//Recover wallet from private key
        if (bip38.verify(privateKey)) {//Encrypted private key
            const password = document.getElementById('ethereum_new_private_password').value.trim();
            if (password == '') {
                alert('Must enter private key decryption password!');
                return;
            }
            document.getElementById('ethereum_mnemonic').value = '';
            document.getElementById('ethereum_password').value = '';
            wallets.mnemonic = '';
            mnemonic_passwd = '';
            try {
                let N = parseInt(document.getElementById('N_id').value.trim());
                let r = parseInt(document.getElementById('r_id').value.trim());
                let p = parseInt(document.getElementById('p_id').value.trim());
                let decryptKey = bip38.decrypt(privateKey, password, null, { N: N, r: r, p: p });
                privateKey = `0x${Buffer.Buffer.from(decryptKey.privateKey).toString('hex')}`;
            } catch (error) {
                private = null;
                alert(error);
                return;
            };
        }
        hd_wallet = new ethers.Wallet(privateKey, provider);
        hd_wallet.publicKey = ethers.SigningKey.computePublicKey(privateKey, true);
        hd_wallet.path = '';
        privateKey = hd_wallet.privateKey;
    } else {//Recover wallet from mnemonic
        let path = document.getElementById('ethereum_new_path').value.trim();//Format: m/44'/60'/i'/0|1/j/…', i,j=1,2,3,...
        const regex = /^m\/44'\/60'\/(\d+)'\/([01])(?:\/(\d+))+$/;
        if (!regex.test(path)) {
            alert("Invalid wallet path format!");
            return;
        }
        mnemonic_passwd = document.getElementById('ethereum_password').value.trim();
        hd_wallet = ethers.HDNodeWallet.fromPhrase(wallets.mnemonic, mnemonic_passwd, path, ethereum_language);
        privateKey = hd_wallet.privateKey;
        passwd = document.getElementById('ethereum_new_private_password').value.trim();
        if (passwd != '') {//Need to encryot the priviate Key.
            let N = parseInt(document.getElementById('N_id').value.trim());
            let r = parseInt(document.getElementById('r_id').value.trim());
            let p = parseInt(document.getElementById('p_id').value.trim());
            privateKey = Uint8Array.from(Buffer.Buffer.from(hd_wallet.privateKey.slice(2), 'hex'));
            try {
                privateKey = bip38.encrypt(privateKey, true, passwd, null, { N: N, r: r, p: p });
            } catch (error) {
                passwd = '';
                alert(`Encrypting private key failed:${error}`);
            }
        }
    }
    document.getElementById('ethereum_hd_wallet').innerHTML = `
    <span style="display: inline-block;width: 6rem;text-align: right;color: #999;">Mnemonic:</span>&nbsp;${wallets.mnemonic}<br>
    <span style="display: inline-block;width: 6rem;text-align: right;color: #999;">Private Key:</span>&nbsp;${privateKey}${passwd == '' ? '' : '&nbsp;(encrypted)'}<br>
    <span style="display: inline-block;width: 6rem;text-align: right;color: #999;">Public Key:</span>&nbsp;${hd_wallet.publicKey}<br>
    <span style="display: inline-block;width: 6rem;text-align: right;color: #999;">Address:</span>&nbsp;${hd_wallet.address}<br>
    <span style="display: inline-block;width: 6rem;text-align: right;color: #999;">Path:</span>&nbsp;${hd_wallet.path}
    `;
}

function init_ethereum() {
    if (window.ethereum == null) {
        console.log("MetaMask not installed, using read-only default provider");
        const network = isTestNet_ethereum ? "sepolia" : "homestead";

        /* Three ways to create provider */
        //Method 1:
        provider = ethers.getDefaultProvider(network);

        //Method 2:
        //provider = ethers.getDefaultProvider(network, {
        //    etherscan: "NCGAQ33ESD34Y343Z4HHZHMT9D4DBFA9HK"
        //});

        //Method 3:
        //const apiKey = '5b34a68e44cf47c3afcd16c4a9b74341';
        //const rpcURL = `https://${isTestNet_ethereum ? "sepolia" : "mainnet"}.infura.io/v3/${apiKey}`;
        //const provider = new ethers.JsonRpcProvider(rpcURL);
        /*  The End  */

    } else {
        provider = new ethers.BrowserProvider(window.ethereum);
        provider.getSigner().then(s => {
            signer = s;
        });
    }
}