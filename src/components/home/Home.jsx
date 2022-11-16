import React from 'react'
import Showcase from './showcase/Showcase'
import Featured from './featured/Featured'
const Home = (props) => {
    const mrktContract = props.marketplace;
    const nftContract = props.nft;
    return (
        <div>
            <div className="showcase-feat">
                <Showcase />
                <Featured 
                    mrktContract={mrktContract}
                    nftContract={nftContract}/>
            </div>
        </div>
    )
}

export default Home