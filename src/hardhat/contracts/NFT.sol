// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "./ERC721Enumerable.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DeloreanOriginals is ERC721Enumerable{
    uint public tokenID;
    uint maxMintAmount;

    struct Royalty{
        uint tokenID;
        address payable receiver;
        uint royaltyPercent;
    }
    
    mapping(uint => address) public whitelistAddress;
    mapping(uint => Royalty) public tokenIDtoRoyalty;
    address immutable owner;

    constructor() ERC721("Delorean Originals", "DLRN") payable {
        owner = msg.sender;
    }

    using Strings for uint256;

    // Optional mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    function setWhitelistAddress(uint _tokenID, address _whitelistAddress) public {
        require(IERC721(address(this)).ownerOf(_tokenID)== msg.sender, "Not Your Token");
        require(_whitelistAddress != address(0));
        whitelistAddress[_tokenID] = _whitelistAddress;
    }

    function removeWhitelistAddress(uint _tokenID) public {
        require(IERC721(address(this)).ownerOf(_tokenID)== msg.sender, "Not Your Token");
        whitelistAddress[_tokenID] = address(0);
    }

    function getWhitelistAddress(uint _tokenID) public view returns(address){
        return whitelistAddress[_tokenID];
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function mint(string memory _tokenURI, uint _royaltyPrc) external returns(uint){
        tokenID = tokenID + 1;
        Royalty memory royalty;
        royalty.royaltyPercent = _royaltyPrc;
        royalty.tokenID = tokenID;
        royalty.receiver = payable(msg.sender);
        tokenIDtoRoyalty[tokenID] = royalty;
        _safeMint(msg.sender, tokenID);
        _setTokenURI(tokenID, _tokenURI);
        return tokenID;
    }

    function checkRoyaltyReceiver(uint _tokenID, address payable _receiver) public {
        Royalty storage royalty = tokenIDtoRoyalty[_tokenID];
        if(royalty.receiver == address(0)){
            royalty.receiver = payable(_receiver);
            tokenIDtoRoyalty[_tokenID] = royalty;
        }
    }

    function getBalance() public view returns(uint){
        return ERC721.balanceOf(msg.sender);
    }

    function getTokenIds() public view returns (uint[] memory) {
        uint[] memory _tokensOfOwner = new uint[](ERC721.balanceOf(msg.sender));
        uint i;

        for (i=0;i<ERC721.balanceOf(msg.sender);i++){
            _tokensOfOwner[i] = ERC721Enumerable.tokenOfOwnerByIndex(msg.sender, i);
        }
        return (_tokensOfOwner);
    }

    function getRoyaltyReceiver(uint _tokenID) public view returns(address payable){
        return tokenIDtoRoyalty[_tokenID].receiver;
    }

    function getRoyaltyPercent(uint _token) public view returns(uint){
        return tokenIDtoRoyalty[_token].royaltyPercent;
    }
    
    function getRoyaltyAmount(uint _tokenID, uint soldAmount) public view returns(uint){
        require(tokenIDtoRoyalty[_tokenID].tokenID == _tokenID, "Token ID does not match");
        uint prc = tokenIDtoRoyalty[_tokenID].royaltyPercent;
        uint amt = (soldAmount * prc) / 100;
        return amt;
    }
}

