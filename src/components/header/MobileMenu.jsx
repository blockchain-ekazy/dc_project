import React from 'react'
import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Wallet from './Wallet';
import { Link } from 'react-router-dom';

const MobileMenu = (props) => {
    const openRightNav = async (e) => {
        const mobileClass = document.getElementById("mobile-menu-mySidenav").classList
        const walletClass = document.getElementById("mobile-menu-mySidenav").classList
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
        <div className="mobile-menu-wrap">
            <button id="menu-icon-btn" className="nav-icon" data-type="menu" onClick={async (e) => {
                await openRightNav(e) 
            }} >
                <GiHamburgerMenu/>
            </button>
            <div id={`mobile-menu-mySidenav`} className={`mobile-sidenav mobile-right-sidenav`}>
                <Wallet 
                    connect={props.connect}
                    connected={props.connected}
                    balance={props.balance}
                    account={props.account}/>
                <div className='sidenav-menu-wrap'>
                    <div className='menu-wrap'>
                        <Link to="/market">Market</Link>
                        <Link to="/items">Items</Link>
                        <Link to="/link">Link</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MobileMenu