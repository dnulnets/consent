# Consent Handling Prototype - Permobil AB
Consent handling prototye with an ethereum blockchain using PoA.
## What is a consent?
A consent is something a person A can give another person B or entity B to perform certain actions for a specific purpouse in connection to person A.

For example if entity B want to perform data processing on data collected from person A for a specific purpouse and person A agrees to that. Person A gives entity B a consent to do that processing, but only for that specific purpouse.
## What does this prototype contains
Two contracts.
- ConsentFactory - A contract that is created for a specific person B or entity B that contains templates for different consents, purpouses, countries and languages. It handles the consent template database and can generate consents on behalf of person B or entity B based on a specific person A, purpouse, country and language. That consent can then later be agreed or disagreed upon by person A.

- Consent - A contract that is created by person B or entityt B for a specific person A, purpouse, language and country. Person A can then agree, disagree or defer the decision on whether to agree or not. If this consent exists and is agreed upon then person B or entity B is allowed to execute its purpouse in connection to person A.

A couple of node javascripts to setup the ethereum blockchain, initiate a ConsentFactory and try out various use cases on the contracts.

## What needs to be done

This is just a few items that needs to be sorted out:
- Develop a GUI for the consent handling for both person A, person B and entity B.
- How to handle integrity, i.e. wether or not a person has agreed or not is considered personal data. Maybe even the consent in itself.
- Is PoA the way to go, and if so who is the Authority in this case?
- Identity and proof of identity of the person is needed in the end.
- Signature, how to handle that on the consent or is it enough as it is?


