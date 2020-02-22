/*##########################

CONFIGURATION
##########################*/

// -- Step 1: Set up the appropriate configuration
var Web3 = require("web3")
const EthereumTx = require('ethereumjs-tx').Transaction
var web3 = new Web3('HTTP://127.0.0.1:7545')

// -- Step 2: Set the sending and receiving addresses for the transaction.
var sendingAddress = '0x40c5F88B6F0a46EeDF8645e90792e0fD6f6bF261'
var receivingAddress = '0x9EfD4768d671FdFed6F9F62D869ac864AD1BC878'

// -- Step 3: Check the balances of each address
web3.eth.getBalance(sendingAddress).then(console.log)
web3.eth.getBalance(receivingAddress).then(console.log)

/*##########################

CREATE A TRANSACTION
##########################*/

// -- Step 4: Set up the transaction using the transaction variables as shown
var rawTransaction = {
  nonce: Buffer.from('1', 'hex'),
  to: receivingAddress,
  gasPrice: Buffer.from('20000000', 'hex'),
  gasLimit: Buffer.from('300000', 'hex'),


  value: Buffer.from('100', 'hex'),
  data: Buffer.from('', 'hex'),
}


// -- Step 5: View the raw transaction
rawTransaction

// -- Step 6: Check the new account balances (they should be the same)
web3.eth.getBalance(sendingAddress).then(console.log)
web3.eth.getBalance(receivingAddress).then(console.log)

// Note: They haven't changed because they need to be signed...

/*##########################

Sign the Transaction
##########################*/

// -- Step 7: Sign the transaction with the Hex value of the private key of the sender
var privateKeySender = 'aafe1619fb88c9e48ae4409e060c8c3cd55a18e9d51882e1a3291044b6a1ecc9'
var privateKeySenderHex = new Buffer(privateKeySender, 'hex')
console.log(privateKeySenderHex)
var transaction = new EthereumTx(rawTransaction)
transaction.sign(privateKeySenderHex)

/*#########################################

Send the transaction to the network
#########################################*/

// -- Step 8: Send the serialized signed transaction to the Ethereum network.
var serializedTransaction = transaction.serialize();
web3.eth.sendSignedTransaction(serializedTransaction);
