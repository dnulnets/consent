all: consent consentmanagement
	@echo "Done!"

consentmanagement: ConsentManagement.abi ConsentManagement.bin

ConsentManagement.bin: consentmanagement.sol
	solc --overwrite --bin -o . consentmanagement.sol

ConsentManagement.abi: consentmanagement.sol
	solc --overwrite --abi -o . consentmanagement.sol

consent: Consent.bin Consent.abi

Consent.bin: consent.sol
	solc --overwrite --bin -o . consent.sol

Consent.abi: consent.sol
	solc --overwrite --abi -o . consent.sol

clean:
	@rm -f *.abi *.bin

