#
# Initializes a blockchain with the genesis file. Removes the old one. Note that it does not remove the
# ethereum accounts that is located in the keystore of the data directory.
#
# Copyright (c) 2017, Tomas Stenlund, All rights reserved
#
rm -fR ../../data/geth
rm -f ../../data/history
geth --identity "PermobilTest" --datadir "../../data" --networkid 1967 init "../genesis.json"

