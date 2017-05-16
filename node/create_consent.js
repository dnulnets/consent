//
// Test to create a consent from the factory.
//
// It generates a consent factory contract and returns with the
// contract address to be used for consent generation and handling.
// 
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
//
if (process.argv.length != 3) {
    console.log('USAGE: node ' + process.argv[1] + ' <password to unlock coinbase>');
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
web3.eth.defaultAccount = web3.eth.coinbase;
try {
    web3.personal.unlockAccount(web3.eth.coinbase, process.argv[2]);
} catch (e) {
    console.log(e);
    return;
}

//
// Get hold of our current consent factory contract. Currently the contract address is
// hardcoded.
//

var consentFactory = consentFactoryContract.at("0x8c85fa73bb6e16a32dcf6661b7d2a976e25780ca");

//
// Catch all events
//
var event = consentFactory.allEvents(function(error, result) {
    if (!error)
        console.log(result);
    else
        console.log(error);
});

//var txhash = consentFactory.test1 ();
var txhash = consentFactory.createConsent ("0x9e4e1dc444e85336e04b6da52d9e35783682fab7","VSC");
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

//waitForTransaction(txhash);
