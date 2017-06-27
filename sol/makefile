all: generated consent
	@echo "Done generating bytecode!"

generated:
	mkdir generated

consent: generated
	solc --abi --bin --overwrite consent.sol -o generated/
	./makejs.sh
	cp generated/contract.js ../node/consent/lib/.

clean:
	@rm -fR generated
