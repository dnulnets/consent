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

var ConsentHandler = require ('./consent_handler.js');
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
	    rcpt = consentHandler.web3.eth.getTransactionReceipt (result.transactionHash);
	    console.log("Setup: Gas used for contract mining = " + rcpt.gasUsed);
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
    txhash1 = consentHandler.addConsentTemplate ("VSCRAD", 1, "Product development",
						 "Xxxxx AB wants to record information from your usage of the yyyyyy to perform analysis to get a better understanding of our products to use for improvements and development of new products. The information used in the analysis cannot be traced back to you.", "en-SE");
    txhash2 = consentHandler.addConsentTemplate ("VSCRAD", 1, "Produktutveckling",
						 "Xxxxx AB vill samla på sig information om hur du använder din yyyyy för att kunna göra analyser så vi har bättre underlag för att kunna förbättra och utveckla våra produkter. Informationen som används till analysen kan inte spåras tillbaka till dig som person.", "SE");
    console.log ("Setup: Example Consent template 1 txhash = " + txhash1);
    console.log ("Setup: Example Consent template 2 txhash = " + txhash2);
    console.log ("Setup: Waiting for transactions to finish");
    consentHandler.awaitBlockConsensus ([consentHandler.web3], txhash1, 0, 60, function (err, rcpt)
					{
					    if (err)
						console.log ("Setup: Consent Template 1 = " + util.inspect(err));
					    else
						console.log ("Setup: Transactions finished for Consent Template 1, gas used = " + rcpt.gasUsed);
					}); 
    consentHandler.awaitBlockConsensus ([consentHandler.web3], txhash2, 0, 60, function (err, rcpt)
					{
					    if (err)
						console.log ("Setup: Consent Template 2 = " + util.inspect(err));
					    else
						console.log ("Setup: Transactions finished for Consent Template 2, gas used = " + rcpt.gasUsed);
					}); 
}

// Create the factory for the consents
//
console.log ("Setup: Creating a new consent factory");
consentHandler.newConsentFactory ("Permobil AB", consentHandler.account, contractMined);
