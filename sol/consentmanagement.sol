pragma solidity ^0.4.11;

/* 
 * This is the contract that handles consents given by a user to another user.
 *
 * It basically provides an offering that is either accepted or denied by a user.
 *
 * Written by Tomas Stenlund, Permobil AB
 *
 */
contract ConsentManagement {

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
    function ConsentManagement(string _purpouse, uint16 _version, string _title, string _text, address _giver) public
    { 
        purpouse = _purpouse;
        version = _version;
        title = _title;
        text = _text;
        giver = _giver;
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
