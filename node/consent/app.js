//
// Consent handling prototype on a proof of authority blockchain.
//
// This file contains the express application to demonstrate consent
// handling.
//
// Copyright (c) 2017, Tomas Stenlund, All rights reserved
//
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Account = require('./models/account');

//
// Own developed requirements
//
var ConsentHandler = require ('./lib/consent.js');
consentHandler = new ConsentHandler ("mandelmassa");

// Set up the eventhandlers for the blockchain
var event = consentHandler.allEventsHandler (function (err,res) {

    //
    // Do this much nicer, but this is a prototype, just go with it for now ;-)
    //
    if (!err) {

	var event = res.event;
	var args = res.args;

	//
	// If we got a consent file mined event, we need to insert it into the user so we know who owns it.
	// This is where we store all consents.
	//
	if (event == 'ConsentFactoryFileCreatedEvent') {
	    
	    console.log ("Consent file for account " + args.user + " has been mined");
	    console.log ("Consent file has address " + args.file);
	    Account.findOne({
                'coinbase' : args.user
            },function(err,user){

		if (!err) {
		    
		    console.log ("User located _id = " + user._id);
		    Account.update(
			{_id: user._id}, 
			{consents : args.file },
			{multi:true}, 
			function(err, numberAffected){
			    if (!err)
				console.log ("Consent file address is inserted into the user record");
			    else
				console.log ("Failed to update the user record with the consent file = " + err);
			});
		    
		} else {

		    console.log ("Failed to locate the user = " + err);
		    
		}
	    });
	    
	} else {

	    console.log ("Unhandled event = " + event + "(" + args + ")");
	    
	}

    } else {
	
        console.log("Unable to handle events from the blockchain = " + err);
    }
});

// The routing we are using
var index = require('./routes/index');

// Create the application
var app = express();

// Use pug as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set up a lot of stuff needed
app.use(favicon(path.join(__dirname, 'public', 'favicons.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// We run everything from the root
app.use('/', index);

// Passport configuration
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// MongoDB configuration
mongoose.connect('mongodb://localhost/consent');

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Export the app
module.exports = app;
