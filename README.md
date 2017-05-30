# Consent Handling Prototype
An investigative  prototype for consent handling using an ethereum blockchain based on PoA, a web server (express on node) and a mongo database.

It is in no way complete and there is no claim of it ever being completed. It is focusing on the process of handling consents on a blockchain and to learn the functionality, pros and cons of a blockchain supporting this use case.

**This is work in progress.**
## What is a consent?
**When one person voluntarily agrees to the proposal or desires of another.**

This is a common use case when a company wants to perform processing of information collected from a person for a specific purpouse. For example: If a company collects data on a persons usage of a product with the intention of using that data to perform product improvements based on that data, the company needs to have a consent.

## User stories

From a company perspective:
- As a company I would like to be able to have a set of consent templates that I can generate new consent forms from to offer our end users.
- As a company I expect the consent template to specify a title, a body describing the purpouse of the consent.
- As a company I would like to generate a new consent form for a specific user from a consent template based on my purpouse.
- As a company I expect the system to choose the consent template when generating the consent form based on my purpouse, the users language and country.
- As a company I would like to determine if a user has accepted a consent.
- As a company I need to be able to provide a detailed audit trail of the consent handling for a specific user.
- As a company I expect the system to automatically generate new consents for the users if a consent template with the same purpouse as the initial consent is updated.
- As a company I need to be able to offer of withdraw a consent at any time.

From a user perspective:
- As a user I would like to know which consents I have been offered, are withdrawn, accepted, denied or defered.
- As a user I would like to be able to deny or accept a consent at any time.
- As a user I expect that if a consent gets updated the system adds that consent to my consent file as a new offer.

## What does this prototype contains

A set of contracts written in Solidity that gives a web application the possiblity to create users, consents and present to the user a list of offered consents. It also gives the user the ability to accept, deny or defer the consents and for companies to offer or withdraw consents. The consents are generated by a company and added to the users consent file.

The blockchain has four contracts.

- ConsentFactory - A contract that is created for a company that allows the company to manage consent templates, generate new consents and add them to a users consent file.

- ConsentFile - A file that contains all the consents that have been offered to a specific user by the companies.

- Consent - A contract that allows a company to get consents from a specific user and for a specific purpouse. The user can agree, disagree or defer the decision on wether or not to accept it. A company can withdraw a consent. Consents are generated from ConsetTemplates.

- ConsentTemplate - A contract that holds the generic (user agnostic) parts of a consent such as title, textual description, language, country and purpouse of the consent. Consents are generated from templates.

An express web server with a couple of pages to create new users and allow them to manage their consents during login and for administrators to handle consent templates and consent generation for specific users.

A couple of node javascripts and a genesis file to setup the ethereum blockchain and initiate a ConsentFactory and consent templates on the blockchain.

## What needs to be done

This is just a few items that needs to be sorted out:
- Develop a GUI for the consent handling for both users and companies. (ongoing)
- How to handle integrity, i.e. wether or not a person has agreed or not is considered personal data. Maybe even the consent in itself.
- Is PoA the way to go, and if so who is the Authority in this case?
- Identity and proof of identity of the person is needed in the end.
- Signature, how to handle that on the consents or is it enough as it is?
- Better authentication, 2FA.
- The consent model is that really the way to go? What to put in the blockchain and what to put in the mongo database. Need disucssion!

