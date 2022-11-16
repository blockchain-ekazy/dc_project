import React from 'react'
import { useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
const InviteOnly = ({mrktContract, nftContract}) => {
    const [getWhitelist, setWhitelist] = useState([])
    useEffect(() => {
        const getContractData = async () =>{
            if(mrktContract){
                const whitelistItems = await mrktContract.getSenderWhitelist()
                const data = JSON.parse(JSON.stringify(whitelistItems));
                for(let i=0; i <= whitelistItems.length; i++){
                    if(whitelistItems[i]){
                    const uri = await nftContract.tokenURI(whitelistItems[i].tokenID)
                    const response = await fetch(uri)
                    const metadata = await response.json()
                    data[i]['whitelistAddress'] = whitelistItems[i]['whitelistAddress']
                    data[i]['itemID'] = whitelistItems[i]['itemID']
                    data[i]['tokenID'] =whitelistItems[i]['tokenID']
                    data[i]['image'] = metadata.image
                    data[i]['name'] = metadata.name
                    data[i]['description'] = metadata.description
                    }
                }
                setWhitelist(data)
            }
            
            
        }
        getContractData()
    }, [nftContract])
    
    const deListNFT = async (itemId) => {
        if(mrktContract){
            await mrktContract.deListItem(itemId)
        }
    }
    return (
        <div className='items-wrap'>
            {
                getWhitelist.length > 0 ?
                    getWhitelist.map((item, index) => (
                        <div key={index} className='inviteonly-items-wrap'>
                            <div key={index} className='featured-card'>
                                <div className='items-img-wrap'>
                                    <img className='feat-img' src={item.image} alt="" />
                                </div>
                                <div className='feat-info-wrap'>
                                    <div className='pfp-info-wrap'>
                                        <div>
                                            <div><strong>{item.name}</strong></div>
                                            <div>{item.description}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div>Token ID: # {Number(item.tokenID)}</div>
                                        <div>Item: # {Number(item.itemID)}</div>
                                    </div>
                                    
                                </div>
                                <div className='whitelist-info pd1'>
                                    <div className='whitelist-account-wrap'>
                                        <div>
                                        <strong>Whitelisted Account</strong> 
                                        </div>
                                        <div>
                                            {item.whitelistAddress}
                                        </div>
                                    </div>
                                    <div className='invitelink-wrap'>
                                        <div>
                                            <strong>Invite Link</strong>  
                                        </div>
                                        <div>
                                            <Link to={`/invite/${item.whitelistAddress}/${Number(item.tokenID)}/${Number(item.itemID)}`}>{window.location.origin}/invite/{item.whitelistAddress}/{Number(item.tokenID)}/{Number(item.itemID)}</Link>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button className="explore-buy-btn" onClick={(e) => deListNFT(item.itemID)}>
                                        DeList
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                :
                <div>
                    No NFTs to display
                </div>
            }
        </div>
    )
}

export default InviteOnly