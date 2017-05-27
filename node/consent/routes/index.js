var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
const util = require('util');

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

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
