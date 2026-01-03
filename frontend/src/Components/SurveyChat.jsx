import "../Styles/SurveyChat.css";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SurveyChat = () => {
  const { state } = useLocation();
  const survey = state?.survey;

  const [messages, setMessages] = useState([]); // Chat history
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (survey) console.log("Loaded survey:", survey);
  }, [survey]);

  // Send message to AI
  const sendToAI = async (userMessage) => {
    if (!survey) return;

    // Add user message to chat
    const newMessages = userMessage
      ? [...messages, { role: "user", content: userMessage }]
      : [...messages]; // if no user message, just send context

    if (userMessage) setMessages(newMessages);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/ai/survey-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey,        // full survey object
          messages: newMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("AI error:", data.message);
        setLoading(false);
        return;
      }

      // Add AI reply to chat
      setMessages((prev) => [
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send user input
  const handleSend = () => {
    if (!input.trim()) return;
    sendToAI(input);
    setInput("");
  };

  // Initial AI greeting
  useEffect(() => {
    if (survey) sendToAI(""); // send empty user message to trigger AI greeting
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survey]);

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
          {messages.length === 0 && !loading && (
            <div className="survey-chat-bubble assistant">
              <p className="survey-chat-text">
                Hi! I&apos;m your Community Pulse Assistant. I&apos;m here to
                listen to your ideas and feedback about your neighborhood.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`survey-chat-bubble ${
                msg.role === "assistant" ? "assistant" : "user"
              }`}
            >
              <p className="survey-chat-text">{msg.content}</p>
            </div>
          ))}

          {loading && (
            <div className="survey-chat-bubble assistant">
              <p className="survey-chat-text">Typing...</p>
            </div>
          )}
        </section>

        {/* Input row */}
        <section className="survey-input-section">
          <div className="survey-input-wrapper">
            <input
              type="text"
              className="survey-input"
              placeholder="Type your response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
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

            <button
              className="survey-send-button"
              type="button"
              onClick={handleSend}
            >
              ✈️
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SurveyChat;
