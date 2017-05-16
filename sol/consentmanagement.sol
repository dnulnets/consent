pragma solidity ^0.4.11;
import "consent.sol";
/* 
 * This is the consent management contract that handles consents and version of
 * consents.
 *
 * It basically provides an interface to be bale to create consents based on
 * purpouse for a specific user.
 *
 * Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
 *
 */
contract ConsentManagement {

    /* Define variable owner of the type address*/
    address owner;  /* Who owns this contract */
  
    /* Event that signals changes in this contract */    
    event ConsentManagementEvent(uint256 logTimestamp, uint256 eventTimestamp, string operation, string value);

    event ConsentCreateEvent(address indexed user, address consent);
    
    /* Sends the event */
    function sendEvent (uint256 eventTimestamp, string _operation, string _value)
    {
        ConsentManagementEvent (block.timestamp, eventTimestamp, _operation, _value);
    }
    
    /* This function is executed at initialization and sets the owner and the giver of the consent */
    /* as well as what it contains */
    function ConsentManagement() public
    { 
        owner = msg.sender;
    }
    
    /* Modifiers */
    modifier onlyBy (address _account)
    {
        require (msg.sender == _account);
        _;
    }

    /* Create a consent for a specific purpouse of the lates version */
    function createConsent (address _user, string _purpouse) onlyBy (owner)
    {
      address consent = new Consent (_purpouse, 1, "Product development", "I give Permobil AB consent to use the data collected ...", _user);
      ConsentCreateEvent (_user, consent);
    }

    /* Create a consent for a specific purpouse of the lates version */
    function test1 (address _user, string _purpouse) onlyBy (owner)
    {
      ConsentCreateEvent (_user, owner);
    }

    function test2 (address _user, string _purpouse) onlyBy (owner) returns (string)
    {
      return "Teststräng";
    }    
        
    /* Function to recover the funds on the contract */
    function kill() { if (msg.sender == owner) selfdestruct(owner); }
}
