#
# Boots up an ethereum node. This one is meant for booting up the node and attach it to rinkeby network.
#
# ./boot_rinkeby.sh
#
# Copyright (c) 2017, Tomas Stenlund, All rights reserved
#
geth --rinkeby --rpc --rpcaddr localhost --rpcport "8545" --rpccorsdomain "*" --datadir "/home/tomas/.rinkeby" --port "30303" --rpcapi "db,eth,net,personal,admin,web3" console
