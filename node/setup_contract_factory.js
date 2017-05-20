//
// Sets up the consent factory for use with the Permobil AB PoA test
// blockchain.
//
// It generates a consent factory contract and returns with the
// contract address to be used for consent generation and handling.
// 
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
//

var ConsentFactory = require ('./consentfactory.js');

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
    consent = new ConsentFactory (process.argv[2]);
else
    consent = new ConsentFactory (process.argv[2], process.argv[3]);


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
    }
}

function newTemplatesMined (error,result)
{
    if (!error) {
	console.log ("Your new consent templates got sent as a transaction");
	console.log (result);
    } else {
	console.log ("Your new consent templates was not able to be sent");
	console.log (err);
    }
}

function addSomeConsentTemplates (factory)
{
    consentFactory = init.getConsentFactory (factory);
    console.log ("Adding some consent templates");
    consentFactory.addConsentTemplate ("VSCRAD", 1, "Product research", "Permobil is conducting a data analysis...", "sv-SE", newTemplatesMined);
    consentFactory.addConsentTemplate ("VSCRAD", 1, "Product research", "Permobil is conducting a data analysis...", "SE", newTemplatesMined);
}

// Create the factory for the consents
//
//console.log ("Creating a new consent factory");
//init.newConsentFactory (init.config.account, 2000000, contractMined);

