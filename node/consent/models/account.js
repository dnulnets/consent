var bluebird = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = bluebird;
var Schema = mongoose.Schema;
var passportMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    coinbase: String,
    consents: String,
    role: String
});

Account.plugin(passportMongoose);

module.exports = mongoose.model('Account', Account);

