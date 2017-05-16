//
// Make sure we got the libraries needed
//
var Web3 = require('web3');
var fs = require('fs');
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

//
// Create the contracts proxies and the initial managament contract
//
var consentSRC = fs.readFileSync('../sol/generated/consent.json')
var consentManagementSRC = fs.readFileSync('../sol/generated/consentmanagement.json')

var consentContracts = JSON.parse(consentSRC)["contracts"];
var consentManagementContracts = JSON.parse(consentManagementSRC)["contracts"];

var consentProxy = web3.eth.contract (eval(consentContracts["consent.sol:Consent"].abi));
var consentBinary = consentContracts["consent.sol:Consent"].bin;
var consentManagementProxy = web3.eth.contract (eval(consentManagementContracts["consentmanagement.sol:ConsentManagement"].abi));
var consentManagementBinary = "0x"+consentManagementContracts["consentmanagement.sol:ConsentManagement"].bin;

web3.personal.unlockAccount(web3.eth.coinbase, "mandelmassa");
var consentManagement = consentManagementProxy.new ({from: web3.eth.coinbase, gas: 2000000, data: consentManagementBinary});
console.log("Your consent management contract is being deployed in transaction " + consentManagement.transactionHash);

function waitForTransaction (txhash) {
    filter = web3.eth.filter('latest');
    filter.watch(function(error, result) {
	var receipt = web3.eth.getTransactionReceipt(txhash);
	if (receipt && receipt.transactionHash == txhash) {
            console.log("Your consent management contract got address " + receipt.contractAddress);
            filter.stopWatching();
	}
    });
}

waitForTransaction (consentManagement.transactionHash);
