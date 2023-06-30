// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ERC721Enumerable.sol";
import "./Ownable.sol";

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string public baseURI;
    string public baseExtension = ".json";
    uint256 public cost;
    uint256 public maxSupply;
    uint256 public maxMintAmount;
    uint256 public allowMintingOn;
    bool public mintingPaused = false;
    uint256 public whiteListCount = 0;
    mapping(address => bool) public whiteListed;

    event Mint(uint256 amount, address minter);
    event Withdraw(uint256 amount, address owner);

    event AddToWhitelist(
        address user
    );

    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMintAmount,
        uint256 _allowMintingOn,
        string memory _baseURI
        ) ERC721(_name, _symbol) {
            cost = _cost;
            maxSupply = _maxSupply;
            maxMintAmount = _maxMintAmount;
            allowMintingOn = _allowMintingOn;
            baseURI = _baseURI;
    }

    function mint(uint256 _mintAmount) public payable {
        // Only allow minting after specified time
        require(block.timestamp >= allowMintingOn, "not time to mint yet");
        // Make sure minting is not paused
        require(mintingPaused == false, "minting is paused");
        require(whiteListCount > 0);
        require(whiteListed[msg.sender]);

        // Cannot mint more than the max mint amount
        require(_mintAmount <= maxMintAmount, "minting amount is greater than maximum allowed");
        // Must mint at least 1 token
        require(_mintAmount> 0, "minting amount is not > 0");
        // Require enough payment
        require(msg.value >= cost * _mintAmount, "payment is not enough");

        // Create a token
        uint256 supply = totalSupply();

        // Do not let them mint more tokens than available
        require(supply + _mintAmount <= maxSupply, "token amount greater than supply");

        // Create tokens
        for(uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }

        // Emit event
        emit Mint(_mintAmount, msg.sender);
    }
    // Return metadata IPFS url
    // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), 'token does not exist');
        return(string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)));
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

        // Owner functions

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success);

        emit Withdraw(balance, msg.sender);
    }
    
    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function pauseMinting(bool _mintingPaused) public onlyOwner {
        mintingPaused = _mintingPaused;
    }
    function addToWhiteList( address _whiteListAddress) public onlyOwner {
        whiteListCount ++;
        whiteListed[_whiteListAddress] = true;
        // Emit event
        emit AddToWhitelist(
            _whiteListAddress
        );
    }
}