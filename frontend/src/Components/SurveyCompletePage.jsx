import React from "react";
import "../Styles/SurveyCompletePage.css";
import { useNavigate } from "react-router-dom";

function SurveyComplete({ messages = [] }) {
  const hasMessages = messages.length > 0;
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/surveys");
  };

  const isAssistant = (role) =>
    role?.toLowerCase() === "assistant";

  const groupedBlocks = [];
  let currentBlock = null;

  messages.forEach((msg) => {
    const isQuestionOpener =
      isAssistant(msg.role) &&
      /question\s+\d+\s+of\s+\d+/i.test(msg.content);

    if (isQuestionOpener) {
      if (currentBlock) groupedBlocks.push(currentBlock);
      const match = msg.content.match(/(question\s+\d+\s+of\s+\d+)[:\s]*(.*)/is);
      currentBlock = {
        label: match ? match[1] : "Question",
        question: match ? match[2].trim() : msg.content,
        exchanges: [],
      };
    } else if (currentBlock) {
      currentBlock.exchanges.push(msg);
    }
  });
  if (currentBlock) groupedBlocks.push(currentBlock);

  const useFlatTranscript = groupedBlocks.length === 0;

  return (
    <div className="survey-complete-page">
      <div className="survey-complete-container">

        <header className="survey-complete-header">
          <div>
            <span className="survey-complete-brand">Community Pulse Assistant</span>
            <span className="survey-complete-powered">Powered by Tipping Point</span>
          </div>
          <span className="survey-complete-badge">Survey Complete</span>
        </header>

        <section className="survey-complete-banner" role="status" aria-live="polite">
          <div className="survey-complete-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2 className="survey-complete-title">Thank you for your feedback</h2>
            <p className="survey-complete-subtitle">Your responses have been recorded. We really appreciate your ideas and perspective.</p>
          </div>
        </section>

        {hasMessages && (
          <section aria-label="Survey conversation transcript">
            <p className="survey-complete-section-label">Transcript</p>

            {!useFlatTranscript ? (
              <div className="survey-complete-blocks">
                {groupedBlocks.map((block, bi) => (
                  <div key={bi} className="survey-complete-question-block">
                    <div className="survey-complete-question-header">
                      <span className="survey-complete-question-num">{block.label}</span>
                      <span className="survey-complete-question-text">{block.question}</span>
                    </div>
                    <div className="survey-complete-exchange">
                      {block.exchanges.map((msg, mi) => {
                        const isAI = isAssistant(msg.role);
                        return (
                          <div key={mi} className={`survey-complete-message ${isAI ? "survey-complete-message--ai" : "survey-complete-message--user"}`}>
                            <div className={`survey-complete-avatar ${isAI ? "survey-complete-avatar--ai" : "survey-complete-avatar--user"}`}>
                              {isAI ? "Assistant" : "You"}
                            </div>
                            <div className={`survey-complete-bubble ${isAI ? "survey-complete-bubble--ai" : "survey-complete-bubble--user"}`}>
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="survey-complete-flat">
                {messages.map((msg, i) => {
                  const isAI = isAssistant(msg.role);
                  return (
                    <div key={i} className={`survey-complete-message ${isAI ? "survey-complete-message--ai" : "survey-complete-message--user"}`}>
                      
                      <div className={`survey-complete-bubble ${isAI ? "survey-complete-bubble--ai" : "survey-complete-bubble--user"}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <footer className="survey-complete-footer">
          <button className="survey-complete-return-btn" onClick={handleReturn}>
            ← Return to surveys
          </button>
          {hasMessages && (
            <span className="survey-complete-meta">{messages.length} messages recorded</span>
          )}
        </footer>

      </div>
    </div>
  );
}

export default SurveyComplete;