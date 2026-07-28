import React, { useState } from "react";
import calculateRisk from "../utils/calculateRisk";
import './Playground.css';

export default function Playground({ telemetry, behavior, onNavigate }) {
    const [message, setMessage] = useState('');
    const [typingSpeed, setTypingSpeed] = useState(null);

    const riskResult = calculateRisk(telemetry, behavior);
    const score = riskResult.score;
    const classification = riskResult.classification;

    return (
        <div className="playground-container" id="playground">
            <div className="white-box">
                <h1>Interactive Playground</h1>
                <p> Instructions: Type a sentence to test typing speed tracking.</p>
                <form className="playground-form" onSubmit={(e) => e.preventDefault()}>
                    <input type="text" id="finput" className="playground-input" placeholder="Type a message here..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button className="playground-btn" type="submit" onClick={() => onNavigate && onNavigate('playground')}> Test bot detection </button>
                </form>
                <p className="typing-speed-display">
                    Typing Speed: <strong>{typingSpeed} WPM</strong>
                </p>
            </div>

            <div className="blue-box">
                <h1> Real-Time Telemetry Feed</h1>
                <div className="telemetry-info">
                    <p>Automation Detected: {telemetry?.webdriver ? 'Yes' : 'No'}</p>
                    <p>Touch Points: {telemetry?.touchPoints ?? 'Loading…'}</p>                    <p>Clicks Detected: {behavior?.clickCount ?? 0}</p>
                    <p>Keys Pressed: {behavior?.keyPressCount ?? behavior?.keyCount ?? 0}</p>
                    <p>Mouse Moves: {behavior?.mouseMoveCount ?? behavior?.pointerMoveCount ?? 0} </p>
                </div>
                <hr className="divider" />
                <div className="risk-score-display">
                    <span> CURRENT RISK SCORE </span>
                </div>
                <div className="status-badge">
                    [{score}/100] <span> {classification.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
}