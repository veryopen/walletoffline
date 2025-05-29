//Global parametes for Bitcoin：
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
//Equal：100000000 * fee_dallors = fee * bitcoin_rate
var fee_dollars = 1;//The fee in dollars of a Transaction
var fee = 1250;//fee in 
var bitcoin_rate = 100000;//the rate to dollars

var psbt = null;
var psbt_bak = null;
var sign_index = 0;
const toXOnly = pubKey => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));
const validator = (pubkey, msghash, signature) => ECPair.fromPublicKey(pubkey).verify(msghash, signature);
const validator_schnorr = (pubkey, msghash, signature) => bitcoinerlabsecp256k1.verifySchnorr(msghash, pubkey, signature);
var binaryTree = new BinaryTree('');
var leaf_scripts = [];
const leafVersion = 0xc0;
var cryptoType = 0;//0-Bitcoin,60-Ethereum。
var isTestNet_bitcoin = false;//Is test network?
var bitcoin_language = bip39.wordlists.english;
var canFetchRawTX = false;//Can get the Hex-encoded raw representation of transaction

//Global Parameters for Ethereum：
var signer = null;
var provider = null;
var isTestNet_ethereum = false;//Is test network?
var ethereum_rate = 2500;//the rate to dollars
var ethereum_language;//The language for mnemonic