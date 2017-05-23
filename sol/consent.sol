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
    enum Status {denied, accepted, offered}
    
    /* Define variable owner of the type address*/
    address owner;  /* Who wants to get the consent, address to the account. Should be an identity contract */
    address giver;  /* Who gives the consent, address to the account. Should be an identity contract */
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
 * This a list of consents that are offered to a specific account.
 *
 * This contains a list of consents that a specific user has been
 * offered. Regardless if it is deined, approved or has no decision.
 *
 * Copyright (c) 2017, Tomas Stenlund, Permobil AB, All rights reserved
 *
 */
contract ConsentFile {

  /* The owner of the file */
  address private owner;

  /* The list of all consents */
  address[] private listOfConsents;

  /* The constructor of the file. Also attaches it to an owner */
  function ConsentFile (address _owner)
  {
    owner = _owner;
  }

  /* Adds a new consent to the file */
  function addConsent (address _consent)
  {
    listOfConsents.push (_consent);
  }

  /* Retrieve a list of all consents in the file */
  function getListOfConsents () constant returns (address[])
  {
    return listOfConsents;
  }

  /* Retrieves the owner */
  function getOwner () constant returns (address)
  {
    return owner;
  }
  
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

  /* Enumeration for errors */
  enum Error {no_such_template /* If no such template exists for the purpouse, language and country */
  }
  
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
  event ConsentFactoryConsentCreatedEvent(address indexed user, address consent);
  event ConsentFactoryFileCreatedEvent(address indexed user, address file);
  event ConsentFactoryFailedEvent(address indexed user, Error error);
  
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

  /* Create a file that holds a users all consents
   * 
   * This is the file that holds all consents regardless of their state.
   */
  function createConsentFile (address _user)
  {
    address file;

    file = new ConsentFile (_user);
    ConsentFactoryFileCreatedEvent(_user, file);
  }
  
  /* Create a consent for a specific purpouse of the latest version, language and country.
   *
   * Country and Purpouse must exist otherwise it will fail, if language is not there it will
   * default to countrys default language if it exists otherwise it will fail. It adds
   * the consent to the users file as well.
   */
  function createConsent (address _file, string _purpouse, string _languageCountry)
  {
    address consent;
    ConsentFile cf = ConsentFile (_file);
    
    ConsentTemplate memory ct = getTemplate (_purpouse, _languageCountry);

    /* Did we get the template ?*/
    if (ct.version > 0) {
      consent = new Consent (cf.getOwner(), _purpouse, ct.version, ct.title, ct.text, _languageCountry);
      ConsentFile(_file).addConsent (consent);
      ConsentFactoryConsentCreatedEvent(cf.getOwner(), consent);
    } else {
      ConsentFactoryFailedEvent(cf.getOwner(), Error.no_such_template);
    }
  }

  /* This function checks to see that there is a consent to be generated */
  function hasConsent (string _purpouse, string _languageCountry) constant returns (bool)
  {
    return (getTemplate (_purpouse, _languageCountry).version != 0);
  }
  
  /* This function tests wether a consent for a specific purpouse exists or not */
  function getTemplate (string _purpouse, string _languageCountry) constant internal returns (ConsentTemplate)
  {
    ConsentTemplate memory ct = ConsentTemplate({version:0, title: "", text: ""});

    /* Get the consents for a specific purpouse */
    ConsentLanguageCountry clc = consentPurpouses[_purpouse];
    if (clc.exist) {

      /* Get the specific consent for the language and country */
      ct = clc.consentTemplates[_languageCountry];
      if (ct.version==0) {

	/* Fallback here is to only go for the default language of the country */
	/* So we need to strip the language from the country */
	bytes memory b = bytes (_languageCountry);
	if (b.length==5) {
	  if (b[2] == 45) {
	    bytes memory c = new bytes(2);
	    c[0] = b[3];
	    c[1] = b[4];	    
	    ct = clc.consentTemplates[string(c)];
	  }
	}
      }
    }

    /* No template found */
    return ct;
  }
  
  /* Function to recover the funds on the contract */
  function kill() { if (msg.sender == owner) selfdestruct(owner); }
}
