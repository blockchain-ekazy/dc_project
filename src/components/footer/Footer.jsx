
import React from 'react'
import "./footer.css"
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div id='footer' className='footer'>
      <div className='footer-menu'>
        <div>
          <Link to="/contact">Contact Us</Link>
        </div>
        <div>
          <a href="">Get Codes</a>
        </div>
        <div>
          <a href="">Terms</a>
        </div>
      </div>
      <div>Delorean Codes &#169; 2022</div>
    </div>
  )
}

export default Footer