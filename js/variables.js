//比特币全局变量：
var account_ext_privatekey = '';
var rootNode;
var wallets = {
    mnemonic: '',
    mnemonic_length: 24,
    seed_password: '',
    path: "m/84'/0'/0'/0/0"
};
var alarm_str = '';
var bitcoin_network = bitcoin.networks.bitcoin;
var hd_more = {
    seed: '',
    rood_ext_key: '',
    accPri: '',
    accPub: ''
};
var doing = '';
const ECPair = ecpair.ECPairFactory(bitcoinerlabsecp256k1);
var outx = [];
//有等式：100000000 * bitcoin_fee_dollars = bitcoin_fee_satoshi * bitcoin_rate
var bitcoin_fee_dollars = 1;//一笔交易费1美元
var bitcoin_fee_satoshi = 1250;//交易手续费
var bitcoin_rate = 100000;//1个比特币可兑换美元

var psbt = null;
var psbt_bak = null;
var sign_index = 0;
const toXOnly = pubKey => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));
const validator = (pubkey, msghash, signature) => ECPair.fromPublicKey(pubkey).verify(msghash, signature);
const validator_schnorr = (pubkey, msghash, signature) => bitcoinerlabsecp256k1.verifySchnorr(msghash, pubkey, signature);
var binaryTree = new BinaryTree('');
var leaf_scripts = [];
const leafVersion = 0xc0;
var cryptoType = 0;//0-比特币,60-以太币。
var bitcoin_isTestNet = false;//以太币网络
var bitcoin_language = bip39.wordlists.english;
var canFetchRawTX = false;//能否获取交易的原始hex码？

var lang = 'en';//页面语言

//以太坊全局变量：
var signer = null;
var provider = null;
var ethereum_isTestNet = false;//以太币网络
var ethereum_rate = 4500;//以太币兑美元汇率
var ethereum_language = ethers.wordlists.en;//助记词所在的语言，默认是英语
var ethereum_fee_dollars = 0.1;//一笔交易费（单位美元）
var ethereum_fee_wei = 10 ** 18 / ethereum_rate * ethereum_fee_dollars;//交易手续费（单位wei）
var ethereum_network = 'mainnet';


//莱特币全局变量
const litecoinMainnet = {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: { public: 0x019da462, private: 0x019d9cfe },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0
};

const litecoinTestnet = {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'tltc',
    bip32: { public: 0x043587cf, private: 0x04358394 },
    pubKeyHash: 0x6f,
    scriptHash: 0x3a,
    wif: 0xef
};

var litecoin_network = litecoinMainnet;
var litecoin_rate = 100;
var litecoin_fee_dollars = 0.01;//一笔交易费0.01美元
var litecoin_fee_litoshi = 10000;//交易手续费
var litecoin_language = bip39.wordlists.english;

//索拉纳全局变量
var solcoin_rate = 200;
var solcoin_fee_dollars = 0.01;//一笔交易费0.01美元（单位美元）
var solcoin_fee_lamports = 5000;//交易手续费（单位lamports），1 SOL = 10^9 lamports。
var solcoin_language = bip39.wordlists.english;
var solcoin_network = 'mainnet-beta';//mainnet-beta:'https://api.mainnet-beta.solana.com'，devnet:'https://api.devnet.solana.com'，testnet:'https://api.testnet.solana.com'
var isTestNet_solcoin = false;

//狗狗币全局变量
const dogecoinMainnet = {
    messagePrefix: '\\x19Dogecoin Signed Message:\\n',
    bech32: '', // 狗狗币不使用Bech32地址
    bip32: {
        public: 0x02fac398, // dpub
        private: 0x02fac398, // dprv
    },
    pubKeyHash: 0x1e, // 地址以 'D' 开头
    scriptHash: 0x16, // 地址以 'A' 开头
    wif: 0x9e, // 钱包导入格式前缀
};

const dogecoinTestnet = {
    messagePrefix: '\\x19Dogecoin Signed Message:\\n',
    bech32: '',
    bip32: {
        public: 0x043587cf, // tpub
        private: 0x04358394, // tprv
    },
    pubKeyHash: 0x71, // 地址以 'n' 或 'm' 开头
    scriptHash: 0xc4, // 地址以 '2' 开头
    wif: 0xf1
};

var dogecoin_network = dogecoinMainnet;
var dogecoin_rate = 0.3;
var dogecoin_fee_dollars = 0.01;//一笔交易费0.01美元
var dogecoin_fee_litoshi = 10000;//交易手续费
var dogecoin_language = bip39.wordlists.english;