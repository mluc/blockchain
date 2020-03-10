var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "token broccoli resource song angle dignity install inform inject peace siege outside";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
    // development: {
    //   provider: function() {
    //     return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
    //   },
    //   network_id: '*'
    // }
  },
  compilers: {
    solc: {
      version: "^0.4.24"
    }
  }
};