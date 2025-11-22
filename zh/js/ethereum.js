window.addEventListener("load", () => {
    document.getElementById('ethereum_configure_network').addEventListener('change', (ev) => {
        ethereum_network = ev.target.value;
        ethereum_isTestNet = ethereum_network == 'mainnet' ? false : true;
        document.getElementById('ethereum_new_path').value = `m/44'/${ethereum_isTestNet ? 1 : 60}'/0'/0/0`;
        document.getElementById('ethereum_new_path').parentNode.querySelector('span').innerText = `（说明：路径m/44'/${ethereum_isTestNet ? 1 : 60}'/i'/0/j表示第i+1个账户里的第j+1个钱包，i,j=0、1、2、…）`;
    })

    document.getElementById('ethereum_configure_rate').addEventListener('blur', (ev) => {
        ethereum_rate = parseFloat(ev.target.value.trim());
    });

    document.getElementById('ethereum_configure_fee').addEventListener('blur', (ev) => {
        ethereum_fee_dollars = parseFloat(ev.target.value.trim());
        ethereum_fee_wei = Math.round(10 ** 18 / ethereum_rate * ethereum_fee_dollars);
        document.getElementById('ethereum_fee').value = ev.target.value.trim();
        document.getElementById('ethereum_priority_fee').value = Math.floor(ethereum_fee_dollars * 99) / 100;
    });

    document.getElementById('ethereum_configure_language').addEventListener('change', (ev) => {
        switch (ev.target.value) {
            case 'cn':
                ethereum_language = wordlistsExtra.LangZh.wordlist("cn");
                break;
            case 'tw':
                ethereum_language = wordlistsExtra.LangZh.wordlist("tw");
                break;
            case 'ja':
                ethereum_language = wordlistsExtra.LangJa.wordlist("ja");
                break;
            case 'es':
                ethereum_language = wordlistsExtra.LangEs.wordlist("es");
                break;
            case 'fr':
                ethereum_language = wordlistsExtra.LangFr.wordlist("fr");
                break;
            case 'it':
                ethereum_language = wordlistsExtra.LangIt.wordlist("it");
                break;
            case 'ko':
                ethereum_language = wordlistsExtra.LangKo.wordlist("ko");
                break;
            case 'pt':
                ethereum_language = wordlistsExtra.LangPt.wordlist("pt");
                break;
            case 'cz':
                ethereum_language = wordlistsExtra.LangCz.wordlist("cz");
                break;
            default: ethereum_language = ethers.wordlists.en;
                break;
        }
    });

    document.getElementById('ethereum_new_wallet').addEventListener('click', async (ev) => {
        document.getElementById('ethereum_new_privatekey').value = '';
        //        document.getElementById('ethereum_new_private_password').value = '';
        document.getElementById('ethereum_mnemonic').value = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(parseInt(document.getElementById('ethereum_mnemonic_length').value) * 44 / 33), ethereum_language);
        await openModal('请稍候，正在处理…');
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
        document.getElementById('ethereum_new_private_password').value = '';
    });

    document.getElementById('ethereum_recover_wallet').addEventListener('click', async (evt) => {
        await openModal('请稍候，正在处理…');
        ethereum_recover_wallet();
        closeModal();
    });

    document.getElementById('ethereum_wallet_balance_btn').addEventListener('click', async (evt) => {
        let wallet_address = document.getElementById('ethereum_wallet_address').value.trim();
        if (wallet_address == '') {
            alert("请先输入钱包地址或者交易id");
            return;
        }
        if (wallet_address.length == 42) {//按钱包地址查询。0xDeb5BF379E49300c78276167fBb8E3F18EA6C946
            if (!ethers.isAddress(wallet_address)) {
                alert('不是合法的以太币地址！');
                return;
            }
            await openModal('请稍候，正在获取…');
            provider.getBalance(wallet_address).then(balance => {
                document.getElementById('ethereum_view_wallet_balance').innerHTML = `钱包余额（以太币）：${ethers.formatEther(balance)}`;
                provider.getTransactionCount(wallet_address).then(nonce => {
                    let ret = document.getElementById('ethereum_view_wallet_balance');
                    ret.innerHTML = ret.innerHTML + `，下次可用的流水号：${nonce}`;
                })
                closeModal();
            }).catch(err => { closeModal(); })
        } else if (wallet_address.length == 66) {//按交易id查询。0x6ea6ca374431cccfee236eafd24e0d6d326d34e612ecd8b117322205f4e19f9c
            provider.getTransaction(wallet_address).then((tx) => {
                document.getElementById('ethereum_view_wallet_balance').innerHTML = `
                    交易哈希：${tx.hash}<br>
                    　区块号：${tx.blockNumber}<br>
                    　　数据：${ethers.toUtf8String(tx.data)}<br>
                    转出地址：${tx.from}<br>
                    转入地址：${tx.to}<br>
                    　　金额：${ethers.formatEther(tx.value)}个以太币<br>
                    交易费用：${ethers.formatEther(tx.gasPrice * tx.gasLimit)}个以太币
                `;
            })
        }
    });

    document.getElementById('ether_sign_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('ether_sign_private_password').setAttribute('type', 'text');
        document.getElementById('ether_sign_privateKey').setAttribute('type', 'text');
    });

    document.getElementById('ether_sign_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('ether_sign_private_password').setAttribute('type', 'password');
        document.getElementById('ether_sign_privateKey').setAttribute('type', 'password');
    });

    document.getElementById('ether_generate_sign_btn').addEventListener('click', async (evt) => {
        let signText = document.getElementById('ether_sign_text').value.trim();
        if (signText == '') {
            alert('被签名的内容不能为空！');
            return;
        }
        let privateKeyHex = document.getElementById('ether_sign_privateKey').value.trim();
        if (privateKeyHex.slice(0, 2) == '0x') {
            privateKeyHex = privateKeyHex.slice(2);
        }
        if (privateKeyHex) {
            if (privateKeyHex.slice(0, 2) == '6P') {
                let password = document.getElementById('ether_sign_private_password').value;
                if (password == '') {
                    privateKeyHex = null;
                    alert('私钥已经加密，但是没有提供私钥的保护密码！');
                    return;
                } else {//私钥被密码保护，需要解密
                    try {
                        await openModal("正在处理，请稍后...");
                        if (!bip38.verify(privateKeyHex)) {
                            throw new Error('不是一个合法的加密私钥！');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        let decryptKey = bip38.decrypt(privateKeyHex, password, null, { N: N, r: r, p: p });
                        privateKeyHex = Buffer.Buffer.from(decryptKey.privateKey).toString('hex');
                        closeModal();
                    } catch (error) {
                        privateKeyHex = null;
                        closeModal();
                        alert(error);
                        return;
                    };
                }
            }
            try {
                const wallet = new ethers.Wallet('0x' + privateKeyHex);
                const signature = wallet.signMessageSync(signText).slice(2);
                //document.getElementById('sign_result').value = Buffer.Buffer.from(signature).toString('hex');
                document.getElementById('ether_sign_result').value = signature;
            } catch (err) {
                alert("签名失败！" + err);
            }
        }
    });

    document.getElementById('ether_virify_sign_btn').addEventListener('click', (evt) => {
        let publicKey = document.getElementById('ether_sign_publicKey').value.trim();
        let signature = document.getElementById('ether_sign_result').value.trim();
        let signText = document.getElementById('ether_sign_text').value.trim();
        if (!signText || !signature || !publicKey) {
            alert('被签名的文件、公钥和签名三者缺一不可！');
            return;
        }
        if (publicKey.slice(0, 2) == '0x') {
            publicKey = publicKey.slice(2);
        }

        try {
            let address = ethers.computeAddress('0x' + publicKey);
            let address1 = ethers.verifyMessage(signText, '0x' + signature);
            const isValid = address.toLowerCase() === address1.toLowerCase() ? true : false;

            evt.target.parentNode.querySelector('#ether_verify_result').style.visibility = 'visible';
            evt.target.parentNode.querySelector('#ether_verify_result').setAttribute('src', isValid ? 'images/sign_ok.png' : 'images/sign_failed.png');
        } catch (err) {
            alert("签名失败！" + err);
        }
    });

    document.getElementById('ether_sign_reset').addEventListener('click', (evt) => {
        document.getElementById('ether_sign_text').value = '';
        document.getElementById('ether_sign_privateKey').value = '';
        document.getElementById('ether_sign_private_password').value = '';
        document.getElementById('ether_sign_publicKey').value = '';
        document.getElementById('ether_sign_result').value = '';
        document.getElementById('ether_verify_result').style.visibility = 'hidden';
    });

    document.getElementById('pgp_sign_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('pgp_sign_password').setAttribute('type', 'text');
    });

    document.getElementById('pgp_sign_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('pgp_sign_password').setAttribute('type', 'password');
    });

    document.getElementById('pgp_sign_checkbox').addEventListener('click', (ev) => {
        if (ev.target.checked) {
            document.getElementById('pgp_newKey_div').style.display = 'block';
        } else {
            document.getElementById('pgp_newKey_div').style.display = 'none';
        }
    });

    document.getElementById('pgp_generate_sign').addEventListener('click', async (ev) => {
        const divBox = document.getElementById('pgp_newKey_div');
        const name = divBox.querySelector('input[name="sign_name"]').value.trim();
        const email = divBox.querySelector('input[name="sign_email"]').value.trim();
        if (!name || !email) {
            alert('姓名和邮件不能为空！');
            return;
        }
        const expire = parseInt(divBox.querySelector('input[name="sign_expire"]').value.trim()) * 85400;//换算成秒
        let pgp_algo = 'ecc';
        divBox.querySelectorAll('input[name="pgp_sign_algorithm"]').forEach(e => {
            if (e.checked === true) {
                pgp_algo = e.value;
            }
        });
        const password = document.getElementById('pgp_sign_password').value.trim();
        /*         const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                    type: pgp_algo,
                    rsaBits: 4096,
                    userIDs: [{
                        name: name,
                        email: email,
                        keyExpirationTime: expire
                    }],
                    passphrase: password
                });
         */
        try {
            const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                type: pgp_algo,
                //            curve: 'curve25519',
                userIDs: [{
                    name: name,
                    email: email
                }],
                format: 'armored',
                keyExpirationTime: expire,
                passphrase: password
            });

            const privateObj = await openpgp.readPrivateKey({
                armoredKey: privateKey
            });

            const fingerprint = privateObj.getFingerprint();

            document.getElementById('pgp_fingerprint').value = fingerprint.toUpperCase().match(/.{1,4}/g).join(' ');
            document.getElementById('pgp_sign_publicKey').value = publicKey;
            document.getElementById('pgp_sign_privateKey').value = privateKey;
        } catch (err) {
            alert(err);
        }
    });

    document.getElementById('pgp_sign_btn').addEventListener('click', async (ev) => {
        const fileInput = document.getElementById('pgp_original_file');
        const private_key = document.getElementById('pgp_sign_privateKey').value;
        if (!fileInput.files.length || !private_key) {
            alert('被签名文件和PGP私钥不能为空！');
            return;
        }

        try {
            await openModal('正在处理，请稍后...');
            const passphrase = document.getElementById('pgp_sign_password').value.trim();

            let privateKey;
            if (passphrase == '') {
                privateKey = await openpgp.readPrivateKey({ armoredKey: private_key });
            } else {
                privateKey = await openpgp.decryptKey({
                    privateKey: await openpgp.readPrivateKey({ armoredKey: private_key }),
                    passphrase
                });
            }
            const file = fileInput.files[0];
            const fileData = await file.arrayBuffer();

            const signature = await openpgp.sign({
                message: await openpgp.createMessage({ binary: new Uint8Array(fileData) }),
                signingKeys: privateKey,
                // signingKeys: [privateKey, privateKey2], // 允许指定多个签名者
                detached: true,//签名独立于原始文件
                date: new Date(), // 允许指定签名时间。默认会自动添加当前时间
                //preferredHashAlgorithm: 'sha512' // 使用SHA-512哈希
                format: 'binary' // 输出二进制格式的签名，'armored'（文本格式），'text'（签名嵌入源文件中）
            });

            const fingerprint = privateKey.getFingerprint();

            document.getElementById('pgp_fingerprint').value = fingerprint.toUpperCase().match(/.{1,4}/g).join(' ');

            // 创建签名下载链接
            const blob = new Blob([signature], { type: 'application/octet-stream' });
            triggerDownload(blob, file.name + '.sig');
            closeModal();
        } catch (error) {
            closeModal();
            alert('签名失败：' + error);
        }
    });

    document.getElementById('pgp_verify_btn').addEventListener('click', async (ev) => {
        const origin_file = document.getElementById('pgp_original_file');
        const sign_file = document.getElementById('pgp_sign_file');
        const public_key = document.getElementById('pgp_sign_publicKey').value;
        if (!origin_file.files.length || !sign_file.files.length || !public_key) {
            alert('原始文件、签名文件和PGP公钥不能为空！');
            return;
        }

        try {
            const [originalFile, signatureFile] = await Promise.all([
                origin_file.files[0].arrayBuffer(),
                sign_file.files[0].arrayBuffer()
            ]);

            //签名时间：signature.packets[0].created
            const signature = await openpgp.readSignature({
                binarySignature: new Uint8Array(signatureFile) // <--- 使用此属性，而不是 armoredSignature
            });

            // 读取公钥
            const publicKey = await openpgp.readKey({ armoredKey: public_key });

            // 验证签名
            const verificationResult = await openpgp.verify({
                message: await openpgp.createMessage({ binary: new Uint8Array(originalFile) }),
                signature: await openpgp.readSignature({ binarySignature: new Uint8Array(signatureFile) }),
                verificationKeys: publicKey
            });

            const { verified, keyID } = verificationResult.signatures[0];
            await verified; // 等待验证完成

            const fingerprint = publicKey.getFingerprint();

            document.getElementById('pgp_fingerprint').value = fingerprint.toUpperCase().match(/.{1,4}/g).join(' ');

            const resultElement = document.getElementById('pgp_verificationResult');
            resultElement.innerHTML = `
                <p>✓ 签名验证成功！</p>
                <p>签名者密钥ID: ${keyID.toHex()}</p>
                <p>签名时间: ${new Date(signature.packets[0].created).toLocaleString()}</p>
            `;
            resultElement.style.color = 'green';
        } catch (error) {
            document.getElementById('pgp_verificationResult').innerHTML =
                `<p style="color: red;">✗ 签名验证失败:<br> ${error.message}</p>`;
            document.getElementById('pgp_verificationResult').style.color = 'red';
        }
        document.getElementById('pgp_verificationResult').style.display = 'block';
    });

    document.getElementById('pgp_sign_reset').addEventListener('click', (ev) => {
        document.getElementById('pgp_original_file').value = '';
        document.getElementById('pgp_sign_file').value = '';
        document.getElementById('pgp_sign_privateKey').value = '';
        document.getElementById('pgp_sign_password').value = '';
        document.getElementById('pgp_sign_publicKey').value = '';
        document.getElementById('pgp_fingerprint').value = '';
        document.getElementById('pgp_newKey_div').style.display = 'none';
        document.getElementById('pgp_verificationResult').style.display = 'none';
    });

    document.getElementById('ethereum_fee').addEventListener('blur', (ev) => {
        ethereum_fee_dollars = parseFloat(ev.target.value.trim());
        ethereum_fee_wei = Math.round(10 ** 18 / ethereum_rate * ethereum_fee_dollars);
        document.getElementById('ethereum_configure_fee').value = ev.target.value.trim();
        document.getElementById('ethereum_priority_fee').value = Math.floor(ethereum_fee_dollars * 99) / 100;
    });

    document.getElementById('ethereum_priority_fee').addEventListener("blur", (evt) => {
        let fee = parseFloat(document.getElementById('ethereum_fee').value.trim());
        if (parseFloat(evt.target.value.trim()) > fee) {
            alert("小费不能大于交易费用！");
        }
    });

    document.getElementById('ethereum_ok_transfer').addEventListener('click', async function f(evt) {
        // let from = document.getElementById('ethereum_from').value.trim();
        // if(!ethers.isAddress(from)){
        //     alert("转出地址不合法！");
        //     return;
        // }
        document.getElementById('ethereum_result_transfer').innerHTML = '';
        let to = document.getElementById('ethereum_to').value.trim();
        if (!ethers.isAddress(to)) {
            alert("转入地址不合法！");
            return;
        }
        let value = document.getElementById('ethereum_value').value.trim();
        let fee = parseFloat(document.getElementById('ethereum_fee').value.trim());
        if (fee > 100 || fee < 0.5) {
            alert("警告：交易费用过多或过少");
        }
        /*
                let rate = parseFloat(document.getElementById('ethereum_rate').value.trim());
                if (rate < 100) {
                    alert("1以太币可兑换的美元好像不正常哦！");
        */
        let privateKey = document.getElementById('ethereum_privateKey').value.trim();
        await openModal('请稍候，正在处理…');
        if (privateKey.slice(0, 2) == '6P') {
            let password = document.getElementById('ethereum_private_password').value;
            if (password == '') {
                privateKey = null;
                closeModal();
                alert('私钥已经加密，但是没有提供私钥的保护密码！');
                return;
            } else {//私钥被密码保护，需要解密
                try {
                    if (!bip38.verify(privateKey)) {
                        throw new Error('不是一个合法的加密私钥！');
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
                nonce = await wallet.getNonce();//provider.getTransactionCount('0xDeb5BF379E49300c78276167fBb8E3F18EA6C946');
                document.getElementById('ethereum_nonce').value = nonce;
            } catch (err) {
                closeModal();
                alert('网络异常，请手工输入流水号！');
                document.getElementById('ethereum_nonce').removeAttribute('disabled');
                document.getElementById('ethereum_nonce').style.border = "1px solid red";
                return;
            }
        }
        let data = document.getElementById('ethereum_data').value.trim();
        let comment = '';
        if (data.length > 0) {
            comment = ethers.hexlify(ethers.toUtf8Bytes(data));//字符串->HEX
            //ethers.toUtf8String(comment);//HEX->字符串
        }
        let gasLimit = parseInt(document.getElementById('ethereum_gasLimit').value.trim());
        let type = document.getElementById('ethereum_tx_type').value;
        let tx = {
            to: to,
            value: ethers.parseEther(value),
            data: comment,
            gasLimit: gasLimit,
            nonce: nonce,
            chainId: ethereum_isTestNet ? 11155111 : 1 //主网1，Sepolia测试网11155111
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
        //        await openModal('请稍候，正在转账…');
        const signedTx = await wallet.signTransaction(tx);
        // let txHex = '';
        // wallet.signTransaction(tx).then((hex) => {
        //     txHex = hex;
        // });
        let result = document.getElementById('ethereum_result_transfer');
        wallet.sendTransaction(tx).then((transaction) => {
            result.innerHTML = `交易已发送，交易ID: ${transaction.hash}<br>正在等待确认…<br>${signedTx}<br>`;
            transaction.wait().then((receipt) => {
                result.innerHTML = result.innerHTML + `交易已确认，加入区块号: ${receipt.blockNumber}<br>`;
                provider.getBalance(wallet.address).then((balance) => {
                    result.innerHTML = result.innerHTML + `我方钱包余额：${ethers.formatEther(balance)}`;
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
            result.innerHTML = `网络异常！请把下面的HEX格式的交易拷贝到第三方网站上去发布。<br><br>${signedTx}<br><br>发布交易的第三方网站：<br>https://etherscan.io/pushTx`;
            alert(err);
        });
    });

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

    document.getElementById('ethereum_dispatch_tx').addEventListener('click', async (evt) => {
        let txHex = document.getElementById('ethereum_dispatch_raw_hex').innerText.trim();
        if (txHex == '') {
            alert("交易Hex原始码不能为空！");
            return;
        }
        if (provider != '') {
            await openModal('请稍候，正在发布…');
            //            document.getElementById('ethereum_dispatch_result').parentNode.style.visibility = 'visible';
            provider.broadcastTransaction(txHex).then((txResponse) => {
                let result = document.getElementById('ethereum_dispatch_result');
                result.innerHTML = `交易已发送，交易ID: ${txResponse.hash}<br>正在等待确认…`;
                txResponse.wait().then((receipt) => {
                    let result = document.getElementById('ethereum_dispatch_result');
                    result.innerHTML = result.innerHTML + `交易已确认，加入区块号: ${receipt.blockNumber}<br>`;
                    closeModal();
                }).catch(err => {
                    closeModal();
                    alert(err);
                });
            }).catch(err => {
                document.getElementById('ethereum_dispatch_result').innerHTML = `发布失败：${err}`;
                closeModal();
            });
        } else {
            alert("网络问题，未能取得可用的provider!");
        }
    });

    document.getElementById('ethereum_decode_tx').addEventListener('click', (evt) => {
        let txHex = document.getElementById('ethereum_dispatch_raw_hex').innerText.trim();
        if (txHex == '') {
            alert("交易Hex原始码不能为空！");
            return;
        }
        const tx = ethers.Transaction.from(txHex);
        document.getElementById('dis_raw_hex').innerHTML = txHex;
        document.getElementById('dec_fee').innerHTML = `
            交易id：${tx.hash}　　　　手续费：
            ${tx.type == 2 ? ethers.formatEther(tx.maxFeePerGas * tx.gasLimit) : ethers.formatEther(tx.gasPrice * tx.gasLimit)}以太币
        `;
        let deconstruction = `
            <tr><td colspan="2" style="width: 10rem">转出地址</td><td>${tx.from}</td></tr>
            <tr><td colspan="2">转入地址</td><td>${tx.to}</td></tr>
            <tr><td colspan="2">转账金额（以太币）</td><td>${ethers.formatEther(tx.value)}</td></tr>
            <tr><td rowspan="4">交易费用</td><td>最高单价</td><td>${tx.maxFeePerGas} wei</td></tr>
            <tr><td>小费单价</td><td>${tx.maxPriorityFeePerGas} wei</td></tr>
            <tr><td>油价</td><td>${tx.gasPrice} wei</td></tr>
            <tr><td>耗油上限</td><td>${tx.gasLimit}</td></tr>
            <tr><td colspan="2">区块链id</td><td>${tx.chainId}</td></tr>
            <tr><td colspan="2">备注</td><td>${ethers.toUtf8String(tx.data)}</td></tr>
            <tr><td colspan="2">交易类型</td><td>${tx.type} (${tx.typeName})</td></tr>
            <tr><td colspan="2">流水号</td><td>${tx.nonce}</td></tr>
        `;
        document.querySelector('#deconstruction_table>tbody').innerHTML = deconstruction;
        document.getElementById('dialog_deconstruction_rawtx').showModal();
    });

    document.getElementById('ens_address_btn').addEventListener("click", async (evt) => {
        let ensName = document.getElementById('ens_name').value.trim();
        if (!ensName) {
            alert('域名不能为空！');
            return;
        }
        await openModal('请稍候，正在查询…');
        document.getElementById('ethereum_address').value = '';
        try {
            const address = await provider.resolveName(ensName);
            document.getElementById('ethereum_address').value = address;
        } catch (error) {
            document.getElementById('ethereum_address').value = "出错:" + error;
        }
        closeModal();
    });

    document.getElementById('address_ens_btn').addEventListener("click", async (evt) => {
        let ensAddress = document.getElementById('ethereum_address').value.trim();
        if (!ensAddress) {
            alert('地址不能为空！');
            return;
        }
        await openModal('请稍候，正在查询…');
        document.getElementById('ens_name').value = '';
        try {
            const ensName = await provider.lookupAddress(ensAddress);
            document.getElementById('ens_name').value = ensName ? ensName : '没有记录';
        } catch (error) {
            document.getElementById('ens_name').value = "出错:" + error;
        }
        closeModal();
    });

    document.getElementById('ens_reset').addEventListener('click', (evt) => {
        document.getElementById('ens_name').value = '';
        document.getElementById('ethereum_address').value = '';
    });

    document.getElementById('ethereum_tx_type').addEventListener('change', (evt) => {
        if (evt.target.value == "2") {
            document.getElementById('ethereum_priority_fee').parentNode.style.display = "inline";
        } else {
            document.getElementById('ethereum_priority_fee').parentNode.style.display = "none";
        }
    });

    document.getElementById('ethereum_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('ethereum_private_password').setAttribute('type', 'text');
        document.getElementById('ethereum_privateKey').setAttribute('type', 'text');
    });

    document.getElementById('ethereum_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('ethereum_private_password').setAttribute('type', 'password');
        document.getElementById('ethereum_privateKey').setAttribute('type', 'password');
    });

    document.getElementById('sign_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('sign_private_password').setAttribute('type', 'text');
        document.getElementById('sign_privateKey').setAttribute('type', 'text');
    });

    document.getElementById('sign_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('sign_private_password').setAttribute('type', 'password');
        document.getElementById('sign_privateKey').setAttribute('type', 'password');
    });

    document.getElementById('encrypt_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('encrypt_private_password').setAttribute('type', 'text');
        document.getElementById('encrypt_private_key').setAttribute('type', 'text');
    });

    document.getElementById('encrypt_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('encrypt_private_password').setAttribute('type', 'password');
        document.getElementById('encrypt_private_key').setAttribute('type', 'password');
    });

    document.getElementById('symmetric_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('symmetric_password').setAttribute('type', 'text');
    });

    document.getElementById('symmetric_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('symmetric_password').setAttribute('type', 'password');
    });

    document.getElementById('steganography_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('steganography_password').setAttribute('type', 'text');
    });

    document.getElementById('steganography_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('steganography_password').setAttribute('type', 'password');
    });

    document.getElementById('ethereum_mnemonic_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('ethereum_password').setAttribute('type', 'text');
    });

    document.getElementById('ethereum_mnemonic_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('ethereum_password').setAttribute('type', 'password');
    });

    document.getElementById('ethereum_new_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('ethereum_new_private_password').setAttribute('type', 'text');
        document.getElementById('ethereum_new_privatekey').setAttribute('type', 'text');
    });

    document.getElementById('ethereum_new_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('ethereum_new_private_password').setAttribute('type', 'password');
        document.getElementById('ethereum_new_privatekey').setAttribute('type', 'password');
    });

    document.getElementById('customize_mnemonic_words').querySelectorAll('input[class="mnemonic_customize"]').forEach(e => {
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
    });

    document.getElementById('mnemonic_customize_btn').addEventListener('click', (evt) => {
        let bins = document.getElementById('customize_binary').value.trim();
        const count = parseInt(document.getElementById('customize_mnemonic_length').value);
        const inputNodes = document.getElementById('customize_mnemonic_words').querySelectorAll('input');
        let entropy_modify, entropy;
        if (bins == '') {
            entropy = new Uint8Array(count * 4 / 3);                                                            //16,20,24,28或者32
            crypto.getRandomValues(entropy);
        } else {
            if (count * 32 / 3 != bins.length) {
                alert(`你输入的二进制数量不是${count * 32 / 3}！`);
                return;
            }
            const bytes = bins.match(/.{1,8}/g) || [];
            entropy = new Uint8Array(
                bytes.map(byte => parseInt(byte.padEnd(8, '0'), 2))
            );
        }
        const entropyBits = entropy.reduce(
            (acc, byte) => acc + byte.toString(2).padStart(8, '0'), ''
        );
        if(bins==''){
            document.getElementById('customize_binary').value = entropyBits;
            document.getElementById('customize_binary').dispatchEvent(new Event('input'));
        }
        let chunks = entropyBits.match(/.{1,11}/g) || []; //按11位长度拆分成数组
        const indices = chunks.map(binary => parseInt(binary, 2));
        for (let i = 0; i < (inputNodes.length - 1); i++) {
            if (bins == '' && inputNodes[i].classList.contains("customize")) {
                let index = ethereum_language.getWordIndex(inputNodes[i].value.trim());
                chunks[i] = index.toString(2).padStart(11, '0');
            } else {
                inputNodes[i].value = ethereum_language.getWord(indices[i]);
            }
        }
        entropy_modify = new Uint8Array((chunks.join('').match(/.{1,8}/g) || []).map(bin => parseInt(bin, 2)));

        const mnemonic = ethers.Mnemonic.entropyToPhrase(entropy_modify, ethereum_language);
        let lang = document.getElementById('customize_new_language').value;
        inputNodes[count - 1].value = mnemonic.split(lang == 'ja' ? '　' : ' ')[count - 1];
        document.getElementById('mnemonic_customize_result').innerHTML = `产生的助记词为：&nbsp;&nbsp;&nbsp;&nbsp;<b style="color: gray; outline: 1px solid red; outline-offset: 4px;">${mnemonic}</b>`;
    });

    document.getElementById('mnemonic_customize_reset').addEventListener('click', (evt) => {
        let inputNodes = document.getElementById('customize_mnemonic_words').querySelectorAll('input');
        inputNodes.forEach((e) => {
            e.value = '';
            e.classList.remove('customize');
            e.style.borderColor = 'black';
        });
        inputNodes[inputNodes.length - 1].style.borderColor = "rgb(153, 153, 153)";
        document.getElementById('mnemonic_customize_result').innerHTML = '';
        document.getElementById('customize_binary').value = '';
        document.getElementById('customize_sta').innerHTML = '二进制长度0，其中0个“1”，0个“0”';
    });

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
            alert('内容不能为空！');
            return;
        }
        document.getElementById("qrcode").innerHTML = '';
        document.getElementById('qrcode_title_dis').innerHTML = document.getElementById('qrcode_title').value.trim();
        document.getElementById('qrcode_tail_dis').innerHTML = document.getElementById('qrcode_tail').value.trim();
        let image = './images/default_qr.png';
        let qr_logo = document.getElementById('logo_preview').querySelector('img');
        if (qr_logo) {
            image = qr_logo.getAttribute('src');
        }
        try {
            const qrCode = new QRCodeStyling({
                width: 256,
                height: 256,
                data: content,
                image: image, // 直接传入Logo
                dotsOptions: {
                    color: "#000",
                    type: "rounded" // 圆点样式
                },
                backgroundOptions: {
                    color: "#fff",
                },
                imageOptions: {
                    crossOrigin: "anonymous",
                    margin: 4 // Logo边距
                }
            });

            qrCode.append(document.getElementById("qrcode"));
        } catch (err) {
            alert(err);
        }
    });

    document.getElementById('qrcode_reset').addEventListener('click', (evt) => {
        document.getElementById("qrcode").innerHTML = '<div style="width: 256px; height: 256px; border: 1px dotted black; line-height: 256px; color: gray;">二维码</div>';
        document.getElementById('qrcode_content').value = '';
        document.getElementById('qrcode_title_dis').innerHTML = '标题';
        document.getElementById('qrcode_tail_dis').innerHTML = '副标题';
        document.getElementById('qrcode_title').value = '';
        document.getElementById('qrcode_tail').value = '';
        document.getElementById('logo_preview').innerHTML = '';
        document.getElementById('logo_file').value = '';
    });

    document.getElementById('customize_new_language').addEventListener('change', (evt) => {
        document.getElementById('ethereum_configure_language').value = evt.target.value;
        document.getElementById('ethereum_configure_language').dispatchEvent(new Event('change'));
        document.getElementById('mnemonic_customize_reset').dispatchEvent(new Event('click'));
    });

    document.getElementById('customize_binary').addEventListener('keydown', function (e) {
        // 允许的功能键：退格、删除、Tab、方向键等
        const allowedKeys = [
            'Backspace', 'Delete', 'Tab',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Home', 'End', 'Enter'
        ];
        const ctrlKeys = ['a', 'c', 'v', 'x', 'z']; // 全选、复制、粘贴、剪切、撤销

        // 如果是Ctrl组合键，允许
        if (e.ctrlKey && ctrlKeys.includes(e.key.toLowerCase())) {
            return true;
        }
        // 如果按下的键不在允许列表中，且不是0或1，阻止输入
        if (!allowedKeys.includes(e.key) && e.key !== '0' && e.key !== '1') {
            e.preventDefault();
        }
    });

    document.getElementById('customize_binary').addEventListener('input', (ev) => {
        let bins = ev.target.value.trim();
        let c1 = 0, c0 = 0;
        for (let i = 0; i < bins.length; i++) {
            if (bins[i] == '1') {
                c1++;
            } else {
                c0++;
            }
        }
        document.getElementById('customize_sta').innerHTML = `二进制长度${bins.length}，其中${c1}个“1”，${c0}个“0”`;
    });

    document.getElementById('customize_binary').addEventListener('blur',(ev)=>{

    });

    document.getElementById('steganography_image_file').addEventListener('change', function (event) {
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
        const fileInput = document.getElementById('steganography_file');
        if (message == '' && fileInput.files.length < 1) {
            alert('请输入一段内容或者选择一个文件！');
            return;
        }

        const fileImage = document.getElementById('steganography_image_file');
        if (fileImage.files.length < 1) {
            alert('必须选择一张图片！');
            return;
        }

        let msgBytes;
        if (message == '') {//被隐写的内容在文件中
            const file = fileInput.files[0];
            msgBytes = new Uint8Array(await file.arrayBuffer());
        } else {
            const encoder = new TextEncoder('utf-8');
            msgBytes = encoder.encode(message);
        }

        const password = document.getElementById('steganography_password').value.trim();
        //        const imgObj = document.getElementById('steganography_preview');
        const imgObj = new Image();
        imgObj.onload = async () => {
            try {
                const blob = await hideEncryptedMessageInImage(imgObj, msgBytes, password);
                const resultImg = document.getElementById('steganographyed_image');
                resultImg.src = URL.createObjectURL(blob);
                resultImg.parentNode.style.visibility = 'visible';
                resultImg.parentNode.querySelector('a').href = resultImg.src;
                resultImg.parentNode.querySelector('a').download = 'hidden-message.png';
            } catch (error) {
                alert('错误: ' + error.message);
            }
        }
        imgObj.src = URL.createObjectURL(fileImage.files[0]);
    });

    document.getElementById('get_steganography_btn').addEventListener('click', async () => {
        const file = document.getElementById('steganography_image_file').files[0];
        const password = document.getElementById('steganography_password').value.trim();

        if (!file) {
            alert('请选择图片');
            return;
        }

        const imgObj = new Image();
        imgObj.src = URL.createObjectURL(file);
        imgObj.onload = async () => {
            try {
                const message = await extractEncryptedMessageFromImage(imgObj, password);//返回Uint8Array。
                if (document.getElementById('steganography_checkbox').checked) {
                    const blob = new Blob([message], { type: 'application/octet-stream' });
                    triggerDownload(blob, "steganography.dat");
                } else {
                    const encoder = new TextDecoder();
                    document.getElementById('steganography_content').value = encoder.decode(message);
                    document.getElementById('steganography_content').style.borderColor = 'red';
                }
            } catch (error) {
                document.getElementById('steganography_content').value = '';
                alert('错误: ' + error.message);
            }
        }
    });

    document.getElementById('clear_steganography_btn').addEventListener('click', async () => {
        const file = document.getElementById('steganography_image_file').files[0];

        if (!file) {
            alert('请选择图片');
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

                // 获取图像数据
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
                    aObj.innerText = '下载已经抹去信息的图片';
                    document.getElementById('clear_steganography_btn').parentNode.appendChild(aObj);
                }, 'image/png');
            } catch (error) {
                document.getElementById('steganography_content').value = '';
                alert('错误: ' + error.message);
            }
        }
    });

    document.getElementById('steganography_reset').addEventListener('click', (evt) => {
        //        document.getElementById("qrcode").innerHTML = '<div style="width: 256px; height: 256px; border: 1px dotted black; line-height: 256px; color: gray;">二维码</div>';
        document.getElementById('steganography_content').value = '';
        document.getElementById('steganography_file').value = '';
        document.getElementById('steganography_content').style.borderColor = 'black';
        document.getElementById('steganography_password').value = '';
        document.getElementById('steganography_preview').setAttribute('src', '');
        document.getElementById('steganography_image_file').value = '';
        document.getElementById('steganographyed_image').setAttribute('src', '');
        document.getElementById('steganography_checkbox').checked = false;
        //        evt.target.parentNode.removeChild(evt.target.parentNode.querySelector('a'));
    });

    document.getElementById('close_hidden_image').addEventListener('click', (evt) => {
        evt.target.parentNode.parentNode.style.visibility = 'hidden';
    });

    document.getElementById('sign_file').addEventListener('change', async function (event) {
        const file = event.target.files[0];

        try {
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            document.getElementById('sign_digest').value = hashHex;

        } catch (error) {
            alert('Failed!' + error);
        }
    });

    document.getElementById('generate_sign_btn').addEventListener('click', async (evt) => {
        let digest = document.getElementById('sign_digest').value.trim();
        if (digest == '') {
            alert('文件摘要不能为空！');
            return;
        }
        let privateKeyHex = document.getElementById('sign_privateKey').value.trim();
        if (privateKeyHex.slice(0, 2) == "0x") {
            privateKeyHex = privateKeyHex.slice(2);
        }
        if (privateKeyHex) {
            if (privateKeyHex.slice(0, 2) == '6P') {
                let password = document.getElementById('sign_private_password').value;
                if (password == '') {
                    privateKeyHex = null;
                    alert('私钥已经加密，但是没有提供私钥的保护密码！');
                    return;
                } else {//私钥被密码保护，需要解密
                    try {
                        await openModal("正在处理，请稍后...");
                        if (!bip38.verify(privateKeyHex)) {
                            throw new Error('不是一个合法的加密私钥！');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        let decryptKey = bip38.decrypt(privateKeyHex, password, null, { N: N, r: r, p: p });
                        privateKeyHex = Buffer.Buffer.from(decryptKey.privateKey).toString('hex');
                        closeModal();
                    } catch (error) {
                        privateKeyHex = null;
                        closeModal();
                        alert(error);
                        return;
                    };
                }
            }

            try {
                const hash = Uint8Array.from(Buffer.Buffer.from(digest, 'hex'));
                const privateKey = Buffer.Buffer.from(privateKeyHex, 'hex');
                const keyPair = ECPair.fromPrivateKey(privateKey);

                // 3. 使用Schnorr签名
                let signature = bitcoinerlabsecp256k1.signSchnorr(hash, keyPair.privateKey);
                signature = Buffer.Buffer.from(signature).toString('hex');
                //document.getElementById('sign_result').value = Buffer.Buffer.from(signature).toString('hex');
                document.getElementById('sign_result').value = signature;
            } catch (err) {
                alert('签名失败！' + err);
            }
        }
    });

    document.getElementById('virify_sign_btn').addEventListener('click', (evt) => {
        let publicKey = document.getElementById('sign_publicKey').value.trim();
        let signature = document.getElementById('sign_result').value.trim();
        let digest = document.getElementById('sign_digest').value.trim();
        if (!digest || !signature || !publicKey) {
            alert('被签名的文件（或摘要）、公钥和签名三者缺一不可！');
            return;
        }
        if (publicKey.slice(0, 2) == '0x') {
            publicKey = publicKey.slice(2);
        }
        const publicKeyBuf = bitcoinerlabsecp256k1.xOnlyPointFromPoint(Buffer.Buffer.from(publicKey, 'hex'));
        const signatureBuf = Uint8Array.from(Buffer.Buffer.from(signature, 'hex'));
        const digestBuf = Uint8Array.from(Buffer.Buffer.from(digest, 'hex'));
        let isValid;
        try {//文件签名的验证
            isValid = bitcoinerlabsecp256k1.verifySchnorr(digestBuf, publicKeyBuf, signatureBuf);
        } catch (err) {
            isValid = false;
        }
        if (!isValid) {//一段文本签名的验证
            let address = ethers.computeAddress('0x' + publicKey);
            let address1 = ethers.verifyMessage(digest, '0x' + signature);
            isValid = address.toLowerCase() === address1.toLowerCase() ? true : false;
        }

        evt.target.parentNode.querySelector('#verify_result').style.visibility = 'visible';
        evt.target.parentNode.querySelector('#verify_result').setAttribute('src', isValid ? 'images/sign_ok.png' : 'images/sign_failed.png');
    });

    document.getElementById('sign_reset').addEventListener('click', (evt) => {
        document.getElementById('sign_file').value = '';
        document.getElementById('sign_digest').value = '';
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
            alert('没有选择文件或者没有公钥！');
            return;
        }
        const reader = new FileReader();
        await openModal("正在加密 ...");
        reader.onload = async function (e) {
            fileData = reader.result;
            const originalSize = file.size;
            // 2. 生成临时密钥对(ECDH)
            const ephemeralKeyPair = ECPair.makeRandom();
            const ephemeralPublicKey = ephemeralKeyPair.publicKey.toString('hex');

            // 3. 使用接收方的公钥和临时私钥生成共享密钥
            const recipientPublicKey = Buffer.Buffer.from(publicKey, 'hex');
            let encryptedContent, iv;
            try {

                const sharedSecret = Buffer.Buffer.from(bitcoinerlabsecp256k1.pointMultiply(recipientPublicKey, ephemeralKeyPair.privateKey));

                // 4. 使用共享密钥派生AES密钥
                const aesKey = await deriveAesKey(sharedSecret);

                // 5. 使用AES-GCM加密文件内容
                iv = crypto.getRandomValues(new Uint8Array(12)); // 初始化向量
                encryptedContent = await crypto.subtle.encrypt(
                    { name: "AES-GCM", iv },
                    aesKey,
                    fileData
                );
            } catch (err) {
                closeModal();
                throw (err);
            }
            closeModal();

            // 6. 组合加密结果: 临时公钥(33字节) + IV(12字节) + 加密内容
            const result = new Uint8Array(33 + 12 + encryptedContent.byteLength);
            result.set(ephemeralKeyPair.publicKey, 0);       // 临时公钥
            result.set(iv, 33);                              // IV
            result.set(new Uint8Array(encryptedContent), 45); // 加密内容

            const blob = new Blob([result], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            document.getElementById('encrypt_result').innerHTML = `
            加密成功!<br>
            原始文件大小：${formatBytes(originalSize)}<br>
            加密后大小：${formatBytes(result.length)}<br>
            加密使用的临时密钥：${ephemeralPublicKey}<br>
            <a href="${url}" download="(已加密)${file.name}">下载加密文件</a>
        `;
        }
        reader.onerror = (err) => {
            closeModal();
            alert(err);
        }
        reader.readAsArrayBuffer(file);
    });


    document.getElementById('decrypt_btn').addEventListener('click', async (evt) => {
        document.getElementById('encrypt_result').innerHTML = '';
        const file = document.getElementById('encrypt_file').files[0];
        let privateKeyHex = document.getElementById('encrypt_private_key').value.trim();
        if (!file || !privateKeyHex) {
            alert('没有加密文件或者私钥！');
            return;
        }
        if (privateKeyHex) {
            await openModal("正在加密，请稍后……");
            if (privateKeyHex.slice(0, 2) == '6P') {
                let password = document.getElementById('encrypt_private_password').value;
                if (password == '') {
                    privateKeyHex = null;
                    alert('私钥已经加密，但是没有提供私钥的保护密码！');
                    return;
                } else {//私钥被密码保护，需要解密
                    try {
                        if (!bip38.verify(privateKeyHex)) {
                            throw new Error('不是一个合法的加密私钥！');
                        }
                        let N = parseInt(document.getElementById('N_id').value.trim());
                        let r = parseInt(document.getElementById('r_id').value.trim());
                        let p = parseInt(document.getElementById('p_id').value.trim());
                        let decryptKey = bip38.decrypt(privateKeyHex, password, null, { N: N, r: r, p: p });
                        privateKeyHex = Buffer.Buffer.from(decryptKey.privateKey).toString('hex');
                    } catch (error) {
                        privateKeyHex = null;
                        closeModal();
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
                        throw new Error('无效的加密文件格式');
                    }
                    // 2. 解析文件内容: 临时公钥(33字节) + IV(12字节) + 加密内容
                    const ephemeralPublicKey = encryptedArray.slice(0, 33);
                    const iv = encryptedArray.slice(33, 45);
                    const ciphertext = encryptedArray.slice(45);

                    // 3. 使用自己的私钥和临时公钥生成共享密钥
                    const keyPair = ECPair.fromPrivateKey(Buffer.Buffer.from(privateKeyHex, 'hex'));
                    const sharedSecret = Buffer.Buffer.from(bitcoinerlabsecp256k1.pointMultiply(ephemeralPublicKey, keyPair.privateKey));


                    // 4. 使用共享密钥派生AES密钥
                    const aesKey = await deriveAesKey(sharedSecret);

                    // 5. 使用AES-GCM解密内容
                    const decryptedContent = await crypto.subtle.decrypt(
                        { name: "AES-GCM", iv },
                        aesKey,
                        ciphertext
                    );

                    // 6. 尝试检测文件类型
                    const decryptedArray = new Uint8Array(decryptedContent);
                    // const mimeType = detectMimeType(decryptedArray);


                    const blob = new Blob([decryptedArray], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);

                    document.getElementById('encrypt_result').innerHTML = `
                        解密成功!<br>
                        文件大小：${formatBytes(decryptedArray.length)}<br>
                        <a href="${url}" download="decrypted_file.${document.getElementById('encrypt_file').value.split('.')[1]}">下载加密文件</a>
                    `;
                    closeModal();
                }
                reader.onerror = (err) => {
                    closeModal();
                    alert(err);
                }
                reader.readAsArrayBuffer(file);
            } catch (error) {
                alert('解密文件时出错: ' + error.message);
            }
        }
    });

    document.getElementById('encrypt_reset').addEventListener('click', (evt) => {
        document.getElementById('encrypt_file').value = '';
        document.getElementById('encrypt_private_key').value = '';
        document.getElementById('encrypt_private_password').value = '';
        document.getElementById('encrypt_publicKey').value = '';
        document.getElementById('encrypt_result').innerHTML = '';
    });

    document.getElementById('pgp_encrypt_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', '../images/openeye.png');
        document.getElementById('pgp_private_password').setAttribute('type', 'text');
    });

    document.getElementById('pgp_encrypt_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', '../images/closeeye.png');
        document.getElementById('pgp_private_password').setAttribute('type', 'password');
    });

    document.getElementById('pgp_checkbox').addEventListener('click', (ev) => {
        if (ev.target.checked) {
            document.getElementById('pgp_generate_div').style.display = 'block';
        } else {
            document.getElementById('pgp_generate_div').style.display = 'none';
        }
    });

    document.getElementById('pgp_generate_btn').addEventListener('click', async (ev) => {
        const divBox = document.getElementById('pgp_generate_div');
        const name = divBox.querySelector('input[name="name"]').value.trim();
        const email = divBox.querySelector('input[name="email"]').value.trim();
        if (!name || !email) {
            alert('姓名和邮件不能为空！');
            return;
        }
        const expire = parseInt(divBox.querySelector('input[name="expire"]').value.trim()) * 85400;//换算成秒
        let pgp_algo = 'ecc';
        divBox.querySelectorAll('input[name="pgp_algorithm"]').forEach(e => {
            if (e.checked === true) {
                pgp_algo = e.value;
            }
        });
        const password = document.getElementById('pgp_private_password').value.trim();
        /*         const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                    type: pgp_algo,
                    rsaBits: 4096,
                    userIDs: [{
                        name: name,
                        email: email,
                        keyExpirationTime: expire
                    }],
                    passphrase: password
                });
         */
        try {
            const { privateKey, publicKey, revocationCertificate } = await openpgp.generateKey({
                type: pgp_algo,
                //            curve: 'curve25519',
                userIDs: [{
                    name: name,
                    email: email
                }],
                format: 'armored',
                keyExpirationTime: expire,
                passphrase: password
            });

            document.getElementById('pgp_public_key').value = publicKey;
            document.getElementById('pgp_private_key').value = privateKey;
        } catch (err) {
            alert(err);
        }
    });

    document.getElementById('pgp_encrypt_btn').addEventListener('click', async (ev) => {
        const fileInput = document.getElementById('pgp_encrypt_file');
        const public_key = document.getElementById('pgp_public_key').value;
        if (!fileInput.files.length || !public_key) {
            alert('被加密的文件和公钥不能为空！');
            return;
        }
        try {
            await openModal("正在加密，请稍后……")
            const publicKey = await openpgp.readKey({ armoredKey: public_key });

            const file = fileInput.files[0];
            const fileContent = await file.arrayBuffer();

            const message = await openpgp.createMessage({ binary: new Uint8Array(fileContent) });
            const encrypted = await openpgp.encrypt({
                message,
                encryptionKeys: publicKey,
                format: 'binary'
            });

            const blob = new Blob([encrypted], { type: 'application/pgp-encrypted' });
            triggerDownload(blob, file.name + '.pgp');
            alert("加密文件正在自动下载！");
            closeModal();
        } catch (error) {
            closeModal();
            alert('加密失败：' + error);
        }
    });

    document.getElementById('pgp_decrypt_btn').addEventListener('click', async (ev) => {
        const fileInput = document.getElementById('pgp_encrypt_file');
        const private_key = document.getElementById('pgp_private_key').value;
        if (!fileInput.files.length || !private_key) {
            alert('被解密的文件和私钥不能为空！');
            return;
        }

        try {
            await openModal("正在解密，请稍后……")
            const passphrase = document.getElementById('pgp_private_password').value.trim();

            let privateKey;
            if (passphrase == '') {
                privateKey = await openpgp.readPrivateKey({ armoredKey: private_key });
            } else {
                privateKey = await openpgp.decryptKey({
                    privateKey: await openpgp.readPrivateKey({ armoredKey: private_key }),
                    passphrase
                });
            }

            const file = fileInput.files[0];
            let destFile = 'decrypted_file';
            if (file.name.slice(-4) == '.pgp') {
                destFile = file.name.slice(0, file.name.length - 4);
            }
            const encryptedData = await file.arrayBuffer();
            const message = await openpgp.readMessage({ binaryMessage: new Uint8Array(encryptedData) });
            const { data: decrypted } = await openpgp.decrypt({
                message,
                decryptionKeys: privateKey,
                format: 'binary'
            });

            const blob = new Blob([decrypted], { type: 'application/pgp-encrypted' });
            triggerDownload(blob, destFile);
            alert("解密后的文件正在自动下载！");
            closeModal();
        } catch (error) {
            closeModal();
            alert('解密失败：' + error);
        }
    });

    document.getElementById('pgp_encrypt_reset').addEventListener('click', (ev) => {
        document.getElementById('pgp_encrypt_file').value = '';
        document.getElementById('pgp_private_key').value = '';
        document.getElementById('pgp_private_password').value = '';
        document.getElementById('pgp_public_key').value = '';
        document.getElementById('pgp_generate_div').style.display = 'none';
    });

    document.getElementById('symmetric_encrypt_btn').addEventListener('click', async (ev) => {
        const fileInput = document.getElementById('symmetric_file');
        const password = document.getElementById('symmetric_password').value.trim();
        if (!fileInput.files.length || !password) {
            alert('请选择文件并输入密码。');
            return;
        }

        try {
            const file = fileInput.files[0];
            const fileData = await file.arrayBuffer();
            const plaintextMessage = await openpgp.createMessage({ binary: new Uint8Array(fileData) });

            const encrypted = await openpgp.encrypt({
                message: plaintextMessage,
                passwords: [password],
                format: 'binary' // 输出二进制格式
            });

            const blob = new Blob([encrypted], { type: 'application/octet-stream' });
            triggerDownload(blob, file.name + '.pgp');
        } catch (error) {
            alert(`加密失败: ${error.message}`);
        }
    });

    document.getElementById('symmetric_decrypt_btn').addEventListener('click', async (ev) => {
        const fileInput = document.getElementById('symmetric_file');
        const password = document.getElementById('symmetric_password').value.trim();
        if (!fileInput.files.length || !password) {
            alert('请选择文件并输入密码。');
            return;
        }

        try {
            const encryptedFile = fileInput.files[0];
            const encryptedData = new Uint8Array(await encryptedFile.arrayBuffer());

            const message = await openpgp.readMessage({ binaryMessage: encryptedData });

            const { data: decrypted, signatures } = await openpgp.decrypt({
                message: message,
                passwords: [password],
                format: 'binary' // 指定解密输出为二进制
            });

            const blob = new Blob([decrypted], { type: 'application/octet-stream' });

            const originalFilename = encryptedFile.name.replace(/\.(pgp|gpg)$/i, '') || 'decrypted_file';
            triggerDownload(blob, originalFilename);

        } catch (error) {
            // 捕获最常见的错误：密码错误
            if (error.message.includes('password')) {
                alert('解密失败：密码错误或文件已损坏。');
            } else {
                alert(`解密失败: ${error.message}`);
            }
        }
    });

    document.getElementById('symmetric_reset').addEventListener('click', (ev) => {
        document.getElementById('symmetric_file').value = '';
        document.getElementById('symmetric_password').value = '';
    });

    document.getElementById('encode_btn').addEventListener('click', (evt) => {
        document.getElementById('input_hex').value = ethers.hexlify(ethers.toUtf8Bytes(document.getElementById('input_utf8').value.trim()));
    });

    document.getElementById('decode_btn').addEventListener('click', (evt) => {
        try {
            let inputHex = document.getElementById('input_hex').value.trim();
            if (inputHex.slice(0, 2) != '0x') {
                inputHex = '0x' + inputHex;
            }
            //            const originText = Buffer.Buffer.from(scriptPubKeyHex.slice(4), 'hex').toString('utf8');
            const originText = ethers.toUtf8String((inputHex));
            document.getElementById('input_utf8').value = originText;
        } catch (err) {
            alert(err);
        }
    });

    document.getElementById('encode_reset').addEventListener('click', (evt) => {
        document.getElementById('input_utf8').value = '';
        document.getElementById('input_hex').value = '';
    });
    /*
        document.getElementById('ethereum_new_privatekey').addEventListener('blur',(evt)=>{
            if (bip38.verify(evt.target.value.trim())){
                evt.target.parentNode.querySelector('span').style.visibility = 'visible';
            }else{
                evt.target.parentNode.querySelector('span').style.visibility = 'hidden';
            }
        })
    */
    init_ethereum();
    if (!provider) {
        console.log('初始化provider失败！');
    }
});

function ethereum_recover_wallet() {
    wallets.mnemonic = document.getElementById('ethereum_mnemonic').value.trim();
    let privateKey = document.getElementById('ethereum_new_privatekey').value.trim();

    //    var rootNode;
    if (!ethers.Mnemonic.isValidMnemonic(wallets.mnemonic, ethereum_language) && !(privateKey.length == 66 && privateKey.slice(0, 2) == '0x') && !bip38.verify(privateKey)) {
        alert("至少输入一个合法的助记词或者一个合法的明文私钥或者一个合法的密文私钥");
        return;
    }
    let hd_wallet;
    let mnemonic_passwd;
    let passwd = '';
    if (privateKey != '') {//从私钥恢复钱包
        if (bip38.verify(privateKey)) {//加了密的私钥
            const password = document.getElementById('ethereum_new_private_password').value.trim();
            if (password == '') {
                alert('必须输入私钥的解密密码！');
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
    } else {//从助记词恢复钱包
        let path = document.getElementById('ethereum_new_path').value.trim();//格式：m/44'/60'/i'/0|1/j/…'，i,j=1,2,3,...
        const regex = /^m\/44'\/60'\/(\d+)'\/([01])(?:\/(\d+))+$/;
        if (!regex.test(path)) {
            alert("钱包路径格式不对！");
            return;
        }
        mnemonic_passwd = document.getElementById('ethereum_password').value.trim();
        hd_wallet = ethers.HDNodeWallet.fromPhrase(wallets.mnemonic, mnemonic_passwd, path, ethereum_language);
        privateKey = hd_wallet.privateKey;
        passwd = document.getElementById('ethereum_new_private_password').value.trim();
        if (passwd != '') {//需要加密私钥
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
    助记词：${wallets.mnemonic}<br>
    　私钥：${privateKey}${passwd == '' ? '' : '　（私钥被加密保护）'}<br>
    　公钥：${hd_wallet.publicKey}<br>
    　地址：${hd_wallet.address}<br>
    　路径：${hd_wallet.path}
    `;
}

function init_ethereum() {
    if (window.ethereum == null) {
        console.log("没有安装MetaMask插件，采用只读的默认供体");
        const network = ethereum_isTestNet ? "sepolia" : "homestead";

        /* 产生供体的三种方法 */
        //方法1：
        provider = ethers.getDefaultProvider(network);

        //方法2：
        //provider = ethers.getDefaultProvider(network, {
        //    etherscan: "NCGAQ33ESD34Y343Z4HHZHMT9D4DBFA9HK"
        //});

        //方法3：
        //const apiKey = '5b34a68e44cf47c3afcd16c4a9b74341';
        //const rpcURL = `https://${ethereum_isTestNet ? "sepolia" : "mainnet"}.infura.io/v3/${apiKey}`;
        //const provider = new ethers.JsonRpcProvider(rpcURL);
        /*  The End  */

    } else {
        provider = new ethers.BrowserProvider(window.ethereum);
        provider.getSigner().then(s => {
            signer = s;
        });
    }
}