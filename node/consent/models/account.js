//
// The mongoose model for the prototype
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
    factory: String,
    role: String
});

Account.plugin(passportMongoose);

module.exports = mongoose.model('Account', Account);

