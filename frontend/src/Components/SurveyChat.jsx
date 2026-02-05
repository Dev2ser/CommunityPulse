import "../Styles/SurveyChat.css";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SurveyComplete from "./SurveyCompletePage";
const SurveyChat = () => {
  const { state } = useLocation();
  const survey = state?.survey;

  const [messages, setMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // VOICE
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Survey progress
  const [progress, setProgress] = useState({ current: 0, total: 1 });

  // Survey complete flag
  const [surveyComplete, setSurveyComplete] = useState(false);

  // Current question type & options
  const [currentQuestionType, setCurrentQuestionType] = useState("text");
  const [currentOptions, setCurrentOptions] = useState([]);

  const chatEndRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Completion countdown
  const [completionCountdown, setCompletionCountdown] = useState(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, completionCountdown]);

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
      setInput(transcript);
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

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  // Revoke object URL on unmount or image change
  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage);
    };
  }, [selectedImage]);

  const sendToAI = async (userMessage) => {
    if (!survey || !userMessage) return;

    // Add user message to chat
    if (userMessage) {
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("survey", JSON.stringify(survey));

      // Include all messages 
      formData.append(
        "messages",
        JSON.stringify(userMessage ? [...messages, { role: "user", content: userMessage }] : messages)
      );

      // Append selected image if it exists
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch("http://localhost:5001/api/ai/survey-chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // --- Update progress ---
      if (data.progress) {
        setProgress({
          current: data.progress.current,
          total: data.progress.total,
        });
      }

      // --- Handle survey completion ---
      if (data.surveyComplete) {
        let seconds = 3;
        setCompletionCountdown(seconds);

        // Clear previous interval if exists
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        countdownIntervalRef.current = setInterval(() => {
          seconds -= 1;
          setCompletionCountdown(seconds);

          if (seconds <= 0) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            setSurveyComplete(true);
            setCompletionCountdown(null);
          }
        }, 1000);
      }

      // --- Update current question type & options ---
      setCurrentQuestionType(data.questionType || "text");
      setCurrentOptions(data.options || []);

      // --- Add AI reply ---
      if (!data.surveyComplete && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
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
    setSelectedImage(null); // reset selected image after send
  };
  useEffect(() => {
    if (survey && messages.length === 0) {
      sendToAI(null);
    }
  }, [survey]);



  // Calculate progress percentage safely
  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  // --- Render ---
  if (surveyComplete) {
    return (
      <div>
        <SurveyComplete messages={messages} />
      </div>
    );
  }

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
            <span className="survey-progress-label">{progressPercent}% Complete</span>
          </div>
          <div className="survey-progress-bar">
            <div className="survey-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </section>

        {/* Chat */}
        <section className="survey-chat-card">
          {messages.length === 0 && !loading && (
            <div className="survey-chat-bubble assistant">
              <p className="survey-chat-text">
                Hi! I&apos;m your Community Pulse Assistant. I&apos;m here to listen to your ideas
                and feedback about your neighborhood Type anything to start the survey.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`survey-chat-bubble ${msg.role === "assistant" ? "assistant" : "user"}`}
            >
              <p className="survey-chat-text">{msg.content}</p>
            </div>
          ))}

          {loading && (
            <div className="survey-chat-bubble assistant">
              <p className="survey-chat-text">Typing...</p>
            </div>
          )}

          {completionCountdown !== null && (
            <div className="survey-chat-bubble assistant">
              <p className="survey-chat-text">
                Thank you for your responses! Survey is closing in {completionCountdown}...
              </p>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        {/* Input / Options */}
        <section className="survey-input-section">
          <div className="survey-input-wrapper">
            {currentQuestionType === "multiple" && currentOptions.length > 0 ? (
              // --- Multiple-choice buttons ---
              <div className="survey-options-container">
                {currentOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    className="survey-option-bubble"
                    onClick={() => sendToAI(opt)}
                    disabled={loading || surveyComplete}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              // --- Text input + icons + send button ---
              <>
                <input
                  type="text"
                  className="survey-input"
                  placeholder={listening ? "Listening..." : "Type your response..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={loading || surveyComplete || listening}
                />

                <div className="survey-input-icons">
                  <button
                    className="survey-icon-button"
                    type="button"
                    onClick={startVoiceInput}
                    disabled={loading || surveyComplete}
                  >
                    <span className="icon">{listening ? "🎙️" : "🎤"}</span>
                    <span className="icon-label">{listening ? "Listening..." : "Voice"}</span>
                  </button>

                  <label className="survey-icon-button">
                    <span className="icon">📷</span>
                    <span className="icon-label">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageSelect}
                      disabled={loading || surveyComplete}
                    />
                  </label>

                  {selectedImage && (
                    <div className="image-preview-container">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Selected"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => setSelectedImage(null)}
                      >
                        ❌
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="survey-send-button"
                  type="button"
                  onClick={handleSend}
                  disabled={loading || surveyComplete || listening}
                >
                  ✈️
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SurveyChat;