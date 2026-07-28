import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {

    return (
        <div className="footer-container">
            <footer className="footer">
                <div className='footer-logo'>
                    <img src="/images/LogoRobotwhite.png" alt="TRUST icon" className="footer-icon" />
                    <span> TRUST </span>
                </div>

                <div className='footer-links-group'>
                    <div className="quick-links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li onClick={() => onNavigate?.('overview')}> Home</li>
                            <li onClick={() => onNavigate?.('about')}>About</li>
                            <li onClick={() => onNavigate?.('playground')}> Playground</li>
                            <li onClick={() => onNavigate?.('dashboard')}> Dashboard</li>
                        </ul>
                    </div>

                    <div className="other-links">
                        <h3>Other Links</h3>
                        <ul>
                            <li><a href="https://github.com/bonnie-banjax/BotOrNot.git" target="_blank" rel="noreferrer">  GitHub</a> </li>
                            <li><a href="https://figma.com" target="_blank" rel="noreferrer"> Figma</a></li>
                        </ul>
                    </div>

                    <div className='built-with'>
                        <h3>Built With</h3>
                        <ul>
                            <li>    React </li>
                            <li>   Node.js/Express</li>
                            <li>   MongoDB Atlas</li>
                        </ul>
                    </div>
                </div>
            </footer >
        </div >
    )
}

export default Footer;