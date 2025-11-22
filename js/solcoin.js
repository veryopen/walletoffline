
window.addEventListener("load", () => {
    document.getElementById('solcoin_configure_network').addEventListener('change', (ev) => {
        solcoin_network = ev.target.value;
        solcoin_isTestNet = solcoin_network == 'mainnet-beta' ? false : true;
        document.getElementById('solcoin_new_path').value = `m/44'/${solcoin_isTestNet ? 1 : 501}'/0'/0'`;
        document.getElementById('solcoin_new_path').parentNode.querySelector('span').innerText = `(Note: Path m/44'/${solcoin_isTestNet ? 1 : 501}'/i'/j' represents the jth wallet in the ith account, where i,j=0,1,2,…,2147483647)`;
    });

    document.getElementById('solcoin_configure_rate').addEventListener('blur', (ev) => {
        solcoin_rate = parseFloat(ev.target.value.trim());
    });

    document.getElementById('solcoin_configure_fee').addEventListener('blur', (ev) => {
        solcoin_fee_dollars = parseFloat(ev.target.value.trim());
        solcoin_fee_lamports = Math.round(10 ** 9 / solcoin_rate * solcoin_fee_dollars);
        document.getElementById('solcoin_fee').value = ev.target.value.trim();
        document.getElementById('solcoin_priority_fee').value = Math.floor(solcoin_fee_dollars * 99) / 100;
    });

    document.getElementById('solcoin_configure_language').addEventListener('change', (ev) => {
        switch (ev.target.value) {
            case 'cn': solcoin_language = bip39.wordlists.chinese_simplified; break;
            case 'tw': solcoin_language = bip39.wordlists.chinese_traditional; break;
            case 'ja': solcoin_language = bip39.wordlists.japanese; break;
            case 'es': solcoin_language = bip39.wordlists.spanish; break;
            case 'fr': solcoin_language = bip39.wordlists.french; break;
            case 'it': solcoin_language = bip39.wordlists.italian; break;
            case 'ko': solcoin_language = bip39.wordlists.korean; break;
            case 'pt': solcoin_language = bip39.wordlists.portuguese; break;
            case 'cz': solcoin_language = bip39.wordlists.czech; break;
            default: solcoin_language = bip39.wordlists.english; break;
        }
    });

    document.getElementById('solcoin_mnemonic_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('solcoin_password').setAttribute('type', 'text');
    })
    document.getElementById('solcoin_mnemonic_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('solcoin_password').setAttribute('type', 'password');
    })

    document.getElementById('solcoin_new_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('solcoin_new_secretKey').setAttribute('type', 'text');
        //        document.getElementById('solcoin_new_password').setAttribute('type', 'text');
    })
    document.getElementById('solcoin_new_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('solcoin_new_secretKey').setAttribute('type', 'password');
        //        document.getElementById('solcoin_new_password').setAttribute('type', 'password');
    });

    document.getElementById('solcoin_new_wallet').addEventListener('click', async (ev) => {
        document.getElementById('solcoin_new_secretKey').value = '';
        //        document.getElementById('solcoin_new_private_password').value = '';
        document.getElementById('solcoin_mnemonic').value = bip84.generateMnemonic(parseInt(document.getElementById('solcoin_mnemonic_length').value) * 32 / 3, null, solcoin_language);
        await openModal('Please hold on, processing...');
        solcoin_recover_wallet();
        closeModal();
    });

    document.getElementById('solcoin_recover_wallet').addEventListener('click', async (evt) => {
        await openModal('Please hold on, processing...');
        solcoin_recover_wallet();
        closeModal();
    });
    document.getElementById('solcoin_reset_wallet').addEventListener('click', (evt) => {
        document.getElementById('solcoin_mnemonic_length').value = "24";
        document.getElementById('solcoin_mnemonic').value = '';
        document.getElementById('solcoin_password').value = '';
        document.getElementById('solcoin_hd_wallet').innerHTML = '';
        document.getElementById('solcoin_new_secretKey').value = '';
        document.getElementById('solcoin_new_path').value = "m/44'/501'/0'/0'";
        //        document.getElementById('solcoin_new_password').value = '';
        solcoin_language = bip39.wordlists.english;
    });

    document.getElementById('solcoin_wallet_balance_btn').addEventListener('click', async (evt) => {
        let addressORtxid = document.getElementById('solcoin_wallet_address').value.trim();
        if (addressORtxid == '') {
            alert("Please enter the wallet address or transaction ID first.");
            return;
        }
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl(solcoin_network), "confirmed");
        if (addressORtxid.length == 44) {//按钱包地址查询，如：66TrHUCZLTyiRHAhLBE6Wwr3NPccd5KS3EFQGFWhwgDd
            const publicKey = new solanaWeb3.PublicKey(addressORtxid);
            if (!solanaWeb3.PublicKey.isOnCurve(publicKey.toBytes())) {
                alert('Not a valid solana address!');
                return;
            }
            await openModal('Please hold on, fetching...');
            connection.getBalance(publicKey).then(balance => {
                document.getElementById('solcoin_view_wallet_balance').innerHTML = `Balance: ${balance / solanaWeb3.LAMPORTS_PER_SOL} SOL`;
                closeModal();
            }).catch(err => { closeModal(); alert(err); })
        } else if (addressORtxid.length == 88) {//按交易id查询，2xsjUubk5gAGfzPfk3jkhFKUkNDmTLfUizBepZ5jPmpvV6inJJaJyt9sE2bQNevmxtLBavzNMCTif3usZM3cg45q

            const parsedTx = await connection.getParsedTransaction(addressORtxid, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
            });

            document.getElementById('solcoin_view_wallet_balance').innerHTML = `${parsedTx}`;
        }
    });

    document.getElementById('solcoin_sign_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('solcoin_sign_secretKey').setAttribute('type', 'text');
        //        document.getElementById('solcoin_sign_password').setAttribute('type', 'text');
    })
    document.getElementById('solcoin_sign_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('solcoin_sign_secretKey').setAttribute('type', 'password');
        //        document.getElementById('solcoin_sign_password').setAttribute('type', 'password');
    });

    document.getElementById('solcoin_generate_sign_btn').addEventListener('click', (ev) => {
        let secretKey = document.getElementById('solcoin_sign_secretKey').value.trim();
        let message = document.getElementById('solcoin_sign_text').value.trim();
        if (secretKey == '' || message == '') {
            alert("The key and the signed text cannot be empty!");
            return;
        }
        secretKey = bs58check.default.decode(secretKey);
        try {
            const messageBytes = tweetnaclUtil.decodeUTF8(message);
            const signature = tweetnacl.sign.detached(messageBytes, secretKey);
            document.getElementById('solcoin_sign_result').value = Buffer.Buffer.from(signature).toString("base64");
        } catch (err) {
            alert(`Program code executed failed: ${err}`);
        }
    })

    document.getElementById('solcoin_virify_sign_btn').addEventListener('click', (ev) => {
        let message = document.getElementById('solcoin_sign_text').value.trim();
        let public = document.getElementById('solcoin_sign_publicKey').value.trim();
        let signature = document.getElementById('solcoin_sign_result').value.trim();
        if (public == '' || signature == '' || message == '') {
            alert("The public key, signature, and signed text cannot be empty!");
            return;
        }
        try {
            const messageBytes = tweetnaclUtil.decodeUTF8(message);
            const publicKey = new solanaWeb3.PublicKey(public);
            const result = tweetnacl.sign.detached.verify(messageBytes, Buffer.Buffer.from(signature, 'base64'), publicKey.toBytes());
            document.getElementById('solcoin_verify_result').setAttribute("src", result ? "images/sign_ok.png" : "images/sign_failed.png");
            document.getElementById('solcoin_verify_result').style.visibility = "visible";
        } catch (err) {
            alert(`Runtime error: ${err}`);
        }
    })

    document.getElementById('solcoin_sign_reset').addEventListener('click', (evt) => {
        document.getElementById('solcoin_sign_text').value = '';
        document.getElementById('solcoin_sign_secretKey').value = '';
        document.getElementById('solcoin_sign_publicKey').value = '';
        document.getElementById('solcoin_sign_result').value = '';
        document.getElementById('solcoin_verify_result').style.visibility = 'hidden';
    })

    document.getElementById('solcoin_password_eye').addEventListener("mousedown", (ev) => {
        ev.target.setAttribute('src', 'images/openeye.png');
        document.getElementById('solcoin_secretKey').setAttribute('type', 'text');
//        document.getElementById('solcoin_private_password').setAttribute('type', 'text');
    })
    document.getElementById('solcoin_password_eye').addEventListener("mouseup", (ev) => {
        ev.target.setAttribute('src', 'images/closeeye.png');
        document.getElementById('solcoin_secretKey').setAttribute('type', 'password');
//        document.getElementById('solcoin_private_password').setAttribute('type', 'password');
    })

    document.getElementById('solcoin_ok_transfer').addEventListener('click', async function f(evt) {
        document.getElementById('solcoin_result_transfer').innerHTML = '';
        let to_address = document.getElementById('solcoin_to').value.trim();
        const data = document.getElementById('solcoin_data').value.trim();
        let transaction;
        let secretKey = document.getElementById('solcoin_secretKey').value.trim();
        if (secretKey == '') {
            alert('You must enter your wallet security key!');
            return;
        }
        const fromWallet = solanaWeb3.Keypair.fromSecretKey(bs58check.default.decode(secretKey));
        if (data != '') {//在链上保存数据资料
            let dataBytes = Buffer.Buffer.from(data);
            const instruction = new solanaWeb3.TransactionInstruction({
                keys: [], // 不需要额外账户
                programId: solanaWeb3.SystemProgram.programId, // 系统程序 (或你自定义的 programId)
                dataBytes, // 你的数据
            });
            transaction = new solanaWeb3.Transaction().add(instruction);

        } else {//普通的转账交易
            const toWallet = new solanaWeb3.PublicKey(to_address);
            if (!solanaWeb3.PublicKey.isOnCurve(toWallet.toBytes())) {
                alert('Not a valid solana address!');
                return;
            }
            let value = parseFloat('0' + document.getElementById('solcoin_value').value.trim());
            if (value <= 0) {
                alert('The transfer amount must be greater than 0!');
                return;
            }
            transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: fromWallet.publicKey,
                    toPubkey: toWallet,
                    lamports: value * solanaWeb3.LAMPORTS_PER_SOL
                })
            );
        }
        await openModal('请稍候，正在发布…');
        let connection, blockhash = '';
        try {
            connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl(solcoin_network), "confirmed");
            const res = await connection.getLatestBlockhash("finalized");
            blockhash = res.blockhash;
            document.getElementById('solcoin_blockhash').value = blockhash;
        } catch (err) {
            blockhash = document.getElementById('solcoin_blockhash').value.trim();
        }
        if (blockhash == '') {
            alert('Without the latest block hash, it is impossible to construct a transaction!');
            closeModal();
            return;
        }
        try {
            const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [fromWallet]);
            document.getElementById('solcoin_result_transfer').innerHTML = `交易已发送，签名ID：${signature}<br>查看交易: https://explorer.solana.com/tx/${signature}?cluster=${solcoin_network}`
        } catch (err) {
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromWallet.publicKey;

            await transaction.sign(fromWallet);//签名
            const serializedTx = transaction.serialize();//序列化后
            const txBase64 = Buffer.Buffer.from(serializedTx).toString("base64");//转成 base64
            document.getElementById('solcoin_result_transfer').innerHTML = `
                Code execution error: ${err}<br>
                You can copy the serialized transaction below to https://www.walletoffline.com/crypto or https://explorer.solana.com/tx/submitto broadcast(Note: Must be posted within one minute, otherwise it will expire):<br>
                <textarea style="word-break: break-all; border: 1px solid #CCC;width: 100%;height: 80px;">${txBase64}</textarea>
            `;
            document.getElementById('solcoin_result_transfer').querySelector('textarea').addEventListener("focus", function (ev) {
                setTimeout(() => {
                    ev.target.select();
                }, 1);
            });
        }
        closeModal();
    });

    document.getElementById('solcoin_reset_transfer').addEventListener('click', (ev) => {
        document.getElementById('solcoin_to').value = '';
        document.getElementById('solcoin_value').value = '';
        document.getElementById('solcoin_secretKey').value = '';
        document.getElementById('solcoin_data').value = '';
        document.getElementById('solcoin_result_transfer').innerHTML = '';
        document.getElementById('solcoin_blockhash').value = '';
    })

    document.getElementById('solcoin_dispatch_tx').addEventListener('click', async (ev) => {
        const base64SignedTx = document.getElementById('solcoin_dispatch_raw_hex').value.trim();
        if (!base64SignedTx) {
            alert('Please enter the Base64 raw code of the transaction first.');
            return;
        }
        try {
            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl(solcoin_network), "confirmed");
            const txBuffer = Buffer.Buffer.from(base64SignedTx, "base64");
            const signature = await connection.sendRawTransaction(txBuffer);
            document.getElementById('solcoin_dispatch_result').innerHTML = `Transaction has been sent, and the signed ID is: ${signature}<br>Query transaction: https://explorer.solana.com/tx/${signature}?cluster=${solcoin_network}`;
        } catch (err) {
            document.getElementById('solcoin_dispatch_result').innerHTML = `Code execution error: ${err}<br>`;
        }
        //        document.getElementById('solcoin_dispatch_result').parentNode.style.visibility = 'visible';
    })
});


function solcoin_recover_wallet() {
    let hd_wallet = {};
    hd_wallet.mnemonic = document.getElementById('solcoin_mnemonic').value.trim();
    hd_wallet.secretKey = document.getElementById('solcoin_new_secretKey').value.trim();
    //    hd_wallet.password = document.getElementById('solcoin_new_password').value.trim();

    //    var rootNode;
    if (!bip39.validateMnemonic(hd_wallet.mnemonic, solcoin_language) && hd_wallet.secretKey == '') {
        alert("Please enter at least one valid mnemonic or a valid key.");
        return;
    }
    if (hd_wallet.secretKey != '') {//从密钥恢复钱包
        //        const keypairBytes = bs58check.default.decode(hd_wallet.secretKey);
        //        const keypair = solanaWeb3.Keypair.fromSecretKey(keypairBytes);

        const keypair = solanaWeb3.Keypair.fromSecretKey(bs58check.default.decode(hd_wallet.secretKey));
        hd_wallet.address = keypair.publicKey.toBase58();//Base58编码的32字节地址
        hd_wallet.mnemonic = '';
        hd_wallet.mnemonic_passwd = '';
        hd_wallet.path = '';
    } else {//从助记词恢复钱包
        hd_wallet.path = document.getElementById('solcoin_new_path').value.trim();//格式：m/44'/501'/i'/j'，i,j=1,2,3,...
        const regex = /^m\/44'\/501'\/(\d+)'\/(\d+)'/;
        if (!regex.test(hd_wallet.path)) {
            alert("The wallet path format is incorrect!");
            return;
        }
        hd_wallet.mnemonic_passwd = document.getElementById('solcoin_password').value.trim();
        const seed = bip39.mnemonicToSeedSync(hd_wallet.mnemonic, hd_wallet.mnemonic_passwd);
        const hd = microEd25519Hdkey.HDKey.fromMasterSeed(seed.toString("hex"));//HD钱包的根节点
        const keypair = solanaWeb3.Keypair.fromSeed(hd.derive(hd_wallet.path).privateKey);
        hd_wallet.address = keypair.publicKey.toBase58();//Base58编码的32字节地址
        hd_wallet.secretKey = bs58check.default.encode(keypair.secretKey);//Base58编码的64字节密钥
    }
    document.getElementById('solcoin_hd_wallet').innerHTML = `
    Mnemonic: ${hd_wallet.mnemonic}<br>
    Mnemonic password: ${hd_wallet.mnemonic_passwd}<br>
    Security Key: ${hd_wallet.secretKey}<br>
    Address: ${hd_wallet.address}（also the public key）<br>
    Path: ${hd_wallet.path}
    `;
}