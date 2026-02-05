import React from "react";
import "../Styles/WelcomePage.css";

function WelcomePage({ onStart }) {
  return (
    <div className="welcome-container">
      <div className="landing-card">
        <h1 className="brand-title">TIPPING POINT</h1>
        <p className="brand-subtitle">REAL ESTATE DEVELOPMENT</p>

        <h2 className="welcome-title">
          WELCOME TO COMMUNITY <br /> PULSE
        </h2>

        <p className="description">
          Tell us your hopes and dreams for your neighborhood!
        </p>

        <button className="start-button" onClick={onStart}>
          Start Survey
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
