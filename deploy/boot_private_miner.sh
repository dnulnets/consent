#
# Boots up an ethereum node. This one is meant for booting up the node that also contains the Authority. It needs the
# coinbase password and you have to supply it as a file.
#
# ./boot.sh <passwordifle>
#
# Copyright (c) 2017, Tomas Stenlund, All rights reserved
#
COINBASE=$(geth --datadir "~/.consent" -exec "eth.coinbase" console 2> /dev/null)
geth --nodiscover --mine --unlock ${COINBASE//\"/} --password $1 --identity "PermobilTest" --rpc --rpcaddr localhost --rpcport "8545" --rpccorsdomain "*" --datadir "~/.consent" --port "30303" --rpcapi "db,eth,net,personal,admin,web3" --networkid 1967 console

