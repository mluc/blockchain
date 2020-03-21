//TODO ml: first test
var ERC721Mintable = artifacts.require('ERC721Mintable');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    let name = ''
    let symbol = ''
    let baseTokenURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';

    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await ERC721Mintable.new(name, symbol, baseTokenURI, {from: account_one});

            // TODO: mint multiple tokens
        })

        it('should return total supply', async function () {
            //TODO ml: should return total supply of your ERC721 token successfully
        })

        it('should get token balance', async function () {

        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            //TODO ml: this uri is kept in the ERC721 token contract and this is where the metadata is being fetched from
            //TODO ml: Ex: base uri: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/
            //TODO ml: Ex: token uri/id: 1
        })

        it('should transfer token from one owner to another', async function () {

        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await ERC721Mintable.new(name, symbol, baseTokenURI, {from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {

        })

        it('should return contract owner', async function () {

        })

    });
})