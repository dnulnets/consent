//
// Consent handling routes.
//
// This file contains the express application routes to demonstrate consent
// handling.
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

var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
const util = require('util');

//
// Status for the consent to use as text for messages and buttons.
//
var statusString = ["Denied","Accepted","Requested","","Cancelled"];
var statusActionString = ["deny", "accept", "request", "cancel"];

//
// Check if the user is logged in and is a user
//
function loggedInUser(req, res, next) {
    if (req.user) {
	if (req.user.role === 'user')
            next();
	else
	    res.redirect('/unauthorized');
    } else {
        res.redirect('/login');
    }
}

//
// Check if the user is logged in an is an administrator
//
function loggedInAdmin(req, res, next) {
    if (req.user) {
	if (req.user.role === "admin")
            next();
	else
	    res.redirect('/unauthorized');
    } else {
        res.redirect('/login');
    }
}

//
// Root page
//
router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

//
// Unauthorized page
//
router.get('/unauthorized', function (req, res) {
    var backURL=req.header('Referer') || '/';    
    res.render('unauthorized', {backURL : backURL});
});


//
// Provides a list of consents for a specific user. The user has to be logged in.
//
router.get ('/list', loggedInUser, function (req, res) {
    
    var listOfConsents = [];
    
    //
    // get hold of the consent file for the user
    //    
    var user = req.user;
    if (typeof user.consents !== 'undefined' && user.consents) {
	var consentFile = consentHandler.contract.ConsentFile.at(user.consents);
	var list = consentFile.getListOfConsents();
	var len = list.length;
	for(i=0; i<len; i++) {
	    var consent = consentHandler.contract.Consent.at(list[i]);
	    var id = consent.getTemplate();
	    var consentTemplate = consentHandler.contract.ConsentTemplate.at(id);	    
	    var item = {id: list[i], title: consentTemplate.getTitle(),
			version: consentTemplate.getVersion().toNumber(),
			status: statusString[consent.getStatus().toNumber()],
		        company: consentTemplate.getCompany()};
	    listOfConsents.push(item);
	}
    }
    
    balance = consentHandler.web3.fromWei(consentHandler.web3.eth.getBalance(user.coinbase), "ether");
    
    res.render ('list', { user : user, consents : listOfConsents, balance : balance, menu_l : "active" });
});

//
// Provides a consent page where you can deny or allow a specific consent.
//
router.get ('/consent/:consentId', loggedInUser, function (req, res) {
    var user = req.user;
    var consent = consentHandler.contract.Consent.at(req.params.consentId);
    var id = consent.getTemplate();
    var consentTemplate = consentHandler.contract.ConsentTemplate.at(id);
    var item = {id: req.params.consentId,
		title: consentTemplate.getTitle(),
		text: consentTemplate.getText(),
		version: consentTemplate.getVersion().toNumber(),
		status: statusString[consent.getStatus().toNumber()],
	        company: consentTemplate.getCompany()};
    var backURL=req.header('Referer') || '/';    
    res.render ('consent', { user : user, consent : item, backURL : backURL });
});

router.post ('/consent/:consentId', loggedInUser, function (req, res) {
    var user = req.user;
    var backURL=req.header('Referer') || '/';    

    // We need to unlock the coinbase for the user, to be able to do the transaction
    console.log ("Router: User = " + user.coinbase);
    console.log ("Router: Trying to unlock the ethereum account");
    var unlocked = consentHandler.unlockAccount(req.user.coinbase, req.body.password);
    console.log ("Router: Unlocking = " + unlocked);
    
    // Did we unlock it ?
    if (unlocked) {
	
	// Sign the consent, experimentation
	console.log("Router: Experimental signing of the consent");
	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth()+1)  + "/" 
            + currentdate.getFullYear() + "@"  
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds();
	var consent = consentHandler.contract.Consent.at(req.params.consentId);
	var id = consent.getTemplate();
	var consentTemplate = consentHandler.contract.ConsentTemplate.at(id);
	var item = JSON.stringify ({consentId: req.params.consentId, action: req.body.action, title:consentTemplate.getTitle(), text: consentTemplate.getText(), dateTime: datetime});
	console.log ("Router: Message = " + item);
	var msg = consentHandler.web3.sha3(item);
	console.log ("Router: SHA3 = " + msg);
	var signature;
	/* Some version of web3 do not have the hex indicator */
	if (msg[1] != 'x')
	    signature = consentHandler.web3.eth.sign(user.coinbase, "0x" + msg);
	else
	    signature = consentHandler.web3.eth.sign(user.coinbase, msg);
	    
	console.log ("Router: Signature = " + signature);

	// Send the status change of the consent, this should be going through the consent factory of the company who
	// issued this consent form so they get notified.
	txHash = consent.setStatus.sendTransaction (req.body.action,
						    {from: user.coinbase, gas: 50000});
	
	console.log ("Router: Locking account after transaction");
	var locked = consentHandler.lockAccount(req.user.coinbase);
	console.log ("Router: Locking ethereum account = " + locked);

	// Should be more than zero blocks to wait, but we accept it whenever it is mined
	consentHandler.awaitBlockConsensus ([consentHandler.web3], txHash, 0, 60, function(err, receipt)
					    {
						if (err)
						    console.log ("Router: " + err);
						if (receipt) {
						    var gasPrice = consentHandler.web3.eth.gasPrice;
						    console.log ("Router: Curent gas price = " + gasPrice);
						    console.log ("Router: Gas used = " + receipt.gasUsed);
						    console.log ("Router: Transferring back in wei  = " + (gasPrice * receipt.gasUsed));
						    var tx = consentHandler.web3.eth.sendTransaction({from: consentHandler.account, to: user.coinbase, value: (gasPrice*receipt.gasUsed)});
						    console.log ("Router: ConsentHandler: Sending back ether to the user");
						    
						}
					    });
	
	res.render ('consentaction', {user : user, action : statusActionString[req.body.action], backURL : backURL});

    } else {

	res.render ('failedunlock', {user : user, backURL : backURL});
	
    }
});

//
// View a specific consent template
//
router.get ('/consenttemplate/:consentTemplateId', loggedInAdmin, function (req, res) {
    var user = req.user;
    var consentTemplate = consentHandler.contract.ConsentTemplate.at(req.params.consentTemplateId);
    var item = {id: req.params.consentTemplateId,
		purpouse: consentTemplate.getPurpouse(),
		locale: consentTemplate.getLanguageCountry(),
		version: consentTemplate.getVersion().toNumber(),
		title: consentTemplate.getTitle(),
		text: consentTemplate.getText(),
	        company: consentTemplate.getCompany()};
    var backURL=req.header('Referer') || '/';
    res.render ('consenttemplate', { user : user, consentTemplate : item, backURL : backURL });
});

//
// /listactivetemplates
//
router.get ('/listofactivetemplates', loggedInAdmin, function (req, res) {
    
    var listOfTemplates = [];
    
    //
    // get hold of the consent templates
    //    
    var user = req.user;
    if (typeof user.factory !== 'undefined' && user.factory) {
	var factory = consentHandler.contract.ConsentFactory.at (user.factory);
	var list = factory.getActiveConsentTemplates.call({from: factory.getOwner(), gas: 40000000});
	var len = list.length;
	for(i=0; i<len; i++) {
	    var consentTemplate = consentHandler.contract.ConsentTemplate.at(list[i]);
	    var item = {id: list[i],
			purpouse: consentTemplate.getPurpouse(),
			version: consentTemplate.getVersion().toNumber(),
			languageCountry: consentTemplate.getLanguageCountry(),
			title: consentTemplate.getTitle(),
			company: consentTemplate.getCompany()};
	    listOfTemplates.push(item);
	}

	var balance = consentHandler.web3.fromWei(consentHandler.web3.eth.getBalance(user.coinbase), "ether");

	res.render ('listofactivetemplates', { company: factory.getCompany(), user : user, consents : listOfTemplates, balance : balance, coinbase : consentHandler.account, factory : user.factory, mining : false, menu_lactive : "active" });
    } else {
	var balance = consentHandler.web3.fromWei(consentHandler.web3.eth.getBalance(user.coinbase), "ether");

	res.render ('listofactivetemplates', { company: user.username, user : user, consents : [], balance : balance, coinbase : consentHandler.account, factory : "Mining in progress ...", mining : true, menu_lactive : "active"});
    }
});

router.get('/newtemplate/:consentTemplateId', loggedInAdmin, function (req, res) {
    var user = req.user;
    var item = { purpouse: "",
		 locale: "",
		 version: 1};
    
    if (req.params.consentTemplateId != 0) {
	var consentTemplate = consentHandler.contract.ConsentTemplate.at(req.params.consentTemplateId);
	item = { purpouse: consentTemplate.getPurpouse(),
		 locale: consentTemplate.getLanguageCountry(),
		 version: consentTemplate.getVersion().toNumber() + 1,
		 company: consentTemplate.getCompany(),
	         readonly: true}
    }
    
    res.render ('newtemplate', {user : user, item : item});    
});

//
// Handles the creation of a new template
//
router.post('/newtemplate', loggedInAdmin, function(req, res) {
    var user = req.user;
    var backURL=req.header('Referer') || '/';    
    
    // We need to unlock the coinbase for the user, to be able to do the transaction
    console.log ("Router: User = " + user.coinbase);
    console.log ("Router: Trying to unlock the ethereum account");
    var unlocked = consentHandler.unlockAccount(req.user.coinbase, req.body.password);
    console.log ("Router: Unlocking = " + unlocked);

    if (unlocked) {
	var factory = consentHandler.contract.ConsentFactory.at (user.factory);
	consentHandler.addConsentTemplate (factory, req.body.purpouse, Number(req.body.version), req.body.title, req.body.description, req.body.locale);  
	res.render('newtemplatedone', { user : user, backURL : backURL });
    } else {
	res.render('failedunlock', {user : user, backURL : backURL});
    }
});

//
// /listalltemplates
//
router.get ('/listofalltemplates', loggedInAdmin, function (req, res) {
    
    var listOfTemplates = [];
    
    //
    // get hold of the consent file for the user
    //    
    var user = req.user;
    if (typeof user.factory !== 'undefined' && user.factory) {
	var factory = consentHandler.contract.ConsentFactory.at (user.factory);
	var list = factory.getAllConsentTemplates.call({from: factory.getOwner(), gas: 40000000});
	var len = list.length;
	for(i=0; i<len; i++) {
	    var consentTemplate = consentHandler.contract.ConsentTemplate.at(list[i]);
	    var item = {id: list[i],
			purpouse: consentTemplate.getPurpouse(),
			version: consentTemplate.getVersion().toNumber(),
			languageCountry: consentTemplate.getLanguageCountry(),
			title: consentTemplate.getTitle(),
			company: consentTemplate.getCompany()};
	    listOfTemplates.push(item);
	}
	res.render ('listofalltemplates', { user : user, consents : listOfTemplates, menu_lall : "active" });
    } else {
	res.render ('listofalltemplates', { user : user, consents : [], menu_lall : "active" });
    }
    
});

//
// /register get and post
//
router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {

    // Create a blockchain account for this user. Is this how we really should do it???
    var id = consentHandler.newAccount (req.body.password);
    console.log ("Router: Blockchain id for user " + req.body.username + "role " + req.body.role + " got account " + id);
    Account.register(new Account({ username : req.body.username, coinbase : id, role : req.body.role }), req.body.password, function(err, account) {

	// Was it succesfull?
        if (err) {
	    console.log ("Router: Failed to create user " + err);
            return res.render('exist', { error: err });
        }

	// Authenticate us
        passport.authenticate('local')(req, res, function () {

	    // Start mining a consent list
	    if (req.body.role === "user") {
		console.log ("Router: Mining for a consent file for user " + req.body.username + ", blockchain id " + id);
		consentHandler.newConsentFile (id, function (error, result) {
		    if (!error) {
			if (result.address!=undefined) {
			    
			    console.log("Router: The consent file contract is mined and got address " + result.address);
			    rcpt = consentHandler.web3.eth.getTransactionReceipt (result.transactionHash);
			    console.log("Router: Gas used for contract mining = " + rcpt.gasUsed);

			    /* Get the mined factory */
			    var file = consentHandler.contract.ConsentFile.at (result.address);

			    /* Fins the user who wants the factory */
			    Account.findOne ({
				'coinbase' : file.getGiver()
			    }, function (err, user) {
				if (!err) {
				    
				    console.log ("Router: User located _id = " + user._id);
				    Account.update(
					{_id: user._id}, 
					{consents : result.address },
					{multi:true}, 
					function(err, numberAffected){
					    if (!err)
						console.log ("Router: Consent file address is inserted into the user record");
					    else
						console.log ("Router: Failed to update the user record with the consent file = " + err);
					});
				} else {
				    console.log ("Router: Failed to find the user record for consent file update = " + err);		   
				}
			    });
			}
			
		    } else {
			console.log ("Router: Mining error = " + error);
		    }
		});

		res.redirect ("/list");
	    }

	    if (req.body.role === "admin") {
		console.log ("Router: Mining for a consent factory for company " + req.body.username + ", blockchain id " + id);
		consentHandler.newConsentFactory (req.body.username, id, function (error, result) {
		    
		    if (!error) {
			if (result.address!=undefined) {
			    
			    console.log("Router: The consent factory contract is mined and got address " + result.address);
			    rcpt = consentHandler.web3.eth.getTransactionReceipt (result.transactionHash);
			    console.log("Router: Gas used for contract mining = " + rcpt.gasUsed);

			    /* Get the mined factory */
			    var factory = consentHandler.contract.ConsentFactory.at (result.address);

			    /* Fins the user who wants the factory */
			    Account.findOne ({
				'coinbase' : factory.getOwner()
			    }, function (err, user) {
				if (!err) {
				    
				    console.log ("Router: User located _id = " + user._id);
				    Account.update(
					{_id: user._id}, 
					{factory : result.address },
					{multi:true}, 
					function(err, numberAffected){
					    if (!err)
						console.log ("Router: Consent factory address is inserted into the user record");
					    else
						console.log ("Router: Failed to update the user record with the consent factory = " + err);
					});
				} else {
				    console.log ("Router: Failed to find the user record for factory update = " + err);		   
				}
			    });
			}
			
		    } else {
			console.log ("Router: Mining error = " + error);
		    }
		    
		});

		res.redirect ("/listofactivetemplates");
	    }
	    	    
        });
    });
});

//
// /login get and post functions
//
router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.get('/loginfail', function(req, res) {
    var backURL=req.header('Referer') || '/';        
    res.render('loginfail', { user : req.user, backURL : backURL });
});

router.post('/login', passport.authenticate('local',{ failureRedirect: '/loginfail' }), function(req, res) {
		 
    // Redirect us to the correct place depending on role
    if (req.user.role === 'user')
	res.redirect('/list');
    else {
	res.redirect('/listofactivetemplates');
    }
    
});

//
// /logout
//
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

//
// Create a new consent get and post
//
router.get('/createconsent/:consentTemplateId', loggedInAdmin, function (req, res) {
    var user = req.user;
    var users = [];
    
    // Get all users
    Account.find({role : 'user'}, 'username consents').sort({username:1}).exec().then(function (lst) {
	
	// Get consent template contract
	var consentTemplate = consentHandler.contract.ConsentTemplate.at(req.params.consentTemplateId);
	var item = {id: req.params.consentTemplateId,
		    purpouse: consentTemplate.getPurpouse(),
		    locale: consentTemplate.getLanguageCountry(),
		    version: consentTemplate.getVersion().toNumber(),
		    title: consentTemplate.getTitle(),
		    text: consentTemplate.getText()};
	var backURL=req.header('Referer') || '/';
	res.render ('createconsent', { user : user, consentTemplate : item, backURL : backURL, users : lst });
	
    }).catch (function (err) {

	console.log ("Router: " + err);
	res.render('error', {error : err});
	
    });
});

router.post('/createconsent', loggedInAdmin, function (req, res) {
    var user = req.user;
    var backURL=req.header('Referer') || '/';    
    
    // We need to unlock the coinbase for the user, to be able to do the transaction
    console.log ("Router: User = " + user.coinbase);
    console.log ("Router: Trying to unlock the ethereum account");
    var unlocked = consentHandler.unlockAccount(req.user.coinbase, req.body.password);
    console.log ("Router: Unlocking = " + unlocked);

    if (unlocked) {
	var factory = consentHandler.contract.ConsentFactory.at(req.user.factory);
	consentHandler.createConsent (factory, req.body.consents, req.body.purpouse, req.body.locale);
	res.render ('createconsentdone', {user : user, backURL : backURL});
    } else {
	res.render ('failedunlock', {user : user, backURL : backURL});
    }
});

module.exports = router;
