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

        it('a new solution can be added for contract', async function () {
            let account1 = config.accounts[1];
            let result = await config.solnSquareVerifier.addSolution(account1, config.params.proof.a, config.params.proof.b, config.params.proof.c, config.params.inputs);
            truffleAssert.eventEmitted(result, "SolutionAdded");
            assert.equal(result.logs[0].args.index, 0);
            assert.equal(result.logs[0].args.owner, account1);
            try{
                await config.solnSquareVerifier.addSolution(config.owner, config.params.proof.a, config.params.proof.b, config.params.proof.c, config.params.inputs);
            }catch (e) {
                assert.equal(e.reason, 'this solution is already added')
            }

        })

        it('an ERC721 token can be minted for contract', async function () {
            let account2 = accounts[2];
            let balanceBefore = await config.solnSquareVerifier.balanceOf(account2);
            let result = await config.solnSquareVerifier.mintNFT(account2, 1, config.params.proof.a, config.params.proof.b, config.params.proof.c, config.params.inputs);
            truffleAssert.eventEmitted(result, "TokenMint");

            let balanceAfter = await config.solnSquareVerifier.balanceOf(account2);
            assert(Number(balanceAfter), Number(balanceBefore) + 1);
        })

    })
})