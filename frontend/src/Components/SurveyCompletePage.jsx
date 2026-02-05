import React from "react";
import "../Styles/SurveyCompletePage.css";
import { useNavigate } from "react-router-dom";
function SurveyComplete({ messages = [] }) {
  const hasMessages = messages.length > 0;
    const navigate = useNavigate();
    const handleReturn = () => {
        navigate("/surveys");
    }
  return (
    <div className="survey-page">
      <div className="survey-container">
        <header className="survey-header">
          <h1 className="survey-title">COMMUNITY PULSE ASSISTANT</h1>
          <p className="survey-subtitle">Powered by Tipping Point</p>
        </header>

        <section className="survey-complete-card" role="status" aria-live="polite">
          <h2>Thank you for completing the survey!</h2>
          <p>We really appreciate your feedback and ideas.</p>
        </section>

        {hasMessages && (
          <section className="survey-transcript" aria-label="Survey conversation transcript">
            <h3>Transcript</h3>
            <div className="transcript-content">
              {messages.map((msg, index) => (
                <div key={index} className="transcript-message">
                  <strong className="transcript-role">
                    {msg.role.toUpperCase()}:
                  </strong>{" "}
                  <span className="transcript-text">{msg.content}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        <button className = "return-btn" onClick={handleReturn}>Return to Available Surveys</button>
      </div>
    </div>
  );
}

export default SurveyComplete;