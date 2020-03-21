//TODO ml: SquareVerifier is generated by zokrates classroom, need to test if it works
// TODO ml: copy boilerplate from ERC721 tests

// define a variable to import the <Verifier> or <renamedVerifier> solidity contract generated by Zokrates
//TODO ml: define the verifier contract that was generated by zokrates classroom
//TODO ml: only 2 test cases

// Test verification with correct proof
// - use the contents from proof.json generated from zokrates steps

    
// Test verification with incorrect proof


var Test = require('../config/testConfig.js');
const  truffleAssert = require('truffle-assertions')

contract('TestSquareVerifier', accounts => {

    describe('Test SquareVerifier', function () {
        var config;

        beforeEach(async function () {
            config = await Test.Config(accounts);

        })

        it('Test verification with correct proof', async function () {
            let result =  await config.verifier.verifyTx(config.params.proof.a, config.params.proof.b, config.params.proof.c, config.params.inputs);
            truffleAssert.eventEmitted(result, "Verified");
            assert.equal(result.logs[0].args.s, 'Transaction successfully verified.')

            result =  await config.verifier.verifyTx.call(config.params.proof.a, config.params.proof.b, config.params.proof.c, config.params.inputs);
            assert.equal(result, true);
        })

        it('Test verification with incorrect proof', async function () {
            const input = ["0x0000000000000000000000000000000000000000000000000000000000000008", "0x0000000000000000000000000000000000000000000000000000000000000001"];
            let result =  await config.verifier.verifyTx.call(config.params.proof.a, config.params.proof.b, config.params.proof.c, input);
            assert.equal(result, false);
        })

    })
})



