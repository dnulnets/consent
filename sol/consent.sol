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
    Status  private status; /* The status of the consent */
    string  purpouse;     /* What purpouse the consent is for */ 
    uint16  version;      /* Version of the purpouse, i.e. if the text or title changes for the same purpouse */
    string  title;        /* The title of the consent */
    string  text;         /* The text that describes the purpouse of the consent */
    
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
    }

    /* Returns the status of the consent */    
    function getStatus() returns (Status)
    {
        return status;    
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
  
    /* Events */
    event ConsentCreateEvent(address indexed user, address consent);

    event ConsentEvent ();
    
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
      //address consent = new Consent (_purpouse, 1, "Product development", "I give Permobil AB consent to use the data collected ...", _user);
      ConsentCreateEvent (_user, _user);
    }

    /* Create a consent for a specific purpouse of the lates version */
    function test1 ()
    {
      ConsentEvent ();
    }

    string whadda = "Test of string";
    function test2 () constant returns (string)
    {
      return whadda;
    }    
        
    /* Function to recover the funds on the contract */
    function kill() { if (msg.sender == owner) selfdestruct(owner); }
}
