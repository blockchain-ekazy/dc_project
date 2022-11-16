import React from 'react'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'
import "./invite.css"
import { Link } from 'react-router-dom';

const Invite = (props) => {
  const path = window.location.pathname;
  const pathData = path.split("/").filter(e => e)
  const urlAddress = pathData[1]
  const urlTokenID = pathData[2]
  const urlItemID = pathData[3]
  const mrktContract = props.marketplace;
  const nftContract = props.nft;
  const zeroAccount = "0x0000000000000000000000000000000000000000"
  const [isWhitelistAccount, setIsWhitelistAccount] = useState(false)
  const [isZeroAccount, setIsZeroAccount] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [urlMatch, setUrlMatch] = useState(true)
  const [isSeller, setIsSeller] = useState(true)
  const [whitelistItem, setWhitelistItem] = useState("")
  const [name, setName] = useState(false)
  const [royaltyReceiver, setRoyaltyReceiver] = useState(0)
  const [royaltyPercent, setRoyaltyPercent] = useState(0)

  const getContractData = async () => {
    setIsLoading(true)
    if(!nftContract || !mrktContract) return;
  
    const n = await nftContract.name()
    const whitelistAddress = await nftContract.getWhitelistAddress(urlTokenID);
    if(whitelistAddress === zeroAccount){
      setIsZeroAccount(true)
    }else{ 
      const item = await mrktContract.IDtoItem(urlItemID)
      if(!item.sold){
        const uri = await nftContract.tokenURI(item.tokenID)
        const response = await fetch(uri)
        const metadata = await response.json()
        const totalPrice = await mrktContract.getTotalPrice(Number(item.itemID))
        const rr = await nftContract.getRoyaltyReceiver(item.tokenID)
        const rprc = await nftContract.getRoyaltyPercent(item.tokenID)
        if(rr != "0x0000000000000000000000000000000000000000"){
          setRoyaltyReceiver(rr)
        }
        setRoyaltyPercent(rprc)
        setWhitelistItem({
          totalPrice,
          itemID: item.itemID,
          seller: item.seller,
          sold: item.sold,
          whitelistAddress: item.whitelistAddress,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        })
      }
      if(whitelistAddress ===  props.account){
        if(whitelistAddress === urlAddress){
          if(whitelistAddress === item.whitelistAddress){
            setUrlMatch(true)
            setIsWhitelistAccount(true)
            setIsZeroAccount(false)
          }else if(item.whitelistAddress === zeroAccount){
            setIsZeroAccount(true)
          }
        }else{ setUrlMatch(false) }
      }else {
        if(item.seller === props.account){ 
          setIsSeller(true)}else{ 
            setIsSeller(false) 
          }
        setIsWhitelistAccount(false)
      }
    }
    setName(n)
    setIsLoading(false)
  }

  useEffect(() => {
    getContractData()
  }, [mrktContract, nftContract, props.account])


  const buyMarketItem = async (item) => {
    const order = await mrktContract.purchaseItem(item.itemID, {value: item.totalPrice })
    getContractData()
    return order
  }
  return (
    <div>
      <div className='sec-title mg2'>
        Invite Only
      </div>
      {
        isLoading ?
        <div>
          Loading...
        </div>
        : whitelistItem ?
          <div>
            {
              !urlMatch ?
              <div>
                URL Account Does not match whitelist Account
              </div>
              :<></>
            }
            {
              isZeroAccount ?
              <div>NFT is public</div>
              :<></>
            }
            <div className='invite-user-msg'>
              <div className='invite-user-inner'>
                {
                  isWhitelistAccount ?
                  <div className='invite-alert-card invite-ok'>
                    <div>You have been invited to purchase this NFT from:</div>
                    <div>{whitelistItem.seller}</div>
                  </div>
                  :
                  isSeller ?
                  <div className='invite-alert-card invite-ok'>
                    <div><strong>You are the Owner</strong></div>
                    <div><strong>Whitelisted:</strong> {whitelistItem.whitelistAddress}</div>
                  </div>
                  :
                  <div className='invite-alert-card invite-alert'>
                    <strong>You are NOT Authorized to purchase this NFT.</strong>
                  </div>
                }
              </div>
            </div>
            {
              urlMatch && !isZeroAccount ?
                <div className="invite-card">
                  <div className='featured-card'>
                    {
                      royaltyReceiver ?
                      <div className='buynow-action'>
                        {Number(royaltyPercent)}% Royalties 
                      </div>
                      :
                      <div className='buynow-action'>
                        Buy Now to start receiving {Number(royaltyPercent)}% royalties!
                      </div>
                    }
                    <div className='ex-img-wrap'>
                      <img className='feat-img' src={whitelistItem.image} alt="" />
                    </div>
                    <div className='feat-info-wrap'>
                      <div className='pfp-info-wrap'>
                        <div>
                          <div><strong>{whitelistItem.name}</strong></div>
                          <div>{name}</div>
                          {
                            royaltyReceiver ?
                            <div>
                              <small>Royalty Receiver: {royaltyReceiver}</small>
                            </div>
                            :
                            <></>
                          }
                        </div>
                      </div>
                      <div>
                        <div>ID: #{Number(whitelistItem.itemID)}</div>
                      </div>
                    </div>
                    <div>
                      {
                        whitelistItem ?
                        <button className='explore-buy-btn' onClick={(e)=>buyMarketItem(whitelistItem)}>
                          Buy For {ethers.utils.formatEther(Number(whitelistItem.totalPrice).toString())} ETH
                        </button>
                        :<></>
                      }
                    </div>
                  </div>
                </div>
              :<></>
            }
            
          </div>
        : 
        <div>
          <div>Thank you for your purchase!</div>
          <div>
            View your Item <Link to={`/profile/${props.account}`}>Here</Link>
          </div>
        </div>
      }
    </div> 
  )
}

export default Invite