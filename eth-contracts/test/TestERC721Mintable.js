//TODO ml: first test
const  truffleAssert = require('truffle-assertions')
var ERC721Mintable = artifacts.require('ERC721Mintable');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_three = accounts[2];
    const account_four = accounts[3];
    const account_five = accounts[4];
    let name = 'name';
    let symbol = 'symbol';
    let baseTokenURI = 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/';

    describe('match erc721 spec', function () {
        beforeEach(async function () {
            this.contract = await ERC721Mintable.new(name, symbol, baseTokenURI, {from: account_one});

            // TODO: mint multiple tokens
            this.contract.mint(account_two,2);
            this.contract.mint(account_three,3);
            this.contract.mint(account_four,4);
            this.contract.mint(account_four,5);
            this.contract.mint(account_four,6);

        })

        it('should return total supply', async function () {
            //TODO ml: should return total supply of your ERC721 token successfully
            let supplyCount = await this.contract.totalSupply();
            assert.equal(Number(supplyCount), 5);
        })

        it('should get token balance', async function () {
            let balance = await this.contract.balanceOf(account_two);
            assert.equal(Number(balance), 1);
            balance = await this.contract.balanceOf(account_four);
            assert.equal(Number(balance), 3);
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            //TODO ml: this uri is kept in the ERC721 token contract and this is where the metadata is being fetched from
            //TODO ml: Ex: base uri: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/
            //TODO ml: Ex: token uri/id: 1
            let tokenURI1 = await this.contract.tokenURI(2);
            let tokenURI2 = await this.contract.tokenURI(3);
            assert.equal(tokenURI1, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/2');
            assert.equal(tokenURI2, 'https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/3');
        })

        it('should transfer token from one owner to another', async function () {
            try{
                await this.contract.transferFrom(account_two, account_five, 6, {from:account_two});
            }catch (e) {
                assert.equal(e.reason, 'caller is not owner or approved by owner')
            }

            let result = await this.contract.transferFrom(account_two, account_five, 2, {from:account_two});
            truffleAssert.eventEmitted(result, "Transfer");
            assert.equal(result.logs[0].args.from, account_two);
            assert.equal(result.logs[0].args.to, account_five);
            assert.equal(result.logs[0].args.tokenId, 2);

            await this.contract.transferFrom(account_four, account_five, 4, {from:account_four})
            let balance = await this.contract.balanceOf(account_five);
            assert.equal(Number(balance), 2);
            balance = await this.contract.balanceOf(account_two);
            assert.equal(Number(balance), 0);
            balance = await this.contract.balanceOf(account_four);
            assert.equal(Number(balance), 2);

            let ownerOf = await this.contract.ownerOf(2);
            assert.equal(ownerOf, account_five)
            ownerOf = await this.contract.ownerOf(4);
            assert.equal(ownerOf, account_five)
        })

        it('approve another address to transfer', async function () {
            let balance = await this.contract.balanceOf(account_two);
            assert.equal(Number(balance), 1);
            balance = await this.contract.balanceOf(account_three);
            assert.equal(Number(balance), 1);
            balance = await this.contract.balanceOf(account_four);
            assert.equal(Number(balance), 3);
            balance = await this.contract.balanceOf(account_five);
            assert.equal(Number(balance), 0);

            // approve 1 token
            try{
                await this.contract.transferFrom(account_three, account_five, 4, {from:account_two});
            }catch (e) {
                assert.equal(e.reason, 'caller is not owner or approved by owner')
            }
            let result = await this.contract.approve(account_two,3)
            truffleAssert.eventEmitted(result, "Approval");

            result = await this.contract.transferFrom(account_three, account_five, 3, {from:account_two});
            truffleAssert.eventEmitted(result, "Transfer");
            balance = await this.contract.balanceOf(account_five);
            assert.equal(Number(balance), 1);
            balance = await this.contract.balanceOf(account_three);
            assert.equal(Number(balance), 0);

            // approve all token
            try{
                await this.contract.transferFrom(account_four, account_five, 4, {from:account_two});
            }catch (e) {
                assert.equal(e.reason, 'caller is not owner or approved by owner')
            }
            result = await this.contract.setApprovalForAll(account_two,true, {from:account_four})
            truffleAssert.eventEmitted(result, "ApprovalForAll");
            assert.equal(result.logs[0].args.owner, account_four);
            assert.equal(result.logs[0].args.operator, account_two);
            assert.equal(result.logs[0].args.approved, true);

            result = await this.contract.transferFrom(account_four, account_five, 4, {from:account_two});
            truffleAssert.eventEmitted(result, "Transfer");
            await this.contract.setApprovalForAll(account_two,false, {from:account_four})
            try{
                await this.contract.transferFrom(account_four, account_five, 5, {from:account_two});
            }catch (e) {
                assert.equal(e.reason, 'caller is not owner or approved by owner')
            }

            balance = await this.contract.balanceOf(account_two);
            assert.equal(Number(balance), 1);
            balance = await this.contract.balanceOf(account_three);
            assert.equal(Number(balance), 0);
            balance = await this.contract.balanceOf(account_four);
            assert.equal(Number(balance), 2);
            balance = await this.contract.balanceOf(account_five);
            assert.equal(Number(balance), 2);

        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () {
            this.contract = await ERC721Mintable.new(name, symbol, baseTokenURI, {from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {
            try{
                await this.contract.mint(account_two,2,{from:account_three});
            }catch (e) {
                assert.equal(e.reason, 'Caller is not contract owner');
            }
        })

        it('should return contract owner', async function () {
            let owner = await this.contract.getOwner();
            assert.equal(owner, account_one);

        })

    });
})