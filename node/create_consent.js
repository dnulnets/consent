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
var consentManagementProxy = web3.eth.contract (eval(consentManagementContracts["consentmanagement.sol:ConsentManagement"].abi));

web3.personal.unlockAccount(web3.eth.coinbase, "mandelmassa");
web3.eth.defaultAccount = web3.eth.coinbase;

//
// Get hold of our current consent management contract
//
// 0x6d9392b122222dd2e1f9ff8d2bcb89e052ef930f
//

var consentManagement = consentManagementProxy.at("0x6d9392b122222dd2e1f9ff8d2bcb89e052ef930f");

var event = consentManagement.ConsentCreateEvent({}, function(error, result) {
    if (!error)
        console.log(result.args);
    else
        console.log(error);
});

var txhash = consentManagement.createConsent ("0x9e4e1dc444e85336e04b6da52d9e35783682fab7", "Product development");
console.log("Your consent contract creation is being deployed in transaction " + txhash);

function waitForTransaction (txhash) {
    filter = web3.eth.filter('latest');
    filter.watch(function(error, result) {
	var receipt = web3.eth.getTransactionReceipt(txhash);
	if (receipt && receipt.transactionHash == txhash) {
            console.log("Your consent contract creation has finished");
	    console.log(receipt);
            filter.stopWatching();
	}
    });
}

waitForTransaction(txhash);
