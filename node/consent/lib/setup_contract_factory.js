//
// Sets up the consent factory for use with the Permobil AB PoA test
// blockchain.
//
// It generates a consent factory contract and returns with the
// contract address to be used for consent generation and handling.
// 
// Copyright (c) 2017, Tomas Stenlund, All rights reserved
//

var ConsentHandler = require ('./consent.js');
var util = require ('util');

//
// Check arguments
//
if (process.argv.length < 4 || process.argv.length > 5) {
    console.log('node ' + process.argv[1]+' <blockchain url> <password to unlock account> [account]');
    return;
}

//
// Create the new consent factory
//
if (process.argv.length == 3)
    consentHandler = new ConsentHandler (process.argv[2], undefined, process.argv[3]);
else
    consentHandler = new ConsentHandler (process.argv[2], undefined, process.argv[3], process.argv[4]);

//
// Define some functions to be used
//
function contractMined (error,result)
{
    if (!error) {
	if (result.address!=undefined) {
            console.log("Setup: Your consent factory contract is mined and got address " + result.address);
            console.log("Setup: Make sure you update consentFactory field in config.json");
	    addSomeConsentTemplates(result.address);
	}
    } else {
	console.log ("Setup: Mining error = " + error);
	throw "Setup: Mining error";
    }
}

function addSomeConsentTemplates (factory)
{
    consentHandler.setConsentFactoryAddress (factory);
    console.log ("Setup: Adding some consent templates for testing purpouses");
    console.log("Setup: txhash = " + consentHandler.addConsentTemplate ("VSCRAD", 1, "Product research", "Permobil is conducting a data analysis that we want your consent to perform. It will help us in our product development.", "sv-SE"));
    console.log("Setup: txhash = " + consentHandler.addConsentTemplate ("VSCRAD", 1, "Product research", "Permobil is conducting a data analysis that we want your consent to perform. It will help us in our product development.", "SE"));
}

// Create the factory for the consents
//
console.log ("Setup: Creating a new consent factory");
consentHandler.newConsentFactory (contractMined);
