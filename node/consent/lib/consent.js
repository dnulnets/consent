//
// Sets up global default variables and functions needed for this prototype
// and handles command line arguments.
//
// Copyright (c) 2017, Tomas Stenlund, All rights reserved
//

var Web3 = require('web3');
var fs = require('fs');

//
// The Consent Handler object
//
var ConsentHandler = function (password, account) {

    //
    // Get hold of the configuration
    //
    try {
	this.config = JSON.parse(fs.readFileSync('config.json'));
    } catch (err) {
	this.config = {web3url: "http://localhost:8545"};
	if (err.code != 'ENOENT') {
	    console.log ("Unable to open configuration file, regressing to default");
	} else {
	    console.log ("No configuration file found, using default");
	}
    }

    //
    // Get hold of the web3 interface
    //
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.config.web3url));

   //
    // Determine the account, use coinbase as default. Unlock it and use
    // it as default account.
    //
    this.account = this.web3.eth.coinbase;
    if (typeof this.config.account !== 'undefined')
	this.account = this.config.account;
    if (typeof account !== 'undefined')
	this.account = account;
    
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
    
    this.consentContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:Consent"].abi));
    this.consentBinary = "0x" + this.consentContracts["consent.sol:Consent"].bin;
    
    this.consentFactoryContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:ConsentFactory"].abi));
    this.consentFactoryBinary = "0x" + this.consentContracts["consent.sol:ConsentFactory"].bin;    

    this.consentFileContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:ConsentFile"].abi));
    this.consentFileBinary = "0x" + this.consentContracts["consent.sol:ConsentFile"].bin;

    //
    // Get holds of the consent factory if we have one configured, otherwise faile
    //
    if (typeof this.config.consentFactory !== 'undefined') {
	console.log ("Using configured consent factory at " + this.config.consentFactory);
	this.consentFactory = this.consentFactoryContract.at (this.config.consentFactory);
    } else {
	console.log ("No consent factory configured, run the setup script to generate a factory.");
    }

}

//
// Various functions
//

//
// Creates a new account and creates a new 
//
ConsentHandler.prototype.newAccount = function (password)
{
    var account = this.web3.personal.newAccount (password);
    console.log ("New account = " + account);
    return account;
}

//
// Saves the configuration as a JSON structure to config.json
//
ConsentHandler.prototype.saveConfiguration = function ()
{
    try {
	fs.writeFileSync('config.json', JSON.stringify(this.config));
    } catch (err) {
	console.log ("Unable to save configuration file " + err.code);
	return;
    }
}

//
// Initiates a mining of a new factory, returns with the transaction identity
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
// Add new templates to the factory
//
ConsentHandler.prototype.addConsentTemplate = function (purpouse, version, title, text, languageCountry, mined)
{
    return this.consentFactory.addConsentTemplate (purpouse, version, title, text, languageCountry, mined);
}

//
// Add an event listener to the consent factory
//
ConsentHandler.prototype.allEventsHandler = function (mined)

{
    this.consentFactory.allEvents (mined);
}

//
// Create a new consent file
//
ConsentHandler.prototype.createConsentFile = function (_user)
{
    return this.consentFactory.createConsentFile.sendTransaction (_user, {from: this.account, gas:4000000});
}

//
// Set up the exporting
//

module.exports = ConsentHandler

//
// End of file
//
