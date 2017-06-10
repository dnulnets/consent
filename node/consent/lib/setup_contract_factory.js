//
// Sets up the consent factory for use with the Permobil AB PoA test
// blockchain.
//
// It generates a consent factory contract and returns with the
// contract address to be used for consent generation and handling.
// 
// Copyright 2017 Tomas Stenlund, tomas.stenlund@telia.com
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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
    console.log("Setup: txhash = " + consentHandler.addConsentTemplate ("VSCRAD", 1, "Product development",
									"Xxxxx AB wants to record information from your usage of the yyyyyy to perform analysis to get a better understanding of our products to use for improvements and development of new products. The information used in the analysis cannot be traced back to you.", "en-SE"));
    console.log("Setup: txhash = " + consentHandler.addConsentTemplate ("VSCRAD", 1, "Produktutveckling",
									"Xxxxx AB vill samla på sig information om hur du använder din yyyyy för att kunna göra analyser så vi har bättre underlag för att kunna förbättra och utveckla våra produkter. Informationen som används till analysen kan inte spåras tillbaka till dig som person.", "SE"));
}

// Create the factory for the consents
//
console.log ("Setup: Creating a new consent factory");
consentHandler.newConsentFactory (contractMined);
