import React from "react";
import './Playground.css';

function Playground( {onNavigate }) {
    return (
        <div className="playground-container" id="playground">
            <div className="white-box">
                <h1>Interactive Playground</h1>
                <p> Instructions: Type a sentence to test typing speed tracking.</p>
                <form className="playground-form" onSubmit={(e) => e.preventDefault()}>
                    <input type="text" id="finput" className="playground-input" placeholder="Type a message here..." />
                    <button className="playground-btn" type="submit" onClick={() => onNavigate && onNavigate('playground')}> Test bot detection </button>
                </form>
            </div>

            <div className="blue-box">
                <h1> Real-Time Telemetry Feed</h1>
                <div className="telemetry-info">
                    <p>Session ID: #sf_8921a_mongo</p>
                    <p>Browser Specs: Chrome 126 (macOS)</p>
                    <p>Typing Speed: 62 WPM (Human Pattern)</p>
                    <p>Mouse Trajectory: 1,420px (Curved Vector)</p>
                    <p>Clicks Detected: 3</p>
                </div>
                <hr className="divider"/>
                <div className="risk-score-display">
                    <span> CURRENT RISK SCORE </span>
                </div>
                <div className="status-badge">
                    <span> [12/100] </span>
                    <span className="green-dot"> </span>
                    <span> LOW RISK (HUMAN) </span>
                </div>
            </div>
        </div>
    );
}

export default Playground;