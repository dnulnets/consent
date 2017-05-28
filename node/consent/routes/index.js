//
// Consent handling routes.
//
// This file contains the express application routes to demonstrate consent
// handling.
//
// Copyright (c) 2017, Tomas Stenlund, All rights reserved
//
var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
const util = require('util');

//
// Check if the user is logged in
//
function loggedInUser(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function loggedInAdmin(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

//
// Root pages
//
router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

//
// Provides a list of consents for a specific user. The user has to be logged in.
//
router.get ('/list', loggedInUser, function (req, res) {

    var listOfConsents = [];
    var mined = true;
    
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
	    var item = {id: list[i], title: consentTemplate.getTitle(), version: consentTemplate.getVersion().toNumber(), status: consent.getStatus().toNumber()};
	    listOfConsents.push(item);
	}
    } else {
	mined = false;
    }
    
    res.render ('list', { user : user, consents : listOfConsents, mined : mined });
});

//
// Provides a consent page where you can deny or allow a specific consent.
//
router.get ('/consent/:consentId', loggedInUser, function (req, res) {
    var user = req.user;
    var consent = consentHandler.consentContract.at(req.params.consentId);
    console.log (consent);
    var id = consent.getTemplate();
    var consentTemplate = consentHandler.consentTemplateContract.at(id);
    var item = {id: req.params.consentId, title: consentTemplate.getTitle(), text: consentTemplate.getText(), version: consentTemplate.getVersion().toNumber(), status: consent.getStatus().toNumber()};
    res.render ('consent', { user : user, consent : item });
});

//
// /register
//
router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {

    // Create a blockchain account for this user. Is this how we really should do it???
    var id = consentHandler.newAccount (req.body.password);
    console.log ("Router: Blockchain id for user " + req.body.username + " got account " + id);
    Account.register(new Account({ username : req.body.username, coinbase : id }), req.body.password, function(err, account) {

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
// /login
//
router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    console.log ("--------------------------------------------------");    
    console.log ("User is authenticated!");
    console.log ("Request : " + util.inspect (req));
    console.log ("--------------------------------------------------");
    console.log ("Response : " + util.inspect (res));
    console.log ("--------------------------------------------------");
    res.redirect('/');
});

//
// /logout
//
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/createconsent', function (req, res) {
    console.log ("Router: Creating consent for " + req.user.username);
    txhash = consentHandler.createConsent (req.user.consents, "VSCRAD", "no-SE");
    console.log ("Router: Transaction hash = " + txhash);
    res.redirect ('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
