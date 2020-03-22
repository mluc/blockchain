pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";

contract SolnSquareVerifier is ERC721Mintable{
    Verifier verifier;

    // TODO define a solutions struct that can hold an index & an address
    //TODO ml: create structs and mappings that help verify that only one verification was used at a time:
    //TODO ml: ^ make sure each verification is unique within itself and cant be reused over and over again, to make sure somebody takes advantage of minting multiple tokens
    struct Solution {
        uint256 index;
        address owner;
    }

    // TODO define an array of the above struct
    Solution[] private solutions;

    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32=>bool) private solutionHashSubmitted; // solutionHash => exists

    // TODO Create an event to emit when a solution is added
    event SolutionAdded(uint256 index, address owner);
    event TokenMint(uint256 tokenId, address to);

    constructor(string memory name, string memory symbol, string memory baseTokenURI, address verifierAddress) ERC721Mintable(name, symbol, baseTokenURI) public    {
        verifier = Verifier(verifierAddress);
    }

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution
    (
        address owner,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    )
        public
    {
        bytes32 solutionHash = keccak256(abi.encodePacked(a,b,c,input));
        require(!solutionHashSubmitted[solutionHash], 'this solution is already added');

        bool verifierResult = verifier.verifyTx(a,b,c,input);
        require(verifierResult, 'the solution is failed for verification');

        uint256 currentIndex = solutions.length;

        Solution memory solution = Solution(currentIndex, owner);
        solutions.push(solution);

        solutionHashSubmitted[solutionHash]=true;

        emit SolutionAdded(currentIndex, owner);

    }


    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function mintNFT
    (
        address to,
        uint256 tokenId,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    )
    public
    {
        // Add solution to the array and mapping. In addSolution there are verify solution check and unique solution check
        addSolution(to, a, b, c, input);
        // Mint the token. Metadata are managed inside mint function
        super.mint(to, tokenId);
        // Emit proper event
        emit TokenMint(tokenId, to);
    }

}

contract Verifier{
    function verifyTx(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) public returns (bool r);
}



// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>

//TODO ml: zokrates from classroom + ERC721 token earlier.
//TODO ml: This verifier will be used to verify the proof that you create through the zokrates step.
//TODO ml: That will limit the ability for a user to mint a toke unless they have actually verified that they own that token.
//TODO ml: in this case, our tokens are our homes, before anyone can list a home on our marketplace, they will have to first ensure they own the property.
//TODO ml: They will be doing that through the verification using zokrates



// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
//TODO ml: create the SolnSquareVerifier inherits from ERC721Mintable token you created



// TODO define a solutions struct that can hold an index & an address
//TODO ml: create structs and mappings that help verify that only one verification was used at a time:
//TODO ml: ^ make sure each verification is unique within itself and cant be reused over and over again, to make sure somebody takes advantage of minting multiple tokens


// TODO define an array of the above struct


// TODO define a mapping to store unique solutions submitted



// TODO Create an event to emit when a solution is added



// TODO Create a function to add the solutions to the array and emit the event



// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSuplly

//TODO ml: create new mint function that only allow somebody to mint once they have passed through the verification process



//TODO ml: done with this file
//TODO ml: in between 2 steps: 1 fill out ERC721Mintable.sol, 2 combine that code and logic with the Zokrates that you would have compiled.
//TODO ml: In between, there will be tests. Next section square.code
//TODO ml: After generating the zokrates portion of the app which will auto-generate the verifier contract that is required to complete this project.
//TODO ml: to do ^, alter square.code
//TODO ml: square.code is a simpel proof written in th zokrates language. Just fill in variable name (Ex: result, a) there: first word (result_field_name) or character(a_field_name_
  


























