#
# An example script for attaching a node to the initial authority node. You need to change the paramters
# to fit your setup.
#
# Copyright (c) 2017, Tomas Stenlund, All rights reserved
#
# My local peer : enode://1315efd25f9f4903cda8d1447840823eeb7715a4e4f1e29ce1ab4dc94af22a3784e13ef04a522c57db22700789b91c73666c55b8f21606a93f8a3a0a49badde9@192.168.1.222:30303
#
geth --nodiscover --identity "PermobilTest" --rpc --rpcport "8545" --rpccorsdomain "*" --datadir "~/.consent" --port "30303" --rpcapi "db,eth,net,web3" --networkid 1967 console


