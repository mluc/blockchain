// migrating the appropriate contracts
var ERC721Mintable = artifacts.require("./ERC721Mintable");
//var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = function(deployer) {
  let name = ''
  let symbol = ''
  let baseTokenURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';
  deployer.deploy(ERC721Mintable, name, symbol, baseTokenURI);
  //deployer.deploy(SolnSquareVerifier);
};
