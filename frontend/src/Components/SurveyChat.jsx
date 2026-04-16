import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic, Image } from "lucide-react";
import imgImageTippingPoint from "../assets/TP_Stacked_BlackGreen.png";
import "../Styles/SurveyChat.css";

const API_BASE =
  import.meta?.env?.VITE_API_URL || "http://localhost:5001/api";

function SurveyChat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const survey = state?.survey;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 1 });
  const [surveyComplete, setSurveyComplete] = useState(false);

  const recognitionRef = useRef(null);
  const messagesRef = useRef([]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInputValue(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    return () => {
      messagesRef.current.forEach((message) => {
        if (message.imageUrl) {
          URL.revokeObjectURL(message.imageUrl);
        }
      });
    };
  }, []);

  const mapMessagesForApi = (chatMessages) =>
    chatMessages
      .filter((message) => message.sender === "user" || message.sender === "bot")
      .map((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.text || (message.imageUrl ? "[Photo uploaded]" : ""),
      }))
      .filter((message) => message.content);

  const appendSystemMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const sendToAI = async ({ text = "", imageFile = null, displayText } = {}) => {
    if (!survey || surveyComplete) return;

    const trimmedText = text.trim();
    const hasUserTurn = Boolean(trimmedText || imageFile);
    const nextMessages = [...messagesRef.current];

    if (hasUserTurn) {
      const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
      const userMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text: displayText ?? trimmedText ?? "",
        sender: "user",
        timestamp: new Date(),
        imageUrl,
      };
      nextMessages.push(userMessage);
      setMessages(nextMessages);
      messagesRef.current = nextMessages;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("survey", JSON.stringify(survey));
      formData.append(
        "messages",
        JSON.stringify(mapMessagesForApi(nextMessages))
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${API_BASE}/ai/survey-chat`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      if (data.progress) {
        setProgress({
          current: data.progress.current || 0,
          total: data.progress.total || 1,
        });
      }

      if (data.reply) {
        const botMessage = {
          id: `${Date.now()}-${Math.random()}`,
          text: data.reply,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }

      if (data.surveyComplete) {
        setSurveyComplete(true);
      }
    } catch (err) {
      console.error("Survey chat error:", err);
      setError(err.message || "Failed to connect to the survey service.");
      appendSystemMessage(
        "We couldn’t send that response right now. Please try again."
      );
    } finally {
      setLoading(false);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    if (!survey || startedRef.current) return;
    startedRef.current = true;
    sendToAI();
  }, [survey]);

  const handleSend = () => {
    if (!inputValue.trim() && !selectedImage) return;

    sendToAI({
      text: inputValue,
      imageFile: selectedImage,
      displayText: inputValue.trim() || (selectedImage ? "[Photo uploaded]" : ""),
    });
    setInputValue("");
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    recognitionRef.current.start();
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
  };

  const questionLabel =
    progress.current > 0
      ? `Question ${progress.current} of ${Math.max(progress.total, 1)}`
      : "Survey Assistant";

  if (!survey) {
    return (
      <div className="chatbot-page">
        <div className="chatbot-shell">
          <div className="chatbot-container">
            <header className="chatbot-header">
              <div className="header-content">
                <button
                  type="button"
                  onClick={() => navigate("/surveys")}
                  className="back-button"
                >
                  <ArrowLeft className="back-icon" />
                </button>
                <div className="header-info">
                  <img
                    alt="Tipping Point"
                    className="header-logo"
                    src={imgImageTippingPoint}
                  />
                  <div>
                    <h1 className="header-title">COMMUNITY PULSE</h1>
                    <p className="header-subtitle">Select a survey to begin</p>
                  </div>
                </div>
              </div>
            </header>

            <main className="messages-container">
              <div className="message-wrapper message-wrapper-bot">
                <div className="message-bubble message-bubble-bot">
                  <p className="message-text">
                    No survey was selected. Return to the surveys list to start.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-page">
      <div className="chatbot-shell">
        <div className="chatbot-container">
          <header className="chatbot-header">
            <div className="header-content">
              <button
                type="button"
                onClick={() => navigate("/surveys")}
                className="back-button"
              >
                <ArrowLeft className="back-icon" />
              </button>
              <div className="header-info">
                <img
                  alt="Tipping Point"
                  className="header-logo"
                  src={imgImageTippingPoint}
                />
                <div>
                  <h1 className="header-title">COMMUNITY PULSE</h1>
                  <p className="header-subtitle">{questionLabel}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="messages-container">
            <div className="messages-inner">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-wrapper ${
                    message.sender === "user"
                      ? "message-wrapper-user"
                      : "message-wrapper-bot"
                  }`}
                >
                  <div
                    className={`message-bubble ${
                      message.sender === "user"
                        ? "message-bubble-user"
                        : "message-bubble-bot"
                    }`}
                  >
                    {message.text ? (
                      <p className="message-text">{message.text}</p>
                    ) : null}
                    {message.imageUrl ? (
                      <img
                        className="message-image"
                        src={message.imageUrl}
                        alt="Uploaded survey response"
                      />
                    ) : null}
                    <p
                      className={`message-timestamp ${
                        message.sender === "user" ? "timestamp-user" : "timestamp-bot"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {loading ? (
                <div className="message-wrapper message-wrapper-bot">
                  <div className="message-bubble message-bubble-bot">
                    <p className="message-text">Typing...</p>
                  </div>
                </div>
              ) : null}

              <div ref={chatEndRef} />
            </div>
          </main>

          <div className="input-area">
            <div className="input-controls">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSend()}
                placeholder={listening ? "Listening..." : "Type your answer..."}
                className="text-input"
                disabled={loading || surveyComplete}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={(!inputValue.trim() && !selectedImage) || loading || surveyComplete}
                className="action-button send-button"
              >
                <Send className="button-icon" />
              </button>
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={loading || surveyComplete}
                className="action-button voice-button"
              >
                <Mic className="button-icon" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || surveyComplete}
                className="action-button photo-button"
              >
                <Image className="button-icon" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-file-input"
                onChange={handlePhotoUpload}
              />
            </div>
            {selectedImage ? (
              <p className="privacy-notice">Image attached. Add a note or press send.</p>
            ) : null}
            {error ? <p className="privacy-notice">{error}</p> : null}
            {!error && !selectedImage ? (
              <p className="privacy-notice">
                Your responses are anonymous and confidential
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyChat;
