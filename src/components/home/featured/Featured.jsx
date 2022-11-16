import React from 'react'
import "./feat.css"
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
const Featured = (props) => {
    const mrktContract = props.mrktContract;
    const nftContract = props.nftContract;
    const [royaltyReceiver, setRoyaltyReceiver] = useState(0)
    const [royaltyPercent, setRoyaltyPercent] = useState(0)
    const [featuredItems, setFeaturedItems] = useState(0)
    const [getContractName, setContractName] = useState("")

    const buyMarketItem = async (item) => {
        const order = await mrktContract.purchaseItem(Number(item.itemID), {value: item.totalPrice })
        return order
    }

    useEffect(() => {
        const getContractData = async () => {
            if(nftContract){
                const nftID = await mrktContract.getNFTCount()
                let featured = {}
                for(let i=1; i <= Number(nftID); i++){
                    const nft = await mrktContract.IDtoItem(Number(nftID))
                    if(!nft.sold){
                        const uri = await nftContract.tokenURI(nft.tokenID)
                        const response = await fetch(uri)
                        const metadata = await response.json()
                        const totalPrice = await mrktContract.getTotalPrice(Number(nft.itemID))
                        const rr = await nftContract.getRoyaltyReceiver(nft.tokenID)
                        const rprc = await nftContract.getRoyaltyPercent(Number(nft.tokenID))
                        const contractName = await nftContract.name()
                        setContractName(contractName)
                        if(!nft.sold){
                            setRoyaltyPercent(rprc)
                            featured.price = Number(totalPrice);
                            featured.itemID = Number(nft.itemID);
                            featured.seller = nft.seller
                            featured.name = metadata.name;
                            featured.description = metadata.description;
                            featured.image = metadata.image
                        }else{
                            setRoyaltyReceiver(rr);
                        }
                    }
                }
                setFeaturedItems(featured)
            }
        }
        getContractData()
    }, [nftContract, mrktContract])
    
    return (
        <div className='featured'>
            {
                featuredItems.image ?
                <div>
                    <div className='featured-card'>
                        {
                        royaltyReceiver ?
                        <div className='buynow-action'>
                            {Number(royaltyPercent)}% Royalties 
                        </div>
                        :<></>
                        }
                        <div className='feat-img-wrap'>
                            <img className='feat-img' src={featuredItems.image} alt="" />
                        </div>
                        <div className='feat-info-wrap'>
                            <div className='pfp-info-wrap'>
                                <div>
                                    <div>{featuredItems.name}</div>
                                    <div>{getContractName}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <button className='explore-buy-btn' onClick={(e)=>buyMarketItem(featuredItems)}>
                                Buy For {ethers.utils.formatEther(Number(featuredItems.price).toString())} ETH
                            </button>
                        </div>
                    </div>
                    <div className='mg2 learn-more'>
                        <div>
                            <button className='next-icon green-icon'>{'>'}</button>
                        </div>
                        <div>
                            <a href="">Learn more about DeloreanCodes</a>
                        </div>
                    </div>
                </div>
                :<></>
            }
            
            
        </div>
    )
}

export default Featured