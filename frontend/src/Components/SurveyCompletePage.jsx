import React from "react";
import "../Styles/SurveyCompletePage.css";
import { useNavigate, useLocation } from "react-router-dom";

const TRANSCRIPT_SESSION_KEY = "communityPulseTranscript";

function SurveyComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  let persistedState = null;
  try {
    const raw = sessionStorage.getItem(TRANSCRIPT_SESSION_KEY);
    persistedState = raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to read persisted transcript payload", err);
  }

  const transcriptState = location.state || persistedState || {};
  const messages = transcriptState.messages || [];
  const hasMessages = messages.length > 0;

  const handleReturn = () => {
    navigate("/surveys");
  };

  // ✅ FIX: adapt to your actual message structure
  const isAssistant = (msg) => msg.sender?.toLowerCase() === "bot";

  const groupedBlocks = [];
  let currentBlock = null;

  messages.forEach((msg) => {
    const text = msg.text || "";

    const isQuestionOpener =
      isAssistant(msg) && /question\s+\d+\s+of\s+\d+/i.test(text);

    if (isQuestionOpener) {
      if (currentBlock) groupedBlocks.push(currentBlock);

      const match = text.match(/(question\s+\d+\s+of\s+\d+)[:\s]*(.*)/is);

      currentBlock = {
        label: match ? match[1] : "Question",
        question: match ? match[2].trim() : text,
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
            <span className="survey-complete-brand">
              Community Pulse Assistant
            </span>
            <span className="survey-complete-powered">
              Powered by Tipping Point
            </span>
          </div>
          <span className="survey-complete-badge">Survey Complete</span>
        </header>

        <section className="survey-complete-banner">
          <div>
            <h2 className="survey-complete-title">
              Thank you for your feedback
            </h2>
            <p className="survey-complete-subtitle">
              Your responses have been recorded. We really appreciate your ideas
              and perspective.
            </p>
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
                      <span className="survey-complete-question-num">
                        {block.label}
                      </span>
                      <span className="survey-complete-question-text">
                        {block.question}
                      </span>
                    </div>

                    <div className="survey-complete-exchange">
                      {block.exchanges.map((msg, mi) => {
                        const isAI = isAssistant(msg);
                        const text = msg.text || "";

                        return (
                          <div
                            key={mi}
                            className={`survey-complete-message ${
                              isAI
                                ? "survey-complete-message--ai"
                                : "survey-complete-message--user"
                            }`}
                          >
                            <div
                              className={`survey-complete-avatar ${
                                isAI
                                  ? "survey-complete-avatar--ai"
                                  : "survey-complete-avatar--user"
                              }`}
                            >
                              {isAI ? "Assistant" : "You"}
                            </div>

                            <div
                              className={`survey-complete-bubble ${
                                isAI
                                  ? "survey-complete-bubble--ai"
                                  : "survey-complete-bubble--user"
                              }`}
                            >
                              {text}
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
                  const isAI = isAssistant(msg);
                  const text = msg.text || "";

                  return (
                    <div
                      key={i}
                      className={`survey-complete-message ${
                        isAI
                          ? "survey-complete-message--ai"
                          : "survey-complete-message--user"
                      }`}
                    >
                      <div
                        className={`survey-complete-bubble ${
                          isAI
                            ? "survey-complete-bubble--ai"
                            : "survey-complete-bubble--user"
                        }`}
                      >
                        {text}
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
            <span className="survey-complete-meta">
              {messages.length} messages recorded
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}

export default SurveyComplete;
