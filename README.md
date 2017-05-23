# Consent Handling Prototype
A prototype for consent handling using a ethereum blockchain based on PoA and a small web server (express on node) to demonstrate the functionality.
## What is a consent?
When one person voluntarily agrees to the proposal or desires of another.

This is very common when a company want to perform specific processing of information collected from a person. For instance if a company collects data on a persons usage of a specific product with the intention of performing product improvements based on that data, the company needs to have a consent.

One solution to this is to provide contracts on a blockchain for this specific purpouse. That is what this prototype demonstrates.
## What does this prototype contains

A set of contracts written in Solidity that gives a web application the possiblity to create users and present to the user theese consents. It also gives the user the ability to accept, deny or defer the consents. The consents are generated by a company and added to the users file.

The blockchain has three contracts.

- ConsentFactory - A contract that is created for a company that allows the company to manage consent templates, generate new consents and add them to a users consent file. The templates supports versions, language and jurisdiction (country).

- ConsentFile - A file that contains all the consents that have been offered to a specific user by the companies.

- Consent - A contract that allows a company to get consents from a specific user and for a specific purpouse. The user can agree, disagree or defer the decision on wether or not to accept it.

An simple express web server with a couple of pages to create new users and allow them to manage their consents.

A couple of node javascripts to setup the ethereum blockchain, initiate a ConsentFactory and try out various use cases on the contracts.

## What needs to be done

This is just a few items that needs to be sorted out:
- Develop a GUI for the consent handling for both users and companies. (ongoing)
- How to handle integrity, i.e. wether or not a person has agreed or not is considered personal data. Maybe even the consent in itself.
- Is PoA the way to go, and if so who is the Authority in this case?
- Identity and proof of identity of the person is needed in the end.
- Signature, how to handle that on the consent or is it enough as it is? 2FA, etc.
- The contract model is that really the way to go? Need disucssions.




