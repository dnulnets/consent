#
# Boots up an ethereum node. This one is meant for booting up the node that also contains the Authority. It needs the
# authoritys password and will ask for it to be able to mine.
#
# Copyright (c) 2017, Tomas Stenlund, All rights reserved
#
geth --mine --unlock 0x6491a9dbab0a7b080b76457e2dfed6f2a4b8a190 --identity "PermobilTest" --rpc --rpcaddr localhost --rpcport "8545" --rpccorsdomain "*" --datadir "../../../data" --port "30303" --rpcapi "db,eth,net,personal,admin,web3" --networkid 1967 console

