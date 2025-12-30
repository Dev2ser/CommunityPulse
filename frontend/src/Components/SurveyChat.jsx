import React from "react";
import "./SurveyChat.css";

const SurveyChat = () => {
  return (
    <div className="survey-page">
      <div className="survey-container">
        {/* Header */}
        <header className="survey-header">
          <h1 className="survey-title">COMMUNITY PULSE ASSISTANT</h1>
          <p className="survey-subtitle">Powered by Tipping Point</p>
        </header>

        {/* Progress */}
        <section className="survey-progress-section">
          <div className="survey-progress-top-row">
            <span className="survey-progress-label">15% Complete</span>
          </div>
          <div className="survey-progress-bar">
            <div className="survey-progress-fill" style={{ width: "15%" }} />
          </div>
        </section>

        {/* Chat card */}
        <section className="survey-chat-card">
          <div className="survey-chat-bubble">
            <p className="survey-chat-text">
              Hi! I&apos;m your Community Pulse Assistant. I&apos;m here to
              listen to your ideas and feedback about your neighborhood. What
              matters most to you in your community?
            </p>
          </div>

          {/* Options */}
          <div className="survey-options">
            <button className="survey-option-button">Safety</button>
            <button className="survey-option-button">Parks &amp; Recreation</button>
            <button className="survey-option-button">Local Businesses</button>
            <button className="survey-option-button">Housing</button>
          </div>
        </section>

        {/* Input row */}
        <section className="survey-input-section">
          <div className="survey-input-wrapper">
            <input
              type="text"
              className="survey-input"
              placeholder="Type your response..."
            />
            <div className="survey-input-icons">
              <button className="survey-icon-button" type="button">
                <span className="icon">📊</span>
                <span className="icon-label">Visual Input</span>
              </button>
              <button className="survey-icon-button" type="button">
                <span className="icon">📍</span>
                <span className="icon-label">Location</span>
              </button>
              <button className="survey-icon-button" type="button">
                <span className="icon">✏️</span>
                <span className="icon-label">Voice</span>
              </button>
              <button className="survey-icon-button" type="button">
                <span className="icon">📷</span>
                <span className="icon-label">Photo</span>
              </button>
            </div>
            <button className="survey-send-button" type="button">
              ✈️
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SurveyChat;
