import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import "./profile.css"

const OwnedItems = ({ownedTokens, mrktContract, nftContract, account}) => {
    const [nftPrice, setNftPrice] = useState(0)
    const [isApproving, setIsApproving] = useState(false)
    const [isListing, setIsListing] = useState(false)
    const [whitelistEnabled, setWhiteListEnabled] = useState(false)
    const [getWhitelistAddress, setWhitelistAddress] = useState("")
    const [approved, setApproved] = useState("")
    const [isListed, setIsListed] = useState(false)
    const [isWhitelisting, setIsWhitelisting] = useState(false)
    const [currentID, setCurrentID] = useState(0)

    useEffect(() => {
        const callContract = async () => {
            if(account && mrktContract.address){
                const app = await nftContract.isApprovedForAll(account,mrktContract.address)
                setApproved(app)
            }
        }
        callContract()
    }, [isApproving,account, mrktContract.address])


    const approveMarket = async () => {
        try{
            setIsApproving(true)
            //add input for contract address and replace value below to approve NFTs from any collection
            const tx = await nftContract.setApprovalForAll(mrktContract.address, true)
            const receipt = await tx.wait()
            setIsApproving(false)
        }catch(err){
            setIsApproving(false)
            console.log("Error approving contract", err)
        }
    }

    const listNFT = async (e, tokenID) => {
        e.preventDefault()
        let isApproved;
        setCurrentID(tokenID)
        isApproved = await nftContract.isApprovedForAll(account,mrktContract.address)
        if(!isApproved){
            const tx = await nftContract.setApprovalForAll(mrktContract.address, true)
            const receipt = await tx.wait()
        }
        if(nftPrice > 0){
            if(whitelistEnabled){
                setIsWhitelisting(true)
                const whitelistAddress = await nftContract.getWhitelistAddress(tokenID)
                try{
                    const tx = await nftContract.setWhitelistAddress(tokenID, getWhitelistAddress)
                    const receipt = await tx.wait()
                }catch(err){
                    console.log(err)
                } 
                setIsWhitelisting(false)
            }
        
            try{
                setIsListing(true)
                const listingPrice = ethers.utils.parseEther(nftPrice.toString())
                //add input for contract address and replace value below to list NFTs from any collection
                const tx = await mrktContract.makeItem(nftContract.address, tokenID, listingPrice)
                const receipt = await tx.wait()
                setIsListed(true)
                setIsListing(false)
            }catch(err){
                setIsListing(false)
                console.log(err)
            }
        }
    }
    
    const toggleCheckbox = () =>{
        if(whitelistEnabled == true){
            setWhiteListEnabled(false)
        }else{
            setWhiteListEnabled(true)
        }
    }

    return (
        <div>
            <div className='sm-title mg2'>Owned Items</div>
            <div className='items-wrap'>
                {
                    ownedTokens.length > 0 ?
                    ownedTokens.map((item, index) => (
                    <div key={index} className="explore-card">
                        <div className='featured-card'>
                            <div className='item-img-wrap'>
                                <img className='feat-img' src={item.image} alt="" />
                            </div>
                            <div className='feat-info-wrap'>
                                <div className='pfp-info-wrap'>
                                    <div><strong>{item.name}</strong></div>
                                    <div>{item.description}</div>
                                </div>
                                <div>
                                    <div>Item ID: #{Number(item.tokenId)}</div>
                                </div>
                            </div>
                            <div>
                                <div className='listprice-input-wrap'>
                                    <div className='enable-invite-wrap'>
                                        <div>
                                            <input type="checkbox" onChange={toggleCheckbox}/>
                                        </div>
                                        <div>
                                            Enable Invite Only
                                        </div>
                                    </div>
                                    {
                                        whitelistEnabled ?
                                        <div>
                                            <div>
                                                <input className='listprice-input' type="text" placeholder='Enter Address' onChange={(e) => setWhitelistAddress(e.target.value)}/>
                                            </div>
                                        </div>
                                        :<></>
                                    }
                                    <input className='listprice-input' type="text" placeholder='Price in ETH' onChange={(e) => setNftPrice(e.target.value)}/>
                                </div>
                                {
                                    isListed && Number(item.tokenId) === currentID?
                                    <div>
                                        <button className='explore-buy-btn' disabled>Item Listed!</button>
                                    </div>
                                    : isListing && Number(item.tokenId) === currentID?
                                    <div>
                                        <button className='explore-buy-btn' disabled>Listing...</button>
                                    </div>
                                    : isWhitelisting && Number(item.tokenId) === currentID?
                                    <div>
                                        <button className='explore-buy-btn' disabled>Working...</button>
                                    </div>
                                    : isApproving?
                                    <div>
                                        <button className='explore-buy-btn' disabled>Initializing...</button>
                                    </div>
                                    : approved ?
                                    <div>
                                        <button className='explore-buy-btn' onClick={(e) => listNFT(e,Number(item.tokenId))}>List item</button>
                                    </div>
                                    :
                                    <div>
                                        <button className='explore-buy-btn' onClick={(e) => approveMarket()}>Initialize</button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    ))
                    :
                    <div>
                        No items to display
                    </div>
                }

            </div>
        </div>
        
    )
}

export default OwnedItems
