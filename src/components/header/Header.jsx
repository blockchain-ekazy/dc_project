

import { Link } from "react-router-dom"
import img from "./img/logo.png"
import "./header.css"
import { CgProfile } from "react-icons/cg";
import { AiOutlineSearch } from "react-icons/ai";
import MobileMenu from "./MobileMenu";
import Wallet from "./Wallet";
import WalletMenu from "./WalletMenu";
import { useState } from "react";
const Header = (props) => {
    const [canWalletClose, setCanWalletClose] = useState(false)
    const [canMenuClose, setCanMenuClose] = useState(false)
    return (
        <div className='headerWrap'>
            <nav className="navbar">
                <div className="logo-wrap">
                    <Link to="/">
                        <img className="logo" src={img} alt="" />
                    </Link>
                </div>
                <div className="full-menu-wrap">
                    <div className="search">
                        <div className="search-icon">
                            <AiOutlineSearch />
                        </div>
                        
                        <input className="menu-search-input" type="text" placeholder="Search items, collections, and accounts"/>
                    </div>
                    <div className="full-selection">
                        <div className="nav-btn">
                            <Link to="/market">Market</Link>
                        </div>
                        <div className="nav-btn">
                            <Link to="/items">My Items</Link>
                        </div>
                        <div className="nav-btn">
                            <Link to="/link">Link</Link>
                        </div>
                        <div className="mobile-search-wrap">
                            <AiOutlineSearch />
                        </div>
                        <div className="wallet-wrap">
                            <WalletMenu 
                                connect={props.connect}
                                connected={props.connected}
                                balance={props.balance}
                                account={props.account}
                                marketplace={props.marketplace}/>
                        </div>
                        <MobileMenu
                            connect={props.connect}
                            connected={props.connected}
                            balance={props.balance}
                            account={props.account}
                            width={props.width}
                            setCanMenuClose={setCanMenuClose}
                            canWalletClose={canWalletClose}
                            canMenuClose={canMenuClose}
                            marketplace={props.marketplace}/>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Header
