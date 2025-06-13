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

    document.getElementById('ens_address_btn').addEventListener("click", async (evt) => {
        let ensName = document.getElementById('ens_name').value.trim();
        if (!ensName) {
            alert('The ENS can not be empty!');
            return;
        }
        openModal('Please wait, querying …');
        document.getElementById('ethereum_address').value = '';
        try {
            const address = await provider.resolveName(ensName);
            document.getElementById('ethereum_address').value = address;
        } catch (error) {
            document.getElementById('ethereum_address').value = "Failed:" + error;
        }
        closeModal();
    })

    document.getElementById('address_ens_btn').addEventListener("click", async (evt) => {
        let ensAddress = document.getElementById('ethereum_address').value.trim();
        if (!ensAddress) {
            alert('The address can not be empty!');
            return;
        }
        openModal('Please wait, querying …');
        document.getElementById('ens_name').value = '';
        try {
            const ensName = await provider.lookupAddress(ensAddress);
            document.getElementById('ens_name').value = ensName ? ensName : 'No Record';
        } catch (error) {
            document.getElementById('ens_name').value = "Failed:" + error;
        }
        closeModal();
    })

    document.getElementById('ens_reset').addEventListener('click',(evt)=>{
        document.getElementById('ens_name').value = '';
        document.getElementById('ethereum_address').value = '';
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
        document.getElementById('ethereum_privateKey').setAttribute('type', 'text');
    })
    document.getElementById('ethereum_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '.images/closeeye.png');
        document.getElementById('ethereum_private_password').setAttribute('type', 'password');
        document.getElementById('ethereum_privateKey').setAttribute('type', 'password');
    })

    document.getElementById('sign_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('sign_private_password').setAttribute('type', 'text');
        document.getElementById('sign_privateKey').setAttribute('type', 'text');
    })
    document.getElementById('sign_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('sign_private_password').setAttribute('type', 'password');
        document.getElementById('sign_privateKey').setAttribute('type', 'password');
    })

    document.getElementById('encrypt_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('encrypt_private_password').setAttribute('type', 'text');
        document.getElementById('encrypt_private_key').setAttribute('type', 'text');
    })
    document.getElementById('encrypt_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('encrypt_private_password').setAttribute('type', 'password');
        document.getElementById('encrypt_private_key').setAttribute('type', 'password');
    })

    document.getElementById('steganography_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('steganography_password').setAttribute('type', 'text');
    })
    document.getElementById('steganography_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('steganography_password').setAttribute('type', 'password');
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
        document.getElementById('ethereum_new_privatekey').setAttribute('type', 'text');
    })
    document.getElementById('ethereum_new_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('ethereum_new_private_password').setAttribute('type', 'password');
        document.getElementById('ethereum_new_privatekey').setAttribute('type', 'password');
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

    document.getElementById('steganography_file').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgObj = document.getElementById('steganography_preview');
                imgObj.src = reader.result;
                imgObj.style.display = 'block';
                //                img.style.cssText = "max-width: 700px; margin: 1rem 20rem;"
            }
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('generate_steganography_btn').addEventListener('click', async (evt) => {
        const message = document.getElementById('steganography_content').value.trim();
        if (message == '') {
            alert('Content cannot be empty!');
            return;
        }
        const file = document.getElementById('steganography_file').files[0];
        if (!file) {
            alert('You must select an image!');
            return;
        }
        const password = document.getElementById('steganography_password').value.trim();
        //        const imgObj = document.getElementById('steganography_preview');
        const imgObj = new Image();
        imgObj.src = URL.createObjectURL(file);
        imgObj.onload = async () => {
            try {
                const blob = await hideEncryptedMessageInImage(imgObj, message, password);
                const resultImg = document.getElementById('steganographyed_image');
                resultImg.src = URL.createObjectURL(blob);
                resultImg.parentNode.style.visibility = 'visible';
                resultImg.parentNode.querySelector('a').href = resultImg.src;
                resultImg.parentNode.querySelector('a').download = 'hidden-message.png';
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
    });

    document.getElementById('get_steganography_btn').addEventListener('click', async () => {
        const file = document.getElementById('steganography_file').files[0];
        const password = document.getElementById('steganography_password').value;

        if (!file) {
            alert('Please select an image!');
            return;
        }

        const imgObj = new Image();
        imgObj.src = URL.createObjectURL(file);
        imgObj.onload = async () => {
            try {
                const message = await extractEncryptedMessageFromImage(imgObj, password);
                document.getElementById('steganography_content').value = message;
                document.getElementById('steganography_content').style.borderColor = 'red';
            } catch (error) {
                document.getElementById('steganography_content').value = '';
                alert('Error: ' + error.message);
            }
        }
    });

    document.getElementById('clear_steganography_btn').addEventListener('click', async () => {
        const file = document.getElementById('steganography_file').files[0];

        if (!file) {
            alert('Please select an image!');
            return;
        }

        const imgObj = new Image();
        imgObj.src = URL.createObjectURL(file);
        imgObj.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = imgObj.width;
                canvas.height = imgObj.height;
                ctx.drawImage(imgObj, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                for (let i = 0; i < imageData.data.length; i = i + 4) {
                    imageData.data[i] &= 0xfe;
                    imageData.data[i + 1] &= 0xfe;
                    imageData.data[i + 2] &= 0xfe;
                }
                ctx.putImageData(imageData, 0, 0);
                canvas.toBlob((blob) => {
                    let aObj = document.createElement('a');
                    aObj.href = URL.createObjectURL(blob);
                    aObj.download = 'clear-message.png';
                    aObj.innerText = 'Download the image without hidden information';
                    document.getElementById('clear_steganography_btn').parentNode.appendChild(aObj);
                }, 'image/png');
            } catch (error) {
                document.getElementById('steganography_content').value = '';
                alert('Error: ' + error.message);
            }
        }
    });

    document.getElementById('steganography_reset').addEventListener('click', (evt) => {
        //        document.getElementById("qrcode").innerHTML = '<div style="width: 256px; height: 256px; border: 1px dotted black; line-height: 256px; color: gray;">二维码</div>';
        document.getElementById('steganography_content').value = '';
        document.getElementById('steganography_content').style.borderColor = 'black';
        document.getElementById('steganography_password').value = '';
        document.getElementById('steganography_preview').setAttribute('src', '');
        document.getElementById('steganography_file').value = '';
        document.getElementById('steganographyed_image').setAttribute('src', '');
    })

    document.getElementById('close_hidden_image').addEventListener('click', (evt) => {
        evt.target.parentNode.parentNode.style.visibility = 'hidden';
    })

    init_ethereum();
    if (!provider) {
        console.log('Failed to initialize provider!');
    }

    document.getElementById('logo_file').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                document.getElementById('logo_preview').innerHTML = '';
                document.getElementById('logo_preview').appendChild(img);
            }
            reader.readAsDataURL(file);
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
        let image = 'images/default_qr.png';
        let qr_logo = document.getElementById('logo_preview').querySelector('img');
        if (qr_logo) {
            image = qr_logo.getAttribute('src');
        }
        try {
            const qrCode = new QRCodeStyling({
                width: 256,
                height: 256,
                data: content,
                image: image,
                dotsOptions: {
                    color: "#000",
                    type: "rounded"
                },
                backgroundOptions: {
                    color: "#fff",
                },
                imageOptions: {
                    crossOrigin: "anonymous",
                    margin: 4
                }
            });

            qrCode.append(document.getElementById("qrcode"));
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
        document.getElementById('qrcode_tail').value = '';
        document.getElementById('logo_preview').innerHTML = '';
        document.getElementById('logo_file').value = '';

    })

    document.getElementById('sign_file').addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const hash = bitcoin.crypto.sha256(reader.result);
                document.getElementById('sign_digest').innerHTML = hash.toString('hex');
            }
            reader.readAsArrayBuffer(file);
        }
    });

    document.getElementById('generate_sign_btn').addEventListener('click', (evt) => {
        let digest = document.getElementById('sign_digest').innerText;
        const hash = Uint8Array.from(Buffer.Buffer.from(digest, 'hex'));
        let privateKeyHex = document.getElementById('sign_privateKey').value.trim();
        if (privateKeyHex) {
            if (privateKeyHex.slice(0, 2) == '6P') {
                let password = document.getElementById('sign_private_password').value;
                if (password == '') {
                    privateKeyHex = null;
                    alert('The private key has been encrypted, but no protection password for the private key has been provided!');
                    return;
                } else {
                    try {
                        if (!bip38.verify(privateKeyHex)) {
                            throw new Error('Not a valid encryption private key!');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        let decryptKey = bip38.decrypt(privateKeyHex, password, null, { N: N, r: r, p: p });
                        privateKeyHex = Buffer.Buffer.from(decryptKey.privateKey).toString('hex');
                    } catch (error) {
                        privateKeyHex = null;
                        alert(error);
                        return;
                    };
                }
            }

            const privateKey = Buffer.Buffer.from(privateKeyHex, 'hex');
            const keyPair = ECPair.fromPrivateKey(privateKey);

            const signature = bitcoinerlabsecp256k1.signSchnorr(hash, keyPair.privateKey);
            document.getElementById('sign_result').value = Buffer.Buffer.from(signature).toString('hex');
        }
    })

    document.getElementById('virify_sign_btn').addEventListener('click', (evt) => {
        let publicKey = document.getElementById('sign_publicKey').value.trim();
        let signature = document.getElementById('sign_result').value.trim();
        let digest = document.getElementById('sign_digest').innerText;
        if (!digest || !signature || !publicKey) {
            alert('The signed document, public key, and signature are all essential!');
            return;
        }
        publicKey = bitcoinerlabsecp256k1.xOnlyPointFromPoint(Buffer.Buffer.from(publicKey, 'hex'));
        signature = Uint8Array.from(Buffer.Buffer.from(signature, 'hex'));
        digest = Uint8Array.from(Buffer.Buffer.from(digest, 'hex'));
        const isValid = bitcoinerlabsecp256k1.verifySchnorr(digest, publicKey, signature);
        evt.target.parentNode.querySelector('#verify_result').style.visibility = 'visible';
        evt.target.parentNode.querySelector('#verify_result').setAttribute('src', isValid ? 'images/sign_ok.png' : 'images/sign_failed.png');
    })

    document.getElementById('sign_reset').addEventListener('click', (evt) => {
        document.getElementById('sign_file').value = '';
        document.getElementById('sign_digest').innerHTML = '';
        document.getElementById('sign_privateKey').value = '';
        document.getElementById('sign_private_password').value = '';
        document.getElementById('sign_publicKey').value = '';
        document.getElementById('sign_result').value = '';
        document.getElementById('verify_result').style.visibility = 'hidden';
    })

    var fileData;

    document.getElementById('encrypt_btn').addEventListener('click', async (evt) => {
        const publicKey = document.getElementById('encrypt_publicKey').value.trim();
        const file = document.getElementById('encrypt_file').files[0];
        if (!file || !publicKey) {
            alert('No file selected or no public key!');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            fileData = reader.result;
        }
        reader.readAsArrayBuffer(file);
        const originalSize = file.size;
        const ephemeralKeyPair = ECPair.makeRandom();
        const ephemeralPublicKey = ephemeralKeyPair.publicKey.toString('hex');

        const recipientPublicKey = Buffer.Buffer.from(publicKey, 'hex');
        const sharedSecret = Buffer.Buffer.from(bitcoinerlabsecp256k1.pointMultiply(recipientPublicKey, ephemeralKeyPair.privateKey));

        const aesKey = await deriveAesKey(sharedSecret);

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedContent = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            aesKey,
            fileData
        );

        const result = new Uint8Array(33 + 12 + encryptedContent.byteLength);
        result.set(ephemeralKeyPair.publicKey, 0);
        result.set(iv, 33);
        result.set(new Uint8Array(encryptedContent), 45);

        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        document.getElementById('encrypt_result').innerHTML = `
            Encryption successful!<br>
            Original file size:&nbsp;${formatBytes(originalSize)}<br>
            Size after encryption:&nbsp;${formatBytes(result.length)}<br>
            Temporary key used for encryption:&nbsp;${ephemeralPublicKey}<br>
            <a href="${url}" download="(Encrypted)${file.name}">Download the encrypted file</a>
        `;
    });


    document.getElementById('decrypt_btn').addEventListener('click', (evt) => {
        document.getElementById('encrypt_result').innerHTML = '';
        const file = document.getElementById('encrypt_file').files[0];
        let privateKeyHex = document.getElementById('encrypt_private_key').value.trim();
        if (!file || !privateKeyHex) {
            alert('No encrypted files or private keys!');
            return;
        }
        if (privateKeyHex) {
            if (privateKeyHex.slice(0, 2) == '6P') {
                let password = document.getElementById('encrypt_private_password').value;
                if (password == '') {
                    privateKeyHex = null;
                    alert('The private key has been encrypted, but no protection password for the private key has been provided!');
                    return;
                } else {
                    try {
                        if (!bip38.verify(privateKeyHex)) {
                            throw new Error('Not a valid encryption private key!');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        let decryptKey = bip38.decrypt(privateKeyHex, password, null, { N: N, r: r, p: p });
                        privateKeyHex = Buffer.Buffer.from(decryptKey.privateKey).toString('hex');
                    } catch (error) {
                        privateKeyHex = null;
                        alert(error);
                        return;
                    };
                }
            }

            try {
                const reader = new FileReader();
                reader.onload = async function (e) {
                    const encryptedArray = new Uint8Array(reader.result);
                    if (encryptedArray.length < 45) {
                        throw new Error('Invalid encrypted file format');
                    }
                    const ephemeralPublicKey = encryptedArray.slice(0, 33);
                    const iv = encryptedArray.slice(33, 45);
                    const ciphertext = encryptedArray.slice(45);

                    const keyPair = ECPair.fromPrivateKey(Buffer.Buffer.from(privateKeyHex, 'hex'));
                    const sharedSecret = Buffer.Buffer.from(bitcoinerlabsecp256k1.pointMultiply(ephemeralPublicKey, keyPair.privateKey));

                    const aesKey = await deriveAesKey(sharedSecret);

                    const decryptedContent = await crypto.subtle.decrypt(
                        { name: "AES-GCM", iv },
                        aesKey,
                        ciphertext
                    );

                    const decryptedArray = new Uint8Array(decryptedContent);
                    const blob = new Blob([decryptedArray], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);

                    document.getElementById('encrypt_result').innerHTML = `
                        Decryption successful!<br>
                        File size:&nbsp;${formatBytes(decryptedArray.length)}<br>
                        <a href="${url}" download="decrypted_file.${document.getElementById('encrypt_file').value.split('.')[1]}">Download the encrypted file</a>
                    `;
                }
                reader.readAsArrayBuffer(file);
            } catch (error) {
                alert('Error occurred while decrypting the file:' + error.message);
            }
        }
    })

    document.getElementById('encrypt_reset').addEventListener('click', (evt) => {
        document.getElementById('encrypt_file').value = '';
        document.getElementById('encrypt_private_key').value = '';
        document.getElementById('encrypt_private_password').value = '';
        document.getElementById('encrypt_publicKey').value = '';
        document.getElementById('encrypt_result').innerHTML = '';
    })

    document.getElementById('encode_btn').addEventListener('click', (evt) => {
        document.getElementById('input_hex').value = ethers.hexlify(ethers.toUtf8Bytes(document.getElementById('input_utf8').value.trim()));
    })

    document.getElementById('decode_btn').addEventListener('click', (evt) => {
        try {
            const originText = ethers.toUtf8String((document.getElementById('input_hex').value.trim()));
            document.getElementById('input_utf8').value = originText;
        } catch (err) {
            alert(err);
        }
    })

    document.getElementById('encode_reset').addEventListener('click', (evt) => {
        document.getElementById('input_utf8').value = '';
        document.getElementById('input_hex').value = '';
    })

    document.getElementById('customize_new_language').addEventListener('change', (evt) => {
        document.getElementById('ethereum_new_language').value = evt.target.value;
        document.getElementById('ethereum_new_language').dispatchEvent(new Event('change'));
        document.getElementById('mnemonic_customize_reset').dispatchEvent(new Event('click'));
    })
});


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