#
# Initializes a blockchain with the genesis file. Removes the old one.
#
# Copyright (c) 2017, Tomas Stenlund, All rights reserved
#
rm -fR ../../../data/geth
rm -f ../../../data/history
geth --identity "PermobilTest" --datadir "../../../data" --networkid 1967 init "../../genesis.json"

