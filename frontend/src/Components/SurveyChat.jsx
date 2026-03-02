import "../Styles/SurveyChat.css";
import sendIcon from "../Assets/send-icon.png";
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
    <div className="survey-app">
      {/* HEADER */}
      <header className="survey-header-bar">
        <div className="survey-header-top">
          <div className="survey-header-left">
            <div className="chat-icon">💬</div>
            <div>
              <h1>COMMUNITY PULSE ASSISTANT</h1>
              <p>Powered by Tipping Point</p>
            </div>
          </div>
        </div>
  
        <div className="survey-progress-bar">
          <div
            className="survey-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
  
        <div className="survey-progress-text">
          {progressPercent}% Complete
        </div>
      </header>
  
      {/* CHAT AREA */}
      <main className="survey-chat-area">
      
        {messages.length === 0 && !loading && (
          <div className="chat-bubble assistant">
          
            Hi! I'm your Community Pulse Assistant. I'm here to listen to your ideas and feedback about your neighborhood.
          </div>
        )}
  
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
              <div className="role-label">
      {msg.role === "assistant" ? "Assistant" : "You"}
    </div>
            
            {msg.content}
          </div>
        ))}
  
        {loading && (
          <div className="chat-bubble assistant">Typing...</div>
        )}
  
        {completionCountdown !== null && (
          <div className="chat-bubble assistant">
            Thank you for your responses! Survey is closing in {completionCountdown}...
          </div>
        )}
  
        {/* MULTIPLE CHOICE OPTIONS */}
        {currentQuestionType === "multiple" && currentOptions.length > 0 && (
          <div className="option-row">
            {currentOptions.map((opt, idx) => (
              <button
                key={idx}
                className="option-pill"
                onClick={() => sendToAI(opt)}
                disabled={loading || surveyComplete}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
  
        <div ref={chatEndRef} />
      </main>
  
      {/* INPUT BAR */}
  
      {currentQuestionType !== "multiple" && (
  <footer className="survey-footer">
    <div className="footer-inner">

      {/* TEXT INPUT + SEND */}
      <div className = "input-send-container">
      <input
        type="text"
        className="input"
        placeholder={listening ? "Listening..." : "Type your response..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        disabled={loading || surveyComplete || listening}
      />
      <button
  className="send-btn"
  onClick={handleSend}
  disabled={loading || surveyComplete || listening}
>
  <img src={sendIcon} alt="Send" className="send-icon" />
</button>
        </div>

      {/* ICONS  */}
      <div className="footer-actions">
        <div className="footer-left-icons">
          <button
            className="footer-icon-btn"
            onClick={startVoiceInput}
            disabled={loading || surveyComplete}
          >
            🎤
          </button>

          <label className="footer-icon-btn">
            📷
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
              disabled={loading || surveyComplete}
            />
          </label>
        </div>


      </div>

      {/* IMAGE PREVIEW */}
      {selectedImage && (
        <div className="footer-image-preview">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected"
          />
          <button
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  </footer>
)}
    </div>
  );
};

export default SurveyChat;