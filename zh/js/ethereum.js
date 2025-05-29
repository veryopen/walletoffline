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
        openModal('请稍后，正在处理…');
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
        openModal('请稍后，正在处理…');
        ethereum_recover_wallet();
        closeModal();
    });

    document.getElementById('ethereum_wallet_balance_btn').addEventListener('click', (evt) => {
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
            openModal('请稍后，正在获取…');
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

    document.getElementById('ethereum_fee').addEventListener('blur', (evt) => {
        document.getElementById('ethereum_priority_fee').value = (parseFloat(evt.target.value.trim()) * 0.99).toFixed(2);
    })

    document.getElementById('ethereum_priority_fee').addEventListener("blur", (evt) => {
        let fee = parseFloat(document.getElementById('ethereum_fee').value.trim());
        if (parseFloat(evt.target.value.trim()) > fee) {
            alert("小费不能大于交易费用！");
        }
    })

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
        openModal('请稍后，正在处理…');
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
            chainId: isTestNet_ethereum ? 11155111 : 1 //主网1，Sepolia测试网11155111
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
        //        openModal('请稍后，正在转账…');
        let txHex = '';
        wallet.signTransaction(tx).then((hex) => {
            txHex = hex;
        });
        let result = document.getElementById('ethereum_result_transfer');
        wallet.sendTransaction(tx).then((transaction) => {
            result.innerHTML = `交易已发送，交易ID: ${transaction.hash}<br>正在等待确认…<br>${txHex}<br>`;
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
            result.innerHTML = `网络异常！请把下面的HEX格式的交易拷贝到第三方网站上去发布。<br><br>${txHex}<br><br>发布交易的第三方网站：<br>https://etherscan.io/pushTx`;
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
            alert("交易Hex原始码不能为空！");
            return;
        }
        if (provider != '') {
            openModal('请稍后，正在发布…');
            document.getElementById('ethereum_dispatch_result').parentNode.style.visibility = 'visible';
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
    })

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
                    alert('你输入的字不在助记词集合中，请重新输入！');
                } else {
                    evt.target.style.borderColor = '';
                    evt.target.classList.add('customize');
                }
            }
        })
    })

    document.getElementById('mnemonic_customize_btn').addEventListener('click', (evt) => {
        const count = parseInt(document.getElementById('customize_mnemonic_length').value);
        const entropy = new Uint8Array(count * 4 / 3);                                                            //16,20,24,28或者32
        crypto.getRandomValues(entropy);
        const entropyBits = entropy.reduce(
            (acc, byte) => acc + byte.toString(2).padStart(8, '0'), ''
        );
        let chunks = entropyBits.match(/.{1,11}/g) || []; //按11位长度拆分成数组
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
        document.getElementById('mnemonic_customize_result').innerHTML = `产生的助记词是：${mnemonic}`;
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

    document.getElementById('generate_qrcode_btn').addEventListener('click', (evt) => {
        let content = document.getElementById('qrcode_content').value.trim();
        if (content == '') {
            alert('内容不能为空！');
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
            alert('内容提多了：'+err);
        }
    })

    document.getElementById('qrcode_reset').addEventListener('click', (evt) => {
        document.getElementById("qrcode").innerHTML = '<div style="width: 256px; height: 256px; border: 1px dotted black; line-height: 256px; color: gray;">二维码</div>';
        document.getElementById('qrcode_content').value = '';
        document.getElementById('qrcode_title_dis').innerHTML = '标题';
        document.getElementById('qrcode_tail_dis').innerHTML = '尾部';
        document.getElementById('qrcode_title').value = '';
    })
    document.getElementById('customize_new_language').addEventListener('change', (evt) => {
        document.getElementById('ethereum_new_language').value = evt.target.value;
        document.getElementById('ethereum_new_language').dispatchEvent(new Event('change'));
        document.getElementById('mnemonic_customize_reset').dispatchEvent(new Event('click'));
    })

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
        const network = isTestNet_ethereum ? "sepolia" : "homestead";

        /* 产生供体的三种方法 */
        //方法1：
        provider = ethers.getDefaultProvider(network);

        //方法2：
        //provider = ethers.getDefaultProvider(network, {
        //    etherscan: "NCGAQ33ESD34Y343Z4HHZHMT9D4DBFA9HK"
        //});

        //方法3：
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
