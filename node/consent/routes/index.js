//
// Consent handling routes.
//
// This file contains the express application routes to demonstrate consent
// handling.
//
// Copyright 2017 Tomas Stenlund
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
// Status data
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
    res.render('unauthorized', {});
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
	var consentFile = consentHandler.consentFileContract.at(user.consents);
	var list = consentFile.getListOfConsents();
	var len = list.length;
	for(i=0; i<len; i++) {
	    var consent = consentHandler.consentContract.at(list[i]);
	    var id = consent.getTemplate();
	    var consentTemplate = consentHandler.consentTemplateContract.at(id);	    
	    var item = {id: list[i], title: consentTemplate.getTitle(),
			version: consentTemplate.getVersion().toNumber(),
			status: statusString[consent.getStatus().toNumber()]};
	    listOfConsents.push(item);
	}
    }
    
    res.render ('list', { user : user, consents : listOfConsents });
});

//
// Provides a consent page where you can deny or allow a specific consent.
//
router.get ('/consent/:consentId', loggedInUser, function (req, res) {
    var user = req.user;
    var consent = consentHandler.consentContract.at(req.params.consentId);
    var id = consent.getTemplate();
    var consentTemplate = consentHandler.consentTemplateContract.at(id);
    var item = {id: req.params.consentId,
		title: consentTemplate.getTitle(),
		text: consentTemplate.getText(),
		version: consentTemplate.getVersion().toNumber(),
		status: statusString[consent.getStatus().toNumber()]};
    res.render ('consent', { user : user, consent : item });
});

//
// View a specific consent template
//
router.get ('/consenttemplate/:consentTemplateId', loggedInAdmin, function (req, res) {
    var user = req.user;
    var consentTemplate = consentHandler.consentTemplateContract.at(req.params.consentTemplateId);
    var item = {id: req.params.consentTemplateId,
		purpouse: consentTemplate.getPurpouse(),
		locale: consentTemplate.getLanguageCountry(),
		version: consentTemplate.getVersion().toNumber(),
		title: consentTemplate.getTitle(),
		text: consentTemplate.getText()};
    var backURL=req.header('Referer') || '/';
    res.render ('consenttemplate', { user : user, consentTemplate : item, backURL : backURL });
});

//
// Consent actions
//
router.get ('/consentaction/:consentId/:action', loggedInUser, function (req, res) {
    var user = req.user;
    var consent = consentHandler.consentContract.at(req.params.consentId);
    consent.setStatus (req.params.action);  
    res.render ('consentaction', {user : user, action : statusActionString[req.params.action]});
});

//
// /listactivetemplates
//
router.get ('/listofactivetemplates', loggedInAdmin, function (req, res) {
    
    var listOfTemplates = [];
    
    //
    // get hold of the consent file for the user
    //    
    var user = req.user;
    var list = consentHandler.consentFactory.getActiveConsentTemplates ();
    var len = list.length;
    for(i=0; i<len; i++) {
	var consentTemplate = consentHandler.consentTemplateContract.at(list[i]);
	var item = {id: list[i],
		    purpouse: consentTemplate.getPurpouse(),
		    version: consentTemplate.getVersion().toNumber(),
		    languageCountry: consentTemplate.getLanguageCountry(),
		    title: consentTemplate.getTitle()};
	listOfTemplates.push(item);
    }
    
    res.render ('listofactivetemplates', { user : user, consents : listOfTemplates });
});

router.get('/newtemplate/:consentTemplateId', loggedInAdmin, function (req, res) {
    var user = req.user;
    var item = { purpouse: "",
		 locale: "",
		 version: 1};
    
    if (req.params.consentTemplateId != 0) {
	var consentTemplate = consentHandler.consentTemplateContract.at(req.params.consentTemplateId);
	item = { purpouse: consentTemplate.getPurpouse(),
		 locale: consentTemplate.getLanguageCountry(),
		 version: consentTemplate.getVersion().toNumber() + 1,
	         readonly: true}
    }
    
    res.render ('newtemplate', {user : user, item : item});    
});

router.post('/newtemplate', loggedInAdmin, function(req, res) {
    var user = req.user;
    consentHandler.addConsentTemplate (req.body.purpouse, Number(req.body.version), req.body.title, req.body.description, req.body.locale);  
    res.render('newtemplatedone', { user : user });
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
    var list = consentHandler.consentFactory.getAllConsentTemplates ();
    var len = list.length;
    for(i=0; i<len; i++) {
	var consentTemplate = consentHandler.consentTemplateContract.at(list[i]);
	var item = {id: list[i],
		    purpouse: consentTemplate.getPurpouse(),
		    version: consentTemplate.getVersion().toNumber(),
		    languageCountry: consentTemplate.getLanguageCountry(),
		    title: consentTemplate.getTitle()};
	listOfTemplates.push(item);
    }
    
    res.render ('listofalltemplates', { user : user, consents : listOfTemplates });
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
            return res.render('register', { account : account });
        }

	// Authenticate us
        passport.authenticate('local')(req, res, function () {

	    // Start mining a consent list
	    console.log ("Router: Mining for a consent file for user " + req.body.username + ", blockchain id " + id);
	    consentHandler.createConsentFile (id);
	    
	    // Redirect us to the logged in page
            res.redirect('/');
	    
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
    res.render('loginfail', { user : req.user });
});

router.post('/login', passport.authenticate('local',{ failureRedirect: '/loginfail' }), function(req, res) {
    if (req.user.role === 'user')
	res.redirect('/list');
    else
	res.redirect('/listofactivetemplates');
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
	var consentTemplate = consentHandler.consentTemplateContract.at(req.params.consentTemplateId);
	var item = {id: req.params.consentTemplateId,
		    purpouse: consentTemplate.getPurpouse(),
		    locale: consentTemplate.getLanguageCountry(),
		    version: consentTemplate.getVersion().toNumber(),
		    title: consentTemplate.getTitle(),
		    text: consentTemplate.getText()};
	var backURL=req.header('Referer') || '/';
	res.render ('createconsent', { user : user, consentTemplate : item, backURL : backURL, users : lst });
	
    }).catch (function (err) {

	console.log (err);
	res.render('error', {error : err});
	
    });
});

router.post('/createconsent', loggedInAdmin, function (req, res) {
    var user = req.user;
    consentHandler.createConsent (req.body.consents, req.body.purpouse, req.body.locale);
    res.render ('createconsentdone', {user : user});
});

module.exports = router;
