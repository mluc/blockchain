var Web3 = require("web3")
var web3 = new Web3('HTTP://127.0.0.1:7545')
web3.eth.getTransactionCount('0x40c5F88B6F0a46EeDF8645e90792e0fD6f6bF261').then(console.log)