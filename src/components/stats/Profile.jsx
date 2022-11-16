import React from 'react'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import ListedItems from './ListedItems'
import OwnedItems from './OwnedItems'
import InviteOnly from './InviteOnly'

const Profile = (props) => {
  const [getItems, setItems] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [ownedTokens,setOwnedTokens] = useState([])
  const [getWhitelistItems, setWhitelistItems] = useState([])

  const mrktContract = props.marketplace;
  const nftContract = props.nft;
  const account = props.account;

  const loadUserItems = async () => {
    setLoading(true)
    if(nftContract && mrktContract){
      const userItems = await mrktContract.getAllUserItems()
      const whitelistItems = await mrktContract.getSenderWhitelist()
      const tokens = await nftContract.getTokenIds()
      const bal = await nftContract.balanceOf(account)
      const data = JSON.parse(JSON.stringify(userItems));
      for(let i=0; i <= userItems.length; i++){
        if(userItems[i]){
          const uri = await nftContract.tokenURI(userItems[i].tokenID)
          const response = await fetch(uri)
          const metadata = await response.json()
          data[i]['itemId'] = userItems[i]['itemID']
          data[i]['tokenId'] =userItems[i]['tokenID']
          data[i]['image'] = metadata.image
          data[i]['name'] = metadata.name
          data[i]['description'] = metadata.description
        }
      }

      const owned = [];
      for(let i=0; i<=tokens.length; i++){
        if(tokens[i]){
          const uri = await nftContract.tokenURI(tokens[i])
          const response = await fetch(uri)
          const metadata = await response.json()
          const temp = {}
          if(metadata){
            temp['image'] = metadata.image
            temp['name'] = metadata.name
            temp['description'] = metadata.description
            temp['tokenId'] = tokens[i]
          }
          owned.push(temp)
        }
      }
      setOwnedTokens(owned)
      setItems(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUserItems()
  }, [props.account])

  return (
    <div>
      <div className='sm-title mg2'>Publicly Listed Items</div>
        <div>
          <ListedItems 
          getItems={getItems}
          mrktContract={mrktContract}/>
        </div>
      <div>
      <div className='sm-title mg2'>Invite Only Items</div>
        <div>
          <InviteOnly
            nftContract={nftContract}
            mrktContract={mrktContract}/>
        </div>
      </div>
    </div>
  )
}

export default Profile