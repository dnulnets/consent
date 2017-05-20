//
// Sets up global default variables and functions needed for this prototype
// and handles command line arguments.
//
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
//

var Web3 = require('web3');
var fs = require('fs');

//
// The Consent Factory object
//
var ConsentFactory = function (password, account) {

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
    
}


//
// Various functions
//

//
// Saves the configuration as a JSON structure to config.json
//
ConsentFactory.prototype.saveConfiguration = function ()
{
    try {
	fs.writeFileSync('config.json', JSON.stringify(config));
    } catch (err) {
	console.log ("Unable to save configuration file " + err.code);
	return;
    }
}

//
// Set up the exporting
//

module.exports = ConsentFactory

//
// End of file
//
