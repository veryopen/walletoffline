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
var network = bitcoin.networks.bitcoin;
var hd_more = {
    seed: '',
    rood_ext_key: '',
    accPri: '',
    accPub: ''
};
var doing = '';
const ECPair = ecpair.ECPairFactory(bitcoinerlabsecp256k1);
var outx = [];
//有等式：100000000 * fee_dallors = fee * bitcoin_rate
var fee_dollars = 1;//一笔交易费1美元
var fee = 1250;//交易手续费
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
var isTestNet_bitcoin = false;//以太币网络
var bitcoin_language = bip39.wordlists.english;
var canFetchRawTX = false;//能否获取交易的原始hex码？

var lang = 'en';

//以太坊全局变量：
var signer = null;
var provider = null;
var isTestNet_ethereum = false;//以太币网络
var ethereum_rate = 2500;//以太币兑美元汇率
var ethereum_language;//助记词所在的语言，默认是英语