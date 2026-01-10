import "../Styles/SurveyChat.css";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const SurveyChat = () => {
  const { state } = useLocation();
  const survey = state?.survey;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // VOICE
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (survey) console.log("Loaded survey:", survey);
  }, [survey]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // VOICE SETUP
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onend = () => setListening(false);

    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognitionRef.current = recognition;
  }, []);

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported in this browser.");
      return;
    }

    recognitionRef.current.start();
  };

  const sendToAI = async (userMessage) => {
    if (!survey) return;

    const newMessages = userMessage
      ? [...messages, { role: "user", content: userMessage }]
      : [...messages];

    if (userMessage) setMessages(newMessages);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/ai/survey-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          survey,
          messages: newMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("AI error:", data.message);
        return;
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendToAI(input);
    setInput("");
  };

  // Initial greeting
  useEffect(() => {
    if (survey) sendToAI("");
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

        {/* Chat */}
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

          <div ref={chatEndRef} />
        </section>

        {/* Input */}
        <section className="survey-input-section">
          <div className="survey-input-wrapper">
            <input
              type="text"
              className="survey-input"
              placeholder={
                listening ? "Listening..." : "Type your response..."
              }
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

              {/* 🎤 VOICE BUTTON */}
              <button
                className="survey-icon-button"
                type="button"
                onClick={startVoiceInput}
              >
                <span className="icon">{listening ? "🎙️" : "🎤"}</span>
                <span className="icon-label">
                  {listening ? "Listening..." : "Voice"}
                </span>
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
