//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "erc721a/contracts/ERC721A.sol";

contract SampleContract is Ownable, ERC721A, ReentrancyGuard {
    constructor() ERC721A("SampleContract", "SC") {}

    // Mapping addresses to whitelist state 
    mapping(address => bool) public whitelist;

    // The baseURI for the token metadata
    string baseURI = "";

    // The root hash for the merkle tree being used to verify whitelist addresses
    bytes32 merkleRoot = "";

    //Sale state
    bool public initialSale = false;
    bool public reservedSale = false;

    // Team addresses
    address teamWallet;

    // Price of each token converted to WEI
    uint256 public price = 0.001 ether; // 0.06 ether

    // Token minting data
    uint16 constant MAX_SUPPLY = 6666; 
    uint16 constant MAX_MINT = 2; //2
    uint16 constant WHITELIST_NUMBER = 250; 

    // Function to call in order to update the initial sale state
    function setInitialSale(bool state) public onlyOwner {
        initialSale = state;
    }

    // Function to call in order to update the reserved sale state
    function setReservedSale(bool state) public onlyOwner {
        reservedSale = state;
    }

    // Internal contract function to retreive the base URI
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // Function used to update the baseURI
    function updateBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    // Modifier for saleIsOpen function checks if certain conditions are met.
    modifier saleIsOpen() {
        require(totalSupply() <= MAX_SUPPLY, "Soldout!");
        require(initialSale, "Sales not open");
        _;
    }

    // Modifier for whitelistIsOpen function checks if certain conditions are met.
    modifier whitelistIsOpen() {
        require(totalSupply() <= MAX_SUPPLY, "Soldout!");
        require(reservedSale, "Sales not open");
        _;
    }

    // Function for minting a token when the public sale is open (takes amount)
    function mintSaleToken(uint16 _amount) public payable {
        uint16 supply = uint16(totalSupply());
        require(supply < MAX_SUPPLY, "Soldout!");
        require(initialSale, "Sales not open");
        require(_amount <= MAX_MINT, "You can only Mint 2 tokens at once");
        require(
            balanceOf(msg.sender) + supply + _amount <=
                MAX_SUPPLY - WHITELIST_NUMBER,
            "Cannot mint more than max supply"
        );
        require(msg.value == price * _amount, "Wrong amount of ETH sent");
        _safeMint(msg.sender, _amount);
    }


    // Function for minting a token when the reserved sale is open (Should only be called through the appropriate website)
    function mintReservedToken(bytes32[] calldata proof)
        public
    {
        uint16 supply = uint16(totalSupply());
        require(supply < MAX_SUPPLY, "Soldout!");
        require(reservedSale, "Sales not open");
        require(
            !whitelist[msg.sender],
            "You have already claimed your token."
        );
        bytes32 leafNode = keccak256(abi.encodePacked(msg.sender));
        require(
            processProof(proof, leafNode) == merkleRoot,
            "You do not have sufficient permission to access this function."
        );
        _safeMint(msg.sender, 1);
        whitelist[msg.sender] = true;
    }

    // Withdraws amount from contract balance
    function withdraw(uint256 _amount) public payable onlyOwner {
        require(payable(teamWallet).send(_amount));
    }

    // Function to update mint price 
    function updateMintPrice(uint256 _newPrice) external onlyOwner {
        price = _newPrice;
    }

    // Functions to update the wallet addresses for both the team & community wallets
    function updateTeamWallet(address wallet) public onlyOwner {
        teamWallet = wallet;
    }

    // Returns the IDs of tokens owned by an account
    function tokensOfOwner(address addr)
        public
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(addr);
        uint256[] memory tokensId = new uint256[](tokenCount);
        for (uint256 i; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(addr, i);
        }
        return tokensId;
    }


    // Functions used to verify & update the MerkleProof (Taken from OpenZepplin MerkleProof)

    function updateMerkleRoot(bytes32 _rootHash) public onlyOwner {
        merkleRoot = _rootHash;
    }

    /**
     * @dev Returns the rebuilt hash obtained by traversing a Merkle tree up
     * from `leaf` using `proof`. A `proof` is valid if and only if the rebuilt
     * hash matches the root of the tree. When processing the proof, the pairs
     * of leafs & pre-images are assumed to be sorted.
     *
     * _Available since v4.4._
     */
    function processProof(bytes32[] memory proof, bytes32 leaf)
        internal
        pure
        returns (bytes32)
    {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = _efficientHash(computedHash, proofElement);
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = _efficientHash(proofElement, computedHash);
            }
        }
        return computedHash;
    }

    function _efficientHash(bytes32 a, bytes32 b)
        private
        pure
        returns (bytes32 value)
    {
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }
}
