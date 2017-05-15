//
// Make sure we got the libraries needed
//
var Web3 = require('web3');
var fs = require('fs');
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

//
// Create the contracts
//
var consentABI = fs.readFileSync('../consent/sol/Consent.abi')
var consentBIN = fs.readFileSync('../consent/sol/Consent.bin')
var consentContract = web3.eth.contract (eval(consentABI));
var consentManagementABI = fs.readFileSync('../consent/sol/ConsentManagement.abi')
var consentManagementBIN = fs.readFileSync('../consent/sol/ConsentManagement.bin')
var consentManagementContract = web3.eth.contract (eval(consentManagementABI));
console.log(consentManagementContract);
var consentManagementObject = consentManagementContract.new(
   {
     from: "0x6491a9dbab0a7b080b76457e2dfed6f2a4b8a190", 
     data: consentManagementBIN,
     gas: 2000000
   }, function (e, contract){
    console.log(e, contract);
    if (typeof contract.address !== 'undefined') {
         console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
    }
 })


