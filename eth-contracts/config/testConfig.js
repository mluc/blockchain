
var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");
var Verifier = artifacts.require("Verifier");
var params = require('../../zokrates/code/square/proof.json');

var Config = async function(accounts) {
    let owner = accounts[0];

    let verifier = await Verifier.new();
    let solnSquareVerifier = await SolnSquareVerifier.new(verifier.address);


    return {
        owner: owner,
        testAddresses: accounts,
        verifier: verifier,
        solnSquareVerifier: solnSquareVerifier,
        params: params
    }
}

module.exports = {
    Config: Config
};