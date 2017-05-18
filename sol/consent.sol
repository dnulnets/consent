pragma solidity ^0.4.11;

/*
 * This is the contract that handles consents for a specific purpouse given by a
 * user (giver) to another user (owner).
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
    string  languageCountry;       /* Standard country-language code according to ISO 639 and ISO 3166-1 alpha 2
				    * separated by a dash, so for swedish in Sweden it is sv-SE */
    
    /* This function is executed at initialization and sets the owner and the giver of the consent */
    /* as well as what it contains */
    function Consent(address _giver, string _purpouse, uint16 _version, string _title, string _text, string _languageCountry) public
    { 
        purpouse = _purpouse;
        version = _version;
        title = _title;
        text = _text;
        giver = _giver;
	status = Status.offered;
	languageCountry = _languageCountry;
        owner = msg.sender;
    }

    /* Sets the status of the consent, this can only be done by the giver */
    function setStatus(Status _status)
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
 * It basically provides an interface to be able to create consents based on
 * a specific purpouse for a specific user. And always using the latest version.
 *
 * Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
 *
 */
contract ConsentFactory {

  /* The owner of this contract */
  address owner;  /* Who owns this contract */

  /* 
   * This structure is the template for the consent, it contains version, title and the
   * text of the consent. It is then contained in a mapping for purpose, country and
   * language.
   */
  struct ConsentTemplate {
    uint16 version;      /* Current version of the consent, if zero, no consent exists */
    string title;        /* The title of the consent, i.e. "Analysis for Product development" */
    string text;         /* The text body of the consent describing the reason, what we want to do and what kind of data
			  * we want to use. */
  }

  /* Contains a map from language and country according to ISO 639 and ISO 3166-1 alpha 2 separated by a dash to
   * consent template. For example swedish in Sweden is written sv-SE */
  struct ConsentLanguageCountry {
    bool exist; /* If there exists any consents, true if yes, false otherwsie */
    mapping (string => ConsentTemplate) consentTemplates;
  }
  
  /* Contains a map from purpouse to language and country mapping */
  mapping (string => ConsentLanguageCountry) consentPurpouses;
  
  /* Events generated when the consent has been created */
  event ConsentCreatedEvent(address indexed user, address consent);

  /* Constructor for the consent factory */
  function ConsentFactory() public
  { 
    owner = msg.sender;
  }

  /* Adds a consent template to the factory to be used for futre consent generation. */
  function addConsentTemplate (string _purpouse, uint16 _version, string _title, string _text, string _languageCountry)    
  {
    consentPurpouses[_purpouse].exist = true;
    consentPurpouses[_purpouse].consentTemplates[_languageCountry] = ConsentTemplate ({version: _version, title: _title, text: _text});
  }

  /* Remove an entire purpouse */
  /* NOTE TO SELF: delete really does not delete any of the mappings, do better later on */
  function removePurpouse (string _purpouse)
  {
    delete consentPurpouses[_purpouse];
    consentPurpouses[_purpouse].exist = false;
  }

  /* Remove a specific country and language combination of a purpouse */
  /* NOTE TO SELF: delete really does not delete any of the mappings, do better later on */
  function removeConsentTemplate (string _purpouse, string _languageCountry)
  {
    delete consentPurpouses[_purpouse].consentTemplates[_languageCountry];
  }
  
  /* Create a consent for a specific purpouse of the latest version, language and country.
   *
   * Country and Purpouse must exist otherwise it will fail, if language is not there it will
   * default to countrys default language if it exists otherwise it will fail. */
  function createConsent (address _user, string _purpouse, string _languageCountry)
  {
    address consent = new Consent (_user, _purpouse, 1, "Product development",
				   "I give Permobil AB consent to use the data collected ...",
				   _languageCountry);
    ConsentCreatedEvent(_user, consent);
  }
  
  /* Function to recover the funds on the contract */
  function kill() { if (msg.sender == owner) selfdestruct(owner); }
}
