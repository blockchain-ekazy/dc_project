import React from 'react'

const ListedItems = ({getItems, mrktContract}) => {

    const deListNFT = async (itemId) => {
        if(mrktContract){
            await mrktContract.deListItem(itemId)
        }
    }

    return (
        <div className='items-wrap'>
            {
            getItems.length > 0 ?
                getItems.map((item, index) => (
                <div key={index} className="explore-card">
                    <div className='featured-card'>
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
                                <div>Item ID: # {Number(item.tokenId)}</div>
                            </div>
                        </div>
                        <div>
                            <button className="explore-buy-btn" onClick={(e) => deListNFT(item.itemId)}>
                                Delist
                            </button>
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
    )
}

export default ListedItems
