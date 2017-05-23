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

//
// Check arguments
//
if (process.argv.length < 3 || process.argv.length > 4) {
    console.log('node ' + process.arg[1]+' <password to unlock account> [account]');
    return;
}

//
// Create the new consent factory
//
if (process.argv.length == 3)
    consentHandler = new ConsentHandler (process.argv[2]);
else
    consentHandler = new ConsentHandler (process.argv[2], process.argv[3]);

//
// Define some functions to be used
//
function contractMined (error,result)
{
    if (!error) {
	if (result.address!=undefined) {
            console.log("Your consent factory contract is mined and got address " + result.address);
	    addSomeConsentTemplates(result.address);
	}
    } else {
	console.log (error);
    }
}

function newTemplatesMined (error,result)
{
    if (!error) {
	console.log ("Transaction = " + result);
    } else {
	console.log ("Transaction failed");
	console.log (err);
    }
}

function addSomeConsentTemplates (factory)
{
    consentHandler.setConsentFactoryAddress (factory);
    consentHandler.config.consentFactory = factory;
    consentHandler.saveConfiguration();
    console.log("The configuration file config.json has been updated with the new factory address");
    console.log ("Adding some consent templates for testing purpouses");
    consentHandler.addConsentTemplate ("VSCRAD", 1, "Product research", "Permobil is conducting a data analysis that we want your consent to perform. It will help us in our product development.", "sv-SE", newTemplatesMined);
    consentHandler.addConsentTemplate ("VSCRAD", 1, "Product research", "Permobil is conducting a data analysis that we want your consent to perform. It will help us in our product development.", "SE", newTemplatesMined);
}

// Create the factory for the consents
//
console.log ("Creating a new consent factory");
consentHandler.newConsentFactory (contractMined);
