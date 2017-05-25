rm -fR ../../../data/geth
rm -f ../../../data/history
geth --identity "PermobilTest" --datadir "../../../data" --networkid 1967 init "../../genesis.json"

