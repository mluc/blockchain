// migrating the appropriate contracts
var ERC721Mintable = artifacts.require("./ERC721Mintable");
var Verifier = artifacts.require("./Verifier");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier");
const fs = require('fs');

module.exports = function(deployer) {
  let name = 'name';
  let symbol = 'symbol';
  let baseTokenURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';
  deployer.deploy(ERC721Mintable, name, symbol, baseTokenURI);

    deployer.deploy(Verifier)
        .then(() => {
            return deployer.deploy(SolnSquareVerifier, name, symbol, baseTokenURI, Verifier.address)
                .then(() => {
                    let config = {
                        localhost: {
                            url: 'http://localhost:7545',
                            verifierAddress: Verifier.address,
                            solAddress: SolnSquareVerifier.address
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
        });

};
