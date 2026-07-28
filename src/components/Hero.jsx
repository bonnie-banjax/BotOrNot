import React from 'react';
import './Hero.css';

export default function Hero({ onNavigate }){


return (
    <div className="hero-container">
        <div className="hero-banner-content">
            <h1> Expose Automated Threats Before They Strike</h1>
            <p> Store live session data, calculate rule-based threat scores, and pinpoint suspicious activity with complete transparency </p>
            <button className="hero-btn" onClick={() => onNavigate && onNavigate('about')}> Learn More </button>
        </div>
    </div>
);
}
