//
// Creates a ConsentHandler object that work with one geth node.
//
// Copyright 2017 Tomas Stenlund
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

var Web3 = require('web3');
var fs = require('fs');

//
// The Consent Handler object
//
var ConsentHandler = function (web3url, consentFactory, password, account) {

    //
    // Get hold of the web3 interface
    //
    this.web3 = new Web3(new Web3.providers.HttpProvider(web3url));

    //
    // Determine the account, use coinbase as default. Unlock it and use
    // it as default account.
    //
    this.account = account || this.web3.eth.coinbase;    
    console.log ('ConsentHandler: Using account ' + this.account);
    this.web3.eth.defaultAccount = this.account;
    console.log ('ConsentHandler: Unlocking account ' + this.account);
    try {
	this.web3.personal.unlockAccount(this.account, password);
    } catch (e) {
	console.log("ConsentHandler: Unable to unlock account = " + e);
	throw "ConsentHandler: Unable to unlock account";
    }

    //
    // Create the contracts binary interface
    //
    console.log ('ConsentHandler: Loading contract binaries and interface descriptions');
    var consentSRC;
    try {
	consentSRC = fs.readFileSync('../../sol/generated/consent.json');
    } catch (err) {
	console.log ('ConsentHandler: Unable to load contracts ' + err.code + ', have you run makefile in the sol directory?');
	return;
    }
    this.consentContracts = JSON.parse(consentSRC)["contracts"];
    
    this.consentTemplateContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:ConsentTemplate"].abi));
    this.consentTemplateBinary = "0x" + this.consentContracts["consent.sol:ConsentTemplate"].bin;
    
    this.consentContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:Consent"].abi));
    this.consentBinary = "0x" + this.consentContracts["consent.sol:Consent"].bin;
    
    this.consentFactoryContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:ConsentFactory"].abi));
    this.consentFactoryBinary = "0x" + this.consentContracts["consent.sol:ConsentFactory"].bin;    

    this.consentFileContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:ConsentFile"].abi));
    this.consentFileBinary = "0x" + this.consentContracts["consent.sol:ConsentFile"].bin;

    //
    // Get holds of the consent factory if we have one configured, otherwise log it
    // and ask the user to runt the setup script.
    //
    if (consentFactory !== 'undefined') {
	console.log ("ConsentHandler: Using consent factory at " + consentFactory);
	this.consentFactory = this.consentFactoryContract.at (consentFactory);
	this.factory = consentFactory;
    } else {
	console.log ("ConsentHandler: Mising ConsentFactory address, you need to specify it outside ConsentHandler using setConsentFactoryAdress");
    }
}

//
// Various functions
//

//
// Creates a new account, use the supplied password as the secret
//
ConsentHandler.prototype.newAccount = function (password)
{
    var account = this.web3.personal.newAccount (password);
    console.log ("ConsentHandler: New account created = " + account);
    var tx = this.web3.eth.sendTransaction({from: this.account, to: account, value: this.web3.toWei('1', 'ether')});
    console.log ("ConsentHandler: Sending ether to the new account ");
    return account;
}

//
// Creates a new account, use the supplied password as the secret
//
ConsentHandler.prototype.unlockAccount = function (coinbase, password)
{
    return this.web3.personal.unlockAccount (coinbase, password);
}

//
// Initiates a mining of a new consent factory, returns with the transaction
// identity. This will also generate an event when the mining is finished.
//
// See consent.sol for details.
//
ConsentHandler.prototype.newConsentFactory = function(mined)
{
    var param = {from: this.account, gas: 4000000, data: this.consentFactoryBinary};
    return this.consentFactoryContract.new (param, mined);
}

//
// Sets the factory after construction
//
ConsentHandler.prototype.setConsentFactoryAddress = function (address)
{
    this.consentFactory = this.consentFactoryContract.at (address);
}

//
// Add new templates to the factory. It will return with the transaction
// hash and the ConsentFactory contract  will later fire an event when the
// mining is finished.
//
// See consent.sol for details.
//
ConsentHandler.prototype.addConsentTemplate = function (purpouse, version, title, text, languageCountry)
{
    return this.consentFactory.addConsentTemplate.sendTransaction (purpouse, version, title,
								   text, languageCountry,
								   {from: this.account, gas: 4000000});
}

//
// Create a consent and add it to the users consent file. This function will
// return with the transaction hash. The ConsentFactory will send an event when
// the mining is finished.
//
// See consent.sol for details.
//
ConsentHandler.prototype.createConsent = function (file, purpouse, languageCountry)
{
    return this.consentFactory.createConsent.sendTransaction (file, purpouse, languageCountry, {from: this.account, gas: 8000000});
}

//
// Add an event listener to the ConsentFactory contract. This will get called
// for all events.
//
// See consent.sol for details.
//
ConsentHandler.prototype.allEventsHandler = function (mined)

{
    this.consentFactory.allEvents (mined);
}

//
// Create a new consent file for a specific user. The user has to be the accound id
// on the blockchain. It will return with the transaction hash. An event will be fired
// when the mining is finished.
//
// See consent.sol for details.
//
ConsentHandler.prototype.createConsentFile = function (_user)
{
    return this.consentFactory.createConsentFile.sendTransaction (_user, {from: this.account, gas:4000000});
}

//
// Found on https://ethereum.stackexchange.com/questions/1187/how-can-a-dapp-detect-a-fork-or-chain-reorganization-using-web3-js-or-additional
//
ConsentHandler.prototype.awaitBlockConsensus = function(web3s, txhash, blockCount, timeout, callback)
{   
    var txWeb3 = web3s[0];
    var startBlock = Number.MAX_SAFE_INTEGER;
    var interval;
    var stateEnum = { start: 1, mined: 2, awaited: 3, confirmed: 4, unconfirmed: 5 };
    var savedTxInfo;
    var attempts = 0;

    var pollState = stateEnum.start;
    
    var poll = function() {
	if (pollState === stateEnum.start) {
	    txWeb3.eth.getTransaction(txhash, function(e, txInfo) {
		if (e || txInfo == null) {
		    return; // XXX silently drop errors
		}
		if (txInfo.blockHash != null) {
		    startBlock = txInfo.blockNumber;
		    savedTxInfo = txInfo;
		    console.log("ConsentHandler: Mined");
		    pollState = stateEnum.mined;
		}
	    });
	}
	else if (pollState == stateEnum.mined) {
            txWeb3.eth.getBlockNumber(function (e, blockNum) {
		if (e) {
		    return; // XXX silently drop errors
		}
		console.log("ConsentHandler: BlockNum: ", blockNum);
		if (blockNum >= (blockCount + startBlock)) {
		    pollState = stateEnum.awaited;
		}
            });
	}
	else if (pollState == stateEnum.awaited) {
            txWeb3.eth.getTransactionReceipt(txhash, function(e, receipt) {
		if (e || receipt == null) {
		    return; // XXX silently drop errors.  TBD callback error?
		}
		// confirm we didn't run out of gas
		// XXX this is where we should be checking a plurality of nodes.  TBD
		clearInterval(interval);
		if (receipt.gasUsed >= savedTxInfo.gas) {
		    pollState = stateEnum.unconfirmed;
		    callback(new Error("we ran out of gas, not confirmed!"), null);
		} else {
		    pollState = stateEnum.confirmed;
		    callback(null, receipt);
		}
	    });
	} else {
	    throw(new Error("We should never get here, illegal state: " + pollState));
	}
	
	// note assuming poll interval is 1 second
	attempts++;
	if (attempts > timeout) {
	    clearInterval(interval);
	    pollState = stateEnum.unconfirmed;
	    callback(new Error("Timed out, not confirmed"), null);
	}
    };
    
    interval = setInterval(poll, 1000);
    poll();
};

//
// Set up the export of the ConsentHandler
//

module.exports = ConsentHandler

//
// End of file
//
