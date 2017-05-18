# Consent Handling Prototype - Permobil AB
Consent handling prototye with an ethereum blockchain using PoA.
## What is a consent?
A consent is something a person A can give another person B or entity B to perform certain actions for a specific purpouse in connection to person A.
For example if entity B want to perform data processing on data collected from person A for a specific purpouse and person A agrees to that. Person A gives entity B a consent to do that processing, but only for that specific purpouse.
## What does this prototype contains
Two contracts.
ConsentFactory - A contract that is created for a specific person B or entity B that contains templates for different consents, purpouses, countries and languages. It handles the consent template database and can generate consents on behalf of person B or entity B based on a specific person A, purpouse, country and language. That can later be agreed or disagreed upon by person A.

Consent - A contract that is created by person B or entityt B for a specific purpouse, language, country and for a specific person A. Person A can then agree, disagree or deferr the decision on whether to agree or not. If this consent exists and is agreed upon then person B or entity B can execute its purpouse in connection to person A.




