import React from 'react'
import { Link } from 'react-router-dom'
import "./showcase.css"

const Showcase = () => {
    return (
        <div className='showcase'>
            <div className='main-txt'>
                Purchase and create royalty-linked items! 
            </div>
            <div className='sec-txt'>
                Delorean Codes is the world’s first, royalty-incorporated gateway between physical goods and blockchain technology
            </div>
            <div className="show-btn-wrap">
                <Link to="/link" className="btn showcase-btn light-btn">Link to Code</Link>
            </div>
        </div>
    )
}

export default Showcase