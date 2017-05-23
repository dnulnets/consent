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
var txhash = consentHandler.createConsentFile ("0x9e4e1dc444e85336e04b6da52d9e35783682fab7");
console.log("Your consent file contract creation is being deployed in transaction " + txhash);
