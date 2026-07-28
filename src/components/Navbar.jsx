import './Navbar.css';
import React from 'react';

export default function Navbar({ onNavigate, onOpenTelemetry }) {
    return ( //add the onNavigate function to App.jsx
        <nav className="navbar">
            <div className="logo" onClick={() => onNavigate?.('overview')}>
                <img src="/images/LogoRobotblack.png" alt="TRUST icon" className="nav-icon" />
                <span> TRUST </span>
            </div>

            <ul className="nav-links">
                <li>
                    <a href="#overview" onClick={(e) => { e.preventDefault(); onNavigate?.('overview'); }}>
                        Overview
                    </a>
                </li>
                <li>
                    <a href="#about" onClick={(e) => { e.preventDefault(); onNavigate?.('about'); }}>
                        About
                    </a>
                </li>
                <li>
                    <a href="#playground" onClick={(e) => { e.preventDefault(); onNavigate?.('playground'); }}>
                        Playground
                    </a>
                </li>
                <li>
                    <a href="#dashboard" onClick={(e) => { e.preventDefault(); onOpenTelemetry?.(); }}>
                        Dashboard
                    </a>
                </li>
            </ul>
        </nav>
    );
}