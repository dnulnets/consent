//
// Test to create a consent from the factory.
//
// It generates a consent factory contract and returns with the
// contract address to be used for consent generation and handling.
// 
// Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
//

var ConsentHandler = require ('./consent.js');

//
// Check arguments
//
if (process.argv.length < 4 || process.argv.length > 5) {
    console.log('node ' + process.arg[1]+' <user> <password to unlock account> [account]');
    return;
}

//
// Create the new consent factory
//
if (process.argv.length == 4)
    consentHandler = new ConsentHandler (process.argv[3]);
else
    consentHandler = new ConsentHandler (process.argv[3], process.argv[4]);

//
// Catch the consent file creation event
//
var event = consentHandler.allEventsHandler (function (err,res) {
    if (!err)
        console.log(res);
    else
        console.log(err);
});

//
// Create a file
//
var txhash = consentHandler.createConsentFile (process.argv[2]);
console.log("Your consent file contract creation for user " + process.argv[2] + " is being deployed");

