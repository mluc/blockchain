
var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");
var Verifier = artifacts.require("Verifier");
var params = require('../../zokrates/code/square/proof.json');

var Config = async function(accounts) {
    let owner = accounts[0];
    let name = 'name';
    let symbol = 'symbol';
    let baseTokenURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';

    let verifier = await Verifier.new();
    let solnSquareVerifier = await SolnSquareVerifier.new(name, symbol, baseTokenURI, verifier.address);


    return {
        owner: owner,
        accounts: accounts,
        verifier: verifier,
        solnSquareVerifier: solnSquareVerifier,
        params: params
    }
}

module.exports = {
    Config: Config
};