//
// Sets up global default variables and functions needed for this prototype
// and handles command line arguments.
//
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
//

var Web3 = require('web3');
var fs = require('fs');

//
// Make sure we got the libraries needed and uses the correct geth node
//
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider(config.web3url));
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
// Create the contracts binary interface
//
console.log ('Loading contract binaries and interface descriptions');
var consentSRC;
try {
    consentSRC = fs.readFileSync('../sol/generated/consent.json');
} catch (err) {
    console.log ('Unable to load contracts ' + err.code + ', have you run makefile in the sol directory?');
    return;
}
var consentContracts = JSON.parse(consentSRC)["contracts"];
var consentContract = web3.eth.contract (eval(consentContracts["consent.sol:Consent"].abi));
var consentBinary = "0x" + consentContracts["consent.sol:Consent"].bin;
var consentFactoryContract = web3.eth.contract (eval(consentContracts["consent.sol:ConsentFactory"].abi));
var consentFactoryBinary = "0x" + consentContracts["consent.sol:ConsentFactory"].bin;

//
// Various functions
//

//
// Initiates a mining of a new factory, returns with the transaction identity
//
function newConsentFactory (account, gas, mined)
{
    param = {from: account, gas: gas, data: consentFactoryBinary};
    return consentFactoryContract.new (param, mined);
}

function getConsentFactory (address)
{
    return consentFactoryContract.at (address);
}

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
    newConsentFactory: newConsentFactory,
    getConsentFactory: getConsentFactory
};

//
// End of file
//
