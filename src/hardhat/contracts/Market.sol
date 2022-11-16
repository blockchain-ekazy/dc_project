// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFT.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract DeloreanCodes is ReentrancyGuard{

    address payable internal immutable feeAccount;
    uint internal immutable feePercent;
    address internal immutable owner;
    address public ogNFTContract;
    uint internal itemID;
    
    struct Item{
        uint itemID;
        IERC721 nft;
        uint tokenID;
        uint price;
        address payable seller;
        bool sold;
        uint royalty;
        address whitelistAddress;
        address payable royaltyAddress;
    }

    event Offered(
        uint itemID,
        address indexed nft,
        uint tokenID,
        uint price,
        address indexed seller
    );

    event Bought (
        uint itemID,
        address indexed nft,
        uint tokenID,
        uint price,
        address seller,
        address buyer
    );

    Item[] internal userItems;
    Item[] internal senderToWhitelistItems;

    mapping(uint => Item) public IDtoItem;
    mapping(address => Item[]) internal allUserItems;
    mapping(address => Item[]) internal allSenderWhitelistItems;
    mapping(address => Item[]) internal userSoldItems;

    mapping(address => uint) internal userToRoyaltiesReceived;

    constructor (address _ogNFTContract) payable {
        owner = msg.sender;
        feeAccount = payable(msg.sender);
        feePercent = 1;
        ogNFTContract = _ogNFTContract;
    }

    function getNFTCount() public view returns(uint){
        return itemID;
    }

    function makeItem(IERC721 _nft, uint _tokenID, uint _price) external nonReentrant {
        require(_price > 0, "price must be greater than 0");
        DeloreanOriginals ogs = DeloreanOriginals(ogNFTContract);
        address whitelistAddress = ogs.getWhitelistAddress(_tokenID);
        address payable receiver = ogs.getRoyaltyReceiver(_tokenID);
        itemID ++;
        _nft.transferFrom(msg.sender, address(this), _tokenID);
        Item memory newNFT;
        newNFT.itemID = itemID;
        newNFT.nft = _nft;
        newNFT.tokenID = _tokenID;
        newNFT.price = _price;
        newNFT.seller = payable(msg.sender);
        newNFT.sold = false;
        newNFT.royaltyAddress = payable(receiver);
        newNFT.whitelistAddress = whitelistAddress;
        if(whitelistAddress != address(0)){
            allSenderWhitelistItems[msg.sender].push(newNFT);
        }else{
            allUserItems[msg.sender].push(newNFT);
        }   
        IDtoItem[itemID] = newNFT;
        emit Offered(itemID, address(_nft), _tokenID, _price, msg.sender);
    }

    function removeWhitelistSeller(uint256 index, address seller) private {
        if (index >= allSenderWhitelistItems[seller].length) return;

        for (uint i = index; i< allSenderWhitelistItems[seller].length-1; i++){
            allSenderWhitelistItems[seller][i] = allSenderWhitelistItems[seller][i+1];
        }
        allSenderWhitelistItems[seller].pop();
    }

    function removeWhitelistItem(uint _itemID) private {
        Item storage item = IDtoItem[_itemID];
        uint index;    
        for(uint i=0;i <= allSenderWhitelistItems[item.seller].length - 1; i++){
            if(allSenderWhitelistItems[item.seller][i].itemID == item.itemID){
                index = i;
            }
        }
        removeWhitelistSeller(index, item.seller);
    }

    function removeSeller(uint256 index, address seller) private {
        if (index >= allUserItems[seller].length) return;

        for (uint i = index; i<allUserItems[seller].length-1; i++){
            allUserItems[seller][i] = allUserItems[seller][i+1];
        }
        allUserItems[seller].pop();
    }

    function removeSellerItem(uint _itemID) private {
        Item storage item = IDtoItem[_itemID];
        uint index;    
        for(uint i=0;i <= allUserItems[item.seller].length - 1; i++){
            if(allUserItems[item.seller][i].itemID == item.itemID){
                index = i;
            }
        }
        removeSeller(index, item.seller);
    }
    
    function purchaseItem(uint _itemID) external payable nonReentrant {
        Item storage item = IDtoItem[_itemID];
        require(_itemID > 0 && _itemID <= itemID,"item does not exist");
        require(msg.value >= item.price, "not enough ether sent");
        require(msg.sender != item.seller, "Can not purchase your item");
        require(!item.sold, "item already sold");
        
        // set price after fee
        uint startPrice = item.price;
        uint feeAmount = getFeeAmount(item.price);
        uint secondPrice = item.price - feeAmount;
        

        //load delorean originals, load or save royalty receive address 
        DeloreanOriginals ogs = DeloreanOriginals(ogNFTContract);
        ogs.checkRoyaltyReceiver(item.tokenID, payable(item.seller));
        address payable receiver = ogs.getRoyaltyReceiver(item.tokenID);
        item.royaltyAddress = payable(receiver);
        address whitelistAddress = ogs.getWhitelistAddress(item.tokenID);

        if(whitelistAddress != address(0)){
            require(msg.sender == whitelistAddress, "Not Authorized.");
        }
        // update variables
        item.sold = true;
        userSoldItems[item.seller].push(item);

        //pay marketplace fees
        feeAccount.transfer(feeAmount);

        uint royaltyAmount = ogs.getRoyaltyAmount(item.tokenID, startPrice);
        uint finalPrice = secondPrice - royaltyAmount;

        // pay seller
        if(item.royaltyAddress != item.seller){
            userToRoyaltiesReceived[item.royaltyAddress] = userToRoyaltiesReceived[item.royaltyAddress] + royaltyAmount;
            item.royaltyAddress.transfer(royaltyAmount);
        }else{
            finalPrice = secondPrice;
        }
        item.seller.transfer(finalPrice);

        //send nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenID);

        // remove item from sellers listing
        if(whitelistAddress != address(0)){
            removeWhitelistItem(_itemID);
        }else{
            removeSellerItem(_itemID);
        }
        
        //emit event
        emit Bought(
            _itemID,
            address(item.nft),
            item.tokenID,
            item.price,
            item.seller,
            msg.sender
        );
    }

    

    function deListItem(uint _itemID) public {
        Item storage item = IDtoItem[_itemID];
        require(item.seller == msg.sender, "you are not the seller");
        DeloreanOriginals ogs = DeloreanOriginals(ogNFTContract);
        ogs.removeWhitelistAddress(item.tokenID);
        item.nft.transferFrom(address(this), item.seller, item.tokenID);
        // remove item from sellers listing
        if(item.whitelistAddress != address(0)){
            removeWhitelistItem(_itemID);
            item.whitelistAddress = address(0);
        }else{
            removeSellerItem(_itemID);
        }
        delete IDtoItem[_itemID];
    }

    // VIEW FUNCTIONS

    function getRoyaltiesRecieved() public view returns(uint){
        return userToRoyaltiesReceived[msg.sender]; 
    }

    function getSenderWhitelist() public view returns(Item[] memory){
        return allSenderWhitelistItems[msg.sender];
    } 

    function getTotalPrice(uint _itemID) view public returns(uint){
        return IDtoItem[_itemID].price;
    }

    function getAllUserItems() public view returns(Item[] memory){
        return allUserItems[msg.sender];
    }

    function getAllSoldItems() public view returns(Item[] memory){
        return userSoldItems[msg.sender];
    }

    function getFeeAmount(uint soldAmount) internal view returns(uint){
        uint amt = (soldAmount * feePercent) / 100;
        return amt;
    }
}