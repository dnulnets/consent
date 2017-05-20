//
// Sets up global default variables and functions needed for this prototype
// and handles command line arguments.
//
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
//

var Web3 = require('web3');
var fs = require('fs');

//
// Check arguments
//
if (process.argv.length < 3 || process.argv.length > 4) {
    console.log('node ' + process.arg[1]+' <password to unlock account> [account]');
    return;
}

//
// The Permobil object
//
Permobil = function (account, password) {

    //
    // Get hold of the configuration
    //
    this.config = {web3url: "http://localhost:8545"};
    try {
	config = JSON.parse(fs.readFileSync('config.json'));
    } catch (err) {
	if (err.code != 'ENOENT') {
	    console.log ("Unable to open configuration file, regressing to default");
	    return;
	}
    }

    //
    // Get hold of the web3 interface
    //
    if (typeof this.web3 !== 'undefined') {
	this.web3 = new Web3(web3.currentProvider);
    } else {
	// set the provider you want from Web3.providers
	this.web3 = new Web3(new Web3.providers.HttpProvider(config.web3url));
    }

    
}
//
// Determine the account, use coinbase as default and unlock it
//
if (process.argv.length == 4) {
    config.account = process.argv[3];
} else {
    config.account = web3.eth.coinbase;
}
console.log ('Using account ' + config.account);
web3.eth.defaultAccount = config.account;
console.log ('Unlocking account ' + config.account);
try {
    web3.personal.unlockAccount(config.account, process.argv[2]);
} catch (e) {
    console.log(e);
    return;
}

//
// Various functions
//

//
// Saves the configuration as a JSON structure to config.json
//
function saveConfiguration ()
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

module.exports = {
    config: config,
    saveConfiguration: saveConfiguration,
    web3: web3
};

//
// End of file
//
