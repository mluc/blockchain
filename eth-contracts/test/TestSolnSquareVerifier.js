//TODO ml: test the combination of ERC721 token and the logic for zokrates
// TODO ml: put these tests in between each step to make sure you are on the right path
// TODO ml: copy boilerplate from ERC721 tests

// Test if a new solution can be added for contract - SolnSquareVerifier
//TODO ml: test you can add solution to the mapping

// Test if an ERC721 token can be minted for contract - SolnSquareVerifier
//TODO ml: test you can mint s token using SolnSquareVerifier
//TODO ml: reminder: in SolnSquareVerifier, you can only mint a token after you prove that it is actually verified using zokrates
//TODO ml: only 2 test cases

var Test = require('../config/testConfig.js');


const  truffleAssert = require('truffle-assertions')

contract('TestSolnSquareVerifier', accounts => {

    describe('Test SolnSquareVerifier', function () {
        var config;
        beforeEach(async function () {
            config = await Test.Config(accounts);


        })

        it('test something', async function () {

        })

    })
})