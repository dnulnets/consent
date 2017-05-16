pragma solidity ^0.4.11;

/*
 * This is the contract that handles consents for a specific purpouse given by a
 * user to another user.
 *
 * It basically provides a textual description  that is either accepted or denied by a user.
 *
 * Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
 *
 */
contract Consent {

    /* Enumeration for the state of the consent */
    enum Status {denied, accepted, offered }
    
    /* Define variable owner of the type address*/
    address owner;  /* Who wants to get the consent */
    address giver;  /* Who gives the consent, address to the identity contract */
    Status  status; /* The status of the consent */
    string  purpouse;     /* What purpouse the consent is for */ 
    uint16  version;      /* Version of the purpouse, i.e. if the text or title changes for the same purpouse */
    string  title;        /* The title of the consent */
    string  text;         /* The text that describes the purpouse of the consent */

    /* Event that signals changes in a contract */    
    event ConsentEvent(uint256 logTimestamp, uint256 eventTimestamp, string operation, string value);

    /* Sends the event */
    function sendEvent (uint256 eventTimestamp, string _operation, string _value)
    {
        ConsentEvent (block.timestamp, eventTimestamp, _operation, _value);
    }
    
    /* This function is executed at initialization and sets the owner and the giver of the consent */
    /* as well as what it contains */
    function Consent(string _purpouse, uint16 _version, string _title, string _text, address _giver) public
    { 
        purpouse = _purpouse;
        version = _version;
        title = _title;
        text = _text;
        giver = _giver;
	status = Status.offered;
        owner = msg.sender;
    }
    
    /* Modifiers */
    modifier onlyBy (address _account)
    {
        require (msg.sender == _account);
        _;
    }

    /* Sets the status of the consetn, this can only be done by the giver */
    function setStatus(Status _status) onlyBy (giver)
    {
        status = _status;
        if (status == Status.accepted)
            sendEvent (block.timestamp, "set status", "accepted");
        if (status == Status.denied)
            sendEvent (block.timestamp, "set status", "denied");
        if (status == Status.offered)
            sendEvent (block.timestamp, "set status", "offered");
    }

    /* Returns the status of the consent */    
    function getStatus() returns (Status)
    {
        return status;    
    }

    /* Returns with the purpose of the consent */
    function getPurpouse() returns (string)
    {
        return purpouse;
    }

    /* Returns with the version of the consent. It is the purpose that the version number is connected */
    function getVersion () returns (uint16)
    {
        return version;    
    }

    /* Returns with the title of the consent */
    function getTitle() returns (string)
    {
        return title;    
    }

    /* Returns with the text of the consent */
    function getText() returns (string)
    {
        return text;    
    }
    
    /* Function to recover the funds on the contract */
    function kill() { if (msg.sender == owner) selfdestruct(owner); }
}

/* 
 * This is the consent factory contract that handles consents and version of
 * consents.
 *
 * It basically provides an interface to be bale to create consents based on
 * purpouse for a specific user.
 *
 * Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
 *
 */
contract ConsentFactory {

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
