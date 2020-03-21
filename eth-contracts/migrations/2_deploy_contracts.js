// migrating the appropriate contracts
var ERC721Mintable = artifacts.require("./ERC721Mintable");
var Verifier = artifacts.require("./Verifier");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier");

module.exports = function(deployer) {
  let name = 'name';
  let symbol = 'symbol';
  let baseTokenURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';
  deployer.deploy(ERC721Mintable, name, symbol, baseTokenURI);

  // deployer.deploy(Verifier)
  //     .then(()=>{
  //       return deployer.deploy(SolnSquareVerifier, Verifier.address)
  //
  //     });


    deployer.deploy(Verifier)
        .then(() => {
            return deployer.deploy(SolnSquareVerifier, Verifier.address)
                .then(() => {
                    let config = {
                        localhost: {
                            url: 'http://localhost:7545',
                            verifierAddress: Verifier.address,
                            solAddress: SolnSquareVerifier.address
                        }
                    }
                    // fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    // fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
        });

};
