#
# An example script for attaching a node to the initial authority node. You need to change the paramters
# to fit your setup.
#
# Copyright (c) 2017, Tomas Stenlund, All rights reserved
#
geth --identity "PermobilTest" --rpc --rpcport "8545" --rpccorsdomain "*" --datadir "../../data" --port "30303" --bootnodes enode://c35a34e931ae5170e9f858c28ce6f799006f4f3d5a5f7d77e6ea96fb655f86ba6989feffe4e2ba59c9c9e7bd831e6bfd24d822f681ce8723847c8b3e054cc63c@192.168.1.222:30303 --rpcapi "db,eth,net,web3" --networkid 1967 console

