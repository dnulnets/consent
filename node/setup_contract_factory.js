//
// Sets up the consent factory for use with the Permobil AB PoA test
// blockchain.
//
// It generates a consent factory contract and returns with the
// contract address to be used for consent generation and handling.
// 
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
//

if (process.argv.length != 3) {
    console.log('node setup_contract_factory.js <password to unlock coinbase>');
    return;
}
//
// Make sure we got the libraries needed and uses the correct geth node
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
// Create the contracts binary interface
//
var consentSRC = fs.readFileSync('../sol/generated/consent.json')
var consentContracts = JSON.parse(consentSRC)["contracts"];

var consentContract = web3.eth.contract (eval(consentContracts["consent.sol:Consent"].abi));
var consentBinary = "0x" + consentContracts["consent.sol:Consent"].bin;
var consentFactoryContract = web3.eth.contract (eval(consentContracts["consent.sol:ConsentFactory"].abi));
var consentFactoryBinary = "0x" + consentContracts["consent.sol:ConsentFactory"].bin;

//
// Create the initial consent factory, we assume that the coinbase and password is
// the first argument to the javascript
//
console.log ('Using account ' + web3.eth.coinbase);
try {
    web3.personal.unlockAccount(web3.eth.coinbase, process.argv[2]);
} catch (e) {
    console.log(e);
    return;
}

var consentFactory = consentFactoryContract.new ({from: web3.eth.coinbase, gas: 2000000, data: consentFactoryBinary});
console.log("Your consent factory contract is being deployed in transaction " + consentFactory.transactionHash);

//
// Wait for the transaction to finish
//
function waitForTransaction (txhash) {
    filter = web3.eth.filter('latest');
    filter.watch(function(error, result) {
	var receipt = web3.eth.getTransactionReceipt(txhash);
	if (receipt && receipt.transactionHash == txhash) {
            console.log("Your consent factory contract got address " + receipt.contractAddress);
            filter.stopWatching();
	}
    });
}

waitForTransaction (consentFactory.transactionHash);
