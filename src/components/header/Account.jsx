import React from 'react'
import './header.css'

const Account = (props) => {
    if(props.account){
        return (
            <div>
                <div className="account">{props.account}</div>
            </div>
        )
    }else{
        return <></>
    }
    
}

export default Account
