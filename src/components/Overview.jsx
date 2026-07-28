import React from "react";
import './Overview.css';


export default function Overview() {
    return (
        <div className="overview-container">
            <div className="about">
                <h2>Who are we?</h2>
                <p> TRUST is a real-time web security tool designed to detect automated bots and malicious browser sessions. By analyzing user behavior, mouse vectors, and live telemetry, we help keep web applications safe, transparent, and secure from automated threats.</p>
                <img src="/images/cyberimg.png" alt="cyber image" className="cyberimg" />
            </div>
            <div className="how-it-works">
                <h2>How It Works</h2>
                <div className="step-row">
                    <p>Step 1: Collect Telemetry — Captures browser specs, mouse vectors, and keystrokes in real time. </p>
                    <img src="/images/cyber-securityicon.png" alt="cyber security icon" className="step-icon" />
                </div>
                <hr className="step-divider" />
                <div className="step-row">
                    <p>Step 2: Score Risk — Evaluates data against rule-based logic to calculate a bot score (0–100%).</p>
                    <img src="/images/scoreicon.png" alt="score icon" className="step-icon" />
                </div>
                <hr className="step-divider" />
                <div className="step-row">
                    <p>Step 3: Store & Analyze — Sends session logs to MongoDB for admin inspection and threat response.</p>
                    <img src="/images/globe-gridicon.png" alt="cyber globe icon" className="step-icon" />
                </div>
                <hr className="step-divider" />
            </div>

            <div className="features-container">
                <h2>Features</h2>
                <ol>
                    <li>Collects browser telemetry from the user’s session</li>
                    <li>Displays exposed browser/device </li>
                    <li>Tracks basic user behavior such as clicks, typing speed, mouse movement, and session duration</li>
                    <li>Generates a bot risk score using rule-based logic</li>
                    <li>Shows an explanation for why a session was flagged as low, medium, or high risk</li>
                   <li> Provides an admin-style dashboard to view recent sessions and suspicious activity</li>
                </ol>
            </div>
        </div>
    );
}