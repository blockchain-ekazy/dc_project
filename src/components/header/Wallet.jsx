import React from 'react'
import { FaUserCircle } from "react-icons/fa";
import fox from "./img/fox.svg"
import { useState, useEffect } from "react";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { ethers } from 'ethers';
const Wallet = (props) => {
    const mrktContract = props.marketplace
    const [royalties, setRoyalties] = useState(0)

    useEffect(() => {
        const getContractData = async () => {
            if(mrktContract && props.account){
                try{
                    if(props.connected){
                        const royaltiesReceived = await mrktContract.getRoyaltiesRecieved()
                        setRoyalties(ethers.utils.formatEther(royaltiesReceived))
                    }
                }catch(err){
                    console.log(err)
                }
            }
        }
        getContractData()
    }, [props.account, mrktContract])
    
    return (
        <div className="mobile-wallet-wrap">
            <div className='wallet-sidenav-wrap'>
                <div className='wallet-title-wrap'>
                    <div className='menu-icon'>
                        <FaUserCircle />
                    </div>
                    <div className='my-wallet'>My Wallet</div>
                </div>
                
                {
                    props.connected ?
                    <div>
                        {props.account.slice(0,2)+"..."+props.account.slice(38,43)}
                    </div>
                    :<></>
                }
            </div>
            {
            props.connected ?
            <div className='wallet-connected-wrap'>
                <div className='balance-wrap'>
                    <div>Total Balance</div>
                    <div>{props.balance} ETH</div>
                </div>
                <div className='balance-wrap'>
                    <div>Royalties Received</div>
                    <div>{royalties} ETH</div>
                </div>
            </div>
            :
            <div className='wallet-connect-wrap'>
                <div>
                Connect with one of our available wallet providers or create a new one.
                </div>
                <div className='connect-wrap'>
                <div>
                    <button className='connect-btn' onClick={props.connect}>
                    <img className='connect-img' src={fox} alt="" />
                    </button>
                </div>
                
                </div>
            </div>
            }
        </div>
    )
}

export default Wallet