//
// Sets up global default variables and functions needed for this
// consent handling prototype on node.js
//
// Copyright (c) 2017, Tomas Stenlund, All rights reserved
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
    console.log ('Using account ' + this.account);
    this.web3.eth.defaultAccount = this.account;
    console.log ('Unlocking account ' + this.account);
    try {
	this.web3.personal.unlockAccount(this.account, password);
    } catch (e) {
	console.log(e);
	return;
    }

    //
    // Create the contracts binary interface
    //
    console.log ('Loading contract binaries and interface descriptions');
    var consentSRC;
    try {
	consentSRC = fs.readFileSync('../../sol/generated/consent.json');
    } catch (err) {
	console.log ('Unable to load contracts ' + err.code + ', have you run makefile in the sol directory?');
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
	console.log ("Using consent factory at " + consentFactory);
	this.consentFactory = this.consentFactoryContract.at (consentFactory);
    } else {
	console.log ("Mising ConsentFactory address, you need to specify it outside ConsentHandler using setConsentFactoryAdress");
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
    console.log ("New account = " + account);
    return account;
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
// Set up the export of the ConsentHandler
//

module.exports = ConsentHandler

//
// End of file
//
