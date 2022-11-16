import React from 'react'
import { Link } from 'react-router-dom'
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import Wallet from './Wallet';
const WalletMenu = (props) => {

    const mrktContract = props.marketplace
    const openRightNav = async (e) => {
        const mobileClass = document.getElementById("wallet-mySidenav").classList
        const walletClass = document.getElementById("wallet-mySidenav").classList
        const fullwidth = mobileClass.contains('mm-width-full')
        const halfwidth = mobileClass.contains('mm-width-420')
        if(props.width < 1025){
            if(halfwidth){
                mobileClass.remove('mm-width-420')
                mobileClass.add('mm-width-0')
                return
            }
            if(fullwidth){
                mobileClass.remove('mm-width-full')
                mobileClass.add('mm-width-0')
            }else{
                mobileClass.toggle('mm-width-full')
            }
            // document.getElementById("cover").classList.toggle('hide');
            // document.getElementById("main-wrap").classList.toggle('blur');
        }else{
            if(fullwidth){
                mobileClass.remove('mm-width-full')
                mobileClass.add('mm-width-0')
            }
            if(halfwidth){
                mobileClass.remove('mm-width-420')
                mobileClass.add('mm-width-0')
            }else{
                mobileClass.toggle('mm-width-420')
            }
        }
        document.getElementById("cover").classList.toggle('hide');
        document.getElementById("main-wrap").classList.toggle('blur');
        document.getElementById("footer").classList.toggle('blur');
    }
    return (
        <div>
            <div className="wallet-wrap">
                <button id="menu-icon-btn" className="nav-icon" data-type="menu" onClick={async (e) => {
                    await openRightNav(e) 
                }} >
                    <MdOutlineAccountBalanceWallet/>
                </button>
                <div id={`wallet-mySidenav`} className={`mobile-sidenav mobile-right-sidenav`}>
                    <Wallet 
                        connect={props.connect}
                        connected={props.connected}
                        balance={props.balance}
                        account={props.account}
                        marketplace={mrktContract}/>
                </div>
            </div>
        </div>
    )
}

export default WalletMenu