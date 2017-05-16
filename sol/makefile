all: generated consent
	@echo "Done generating bytecode!"

generated:
	mkdir generated

consent: generated/consent.json

generated/consent.json: consent.sol
	solc --combined-json abi,bin consent.sol > generated/consent.json

clean:
	@rm -fR generated
