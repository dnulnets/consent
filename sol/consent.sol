pragma solidity ^0.4.11;

/*
 * This file contains a set of contracts used to handle consents between a company
 * and a person.
 *
 * Copyright (c) 2017, Tomas Stenlund, All rights reserved
 */

/*
 * This is the contract that handles consent templates for a specific purpouse. It is used
 * when a person or entity wants to get a consent from another user. The consent is then
 * generated from this template.
 *
 * It basically provides a textual description of the consent.
 *
 * Copyright (c) 2017, Tomas Stenlund, All rights reserved
 *
 */
contract ConsentTemplate {

  address private owner;        /* The owner of the template */
  string  private purpouse;     /* What purpouse the template is for */ 
  uint16  private version;      /* Version of the purpouse, i.e. if the text or title changes for the same purpouse */
  string  private title;        /* The title of the consent */
  string  private text;         /* The text that describes the purpouse of the consent */
  string  private languageCountry;       /* The language and country the consent template that it is valid for
					  *
					  * Standard country-language code according to ISO 639 and ISO 3166-1 alpha 2
					  * separated by a dash, so for swedish in Sweden it is "sv-SE" */

  /* Creates the contract and set the values of the contract. */
  function ConsentTemplate (string _purpouse, uint16 _version, string _title, string _text, string _languageCountry) public
  {
    owner = msg.sender;
    purpouse = _purpouse;
    version = _version;
    title = _title;
    text = _text;
    languageCountry = _languageCountry;
  }

  /* Getters for the contract */
  function getVersion () constant returns (uint16)
  {
    return version;
  }

  function getTitle () constant returns (string)
  {
    return title;
  }

  function getText () constant returns (string)
  {
    return text;
  }

}

/*
 * This is the contract that handles consents for a specific purpouse given by a
 * user (giver) to another user (owner).
 *
 * It basically provides a textual description  that is either accepted or denied by a user.
 *
 * Copyright (c) 2017, Tomas Stenlund, All rights reserved
 *
 */
contract Consent {

    /* Enumeration for the state of the consent */
  enum Status {denied,    /* The giver has denied the consent */
	       accepted,  /* The giver has accepted the consent */ 
	       requested, /* The company has requested a consent, user has not yet responded */
	       cancelled  /* The company has cancelled the consent because he no longer needs it */
  }
    
  /* State variables for the contract */
  address private owner;  /* Who issues to consent form */
  address private giver;  /* Who gives the consent, address to the account. */
  Status  private status; /* The status of the consent */
  address private consentTemplate; /* The template this consent is based on */
  
  /* Event to signal that the status has changed */
  event ConsentStatusChanged (address indexed owner, address indexed giver, address consent, Status status);
  
  /* This function is executed at initialization and sets the owner and the giver of the consent */
  /* as well as what it contains */
  function Consent(address _giver, address _consentTemplate) public
  {
    giver = _giver;
    owner = msg.sender;
    consentTemplate = _consentTemplate;
    status = Status.requested;
  }

  /* Sets the status of the consent, this can only be done by the giver. Should have a modifier for that. */
  function setStatus(Status _status)
  {
    status = _status;
    ConsentStatusChanged (owner, giver, this, _status);    
  }

  /* Cancels a consent, this can only be done by the company who created the consent. Should have a modifier for that. */
  function cancelConsent ()
  {
    status = Status.cancelled;
    ConsentStatusChanged (owner, giver, this, Status.cancelled);    
  }
  
  /* Returns the status of the consent */    
  function getStatus() constant returns (Status)
  {
    return status;
  }

  /* Returns the consent template that this consent is based on */
  function getTemplate() constant returns (ConsentTemplate)
  {
    return ConsentTemplate(consentTemplate);
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
 * Copyright (c) 2017, Tomas Stenlund, All rights reserved
 *
 */
contract ConsentFile {

  /* The owner of the file */
  address private owner;

  /* The list of all consents */
  address[] private listOfConsents;

  /* Events that are sent when things happen */
  event ConsentFileConsentAdded (address indexed user, address consent);
  
  /* The constructor of the file. Also attaches it to an owner */
  function ConsentFile (address _owner)
  {
    owner = _owner;
  }

  /* Adds a new consent to the file */
  function addConsent (address _consent)
  {
    listOfConsents.push (_consent);
    ConsentFileConsentAdded (owner,  _consent);
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
 * a specific purpouse for a specific user. And always using the latest version
 * and always puts newly generated consents into a persons consent file.
 *
 * Copyright (c) 2017, Tomas Stenlund, All rights reserved
 *
 */
contract ConsentFactory {

  /* Enumeration for errors */
  enum Error {no_such_template /* If no such template exists for the purpouse, language and country */
  }
  
  /* The owner of this contract */
  address private owner;  /* Who owns this Consent Facotory, this is a company */

  /* List of all templates in this factory */
  address[] listOfAllConsentTemplates;
  address[] listOfActiveConsentTemplates;
  
  /* Contains a map from purpouse to language and country mapping to index into the list of active consent templates */
  mapping (string => mapping (string => uint)) private consentTemplates;
  
  /* Events generated when the consent has been created */
  event ConsentFactoryConsentCreatedEvent(address indexed owner, address indexed user, address indexed file, address consent);
  event ConsentFactoryFileCreatedEvent(address indexed owner, address indexed user, address file);
  event ConsentFactoryFailedEvent(address indexed owner, address indexed user, Error error);
  event ConsentFactoryTemplateAdded (address indexed owner, address indexed factory, address template);

  /* Constructor for the consent factory */
  function ConsentFactory() public
  { 
    owner = msg.sender;
  }

  /* Adds a consent template to the factory to be used for consent generation. */

  function addConsentTemplate (string _purpouse, uint16 _version, string _title, string _text, string _languageCountry)    
  {
    /* Add the template for the specific language, country and purpouse */
    uint ix = consentTemplates[_purpouse][_languageCountry];
    address ct = new ConsentTemplate (_purpouse, _version, _title, _text, _languageCountry);
    if (ix == 0) {
      ix = listOfActiveConsentTemplates.push (ct);
      consentTemplates[_purpouse][_languageCountry] = ix;
    } else {
      listOfActiveConsentTemplates[ix-1] = ct;
    }
    listOfAllConsentTemplates.push(ct);
    ConsentFactoryTemplateAdded (owner, this, ct);    
  }
  
  /* Create a file that holds a users all consents
   * 
   * This is the file that holds all consents regardless of their state.
   */
  function createConsentFile (address _user)
  {
    address file = new ConsentFile (_user);
    ConsentFactoryFileCreatedEvent(owner, _user, file);
  }
  
  /* Create a consent for a specific purpouse of the latest version, language and country.
   *
   * Country and Purpouse must exist otherwise it will fail, if language is not there it will
   * default to countrys default language if it exists otherwise it will fail. It adds
   * the consent to the users file as well.
   */
  function createConsent (address _file, string _purpouse, string _languageCountry)
  {
    ConsentFile cf = ConsentFile (_file);
    ConsentTemplate ct = getTemplate (_purpouse, _languageCountry);
    if (ct != address(0)) {

      /* We got a template so generate the consent and put it into the consent file */
      Consent consent = new Consent (cf.getOwner(), ct);
      ConsentFile(_file).addConsent (consent);
      ConsentFactoryConsentCreatedEvent(owner, cf.getOwner(), _file, consent);

    } else {
      
    ConsentFactoryFailedEvent(owner, cf.getOwner(), Error.no_such_template);
      
    }
  }

  /* This function checks to see that there is a consent to be generated */
  function hasConsent (string _purpouse, string _languageCountry) constant returns (bool)
  {
    ConsentTemplate ct = getTemplate (_purpouse, _languageCountry);
    return (ct != address(0));
  }
  
  /* This function tests wether a consent for a specific purpouse exists or not */
  function getTemplate (string _purpouse, string _languageCountry) constant internal returns (ConsentTemplate)
  {
    /* Get the consents for a specific purpouse and language, country*/
    uint ix = consentTemplates[_purpouse][_languageCountry];
    if (ix == 0) {
      
      /* Fallback here is to only go for the default language of the country */
      /* So we need to strip the language from the country */
      bytes memory b = bytes (_languageCountry);
      if (b.length==5) {
	if (b[2] == 45) {
    	  bytes memory c = new bytes(2);
	  
	  /* Get the country */
    	  c[0] = b[3];
    	  c[1] = b[4];
    	  ix = consentTemplates[_purpouse][string(c)];
    	}
      }
    }

    /* Return the consent template if we found any */
    if (ix>0)
      return ConsentTemplate(listOfActiveConsentTemplates[ix-1]);
    else
      return ConsentTemplate(address(0));
  }
  
  /* Function to recover the funds on the contract */
  function kill() { if (msg.sender == owner) selfdestruct(owner); }
}

/*
 * END
 */
