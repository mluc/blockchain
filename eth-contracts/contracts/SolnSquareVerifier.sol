pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";

contract SolnSquareVerifier is ERC721Mintable{
    Verifier verifier;

    // TODO define a solutions struct that can hold an index & an address
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
