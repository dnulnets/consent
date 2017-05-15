all: generated consent consentmanagement
	@echo "Done!"

generated:
	mkdir generated

consent: generated/consent.json

consentmanagement: generated/consentmanagement.json

generated/consentmanagement.json: consentmanagement.sol
	solc --combined-json abi,bin consentmanagement.sol > generated/consentmanagement.json

generated/consent.json: consent.sol
	solc --combined-json abi,bin consent.sol > generated/consent.json

clean:
	@rm -fR generated


