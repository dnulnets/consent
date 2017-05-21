//
// Sets up global default variables and functions needed for this prototype
// and handles command line arguments.
//
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
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
    this.config = {web3url: "http://localhost:8545"};
    try {
	config = JSON.parse(fs.readFileSync('config.json'));
    } catch (err) {
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
	consentSRC = fs.readFileSync('../../../sol/generated/consent.json');
    } catch (err) {
	console.log ('Unable to load contracts ' + err.code + ', have you run makefile in the sol directory?');
	return;
    }
    this.consentContracts = JSON.parse(consentSRC)["contracts"];
    this.consentContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:Consent"].abi));
    this.consentBinary = "0x" + this.consentContracts["consent.sol:Consent"].bin;
    this.consentFactoryContract = this.web3.eth.contract (eval(this.consentContracts["consent.sol:ConsentFactory"].abi));
    this.consentFactoryBinary = "0x" + this.consentContracts["consent.sol:ConsentFactory"].bin;    
}

//
// Various functions
//

//
// Saves the configuration as a JSON structure to config.json
//
ConsentHandler.prototype.saveConfiguration = function ()
{
    try {
	fs.writeFileSync('config.json', JSON.stringify(config));
    } catch (err) {
	console.log ("Unable to save configuration file " + err.code);
	return;
    }
}

//
// Initiates a mining of a new factory, returns with the transaction identity
//
ConsentHandler.prototype.newConsentFactory = function(gas, mined)
{
    var param = {from: this.account, gas: gas, data: this.consentFactoryBinary};
    return this.consentFactoryContract.new (param, mined);
}

//
// Get a consent factory that is already in the blockchain
//
ConsentHandler.prototype.getConsentFactory = function (address)
{
    return (new ConsentFactory (address));
}

//
// The ConsentFactory class
//
var ConsentFactory = function (address)
{
    this.consentFactory = consentFactoryContract.at (address);
}

//
// Add new templates to the factory
//
ConsentFactory.prototype.addConsentTemplate = function (purpouse, version, title, text, languageCountry, mined)
{
    return this.consentFactory.addConsentTemplate (purpouse, version, title, text, languageCountry, mined);
}

//
// Set up the exporting
//

module.exports = ConsentHandler

//
// End of file
//
