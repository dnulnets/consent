all: consent

consent: consent.bin consent.abi
	@-echo "Done!"

consent.bin: consent.sol
	solc --bin -o . consent.sol

consent.abi: consent.sol
	solc --abi -o . consent.sol

clean:
	@rm -f *.abi *.bin

