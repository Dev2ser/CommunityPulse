import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic, Image, Volume2, VolumeX } from "lucide-react";
import imgImageTippingPoint from "../assets/TP_Stacked_BlackGreen.png";
import "../Styles/SurveyChat.css";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import { API_BASE } from "../utils/api";

function SurveyChat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const survey = state?.survey;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 1 });
  const [surveyComplete, setSurveyComplete] = useState(false);

  const messagesRef = useRef([]);
  const messagesContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const startedRef = useRef(false);
  const previousListeningRef = useRef(false);
  const voiceSessionRef = useRef(false);
  const lastSpokenMessageIdRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);

  const {
    recognitionSupported,
    isListening,
    transcript,
    error: recognitionError,
    startListening,
    clearTranscript,
  } = useSpeechRecognition();
  const {
    speechSupported,
    isSpeaking,
    voiceEnabled,
    speak,
    stopSpeaking,
    toggleVoiceEnabled,
  } = useSpeechSynthesis();

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldStickToBottomRef.current = distanceFromBottom < 80;
  };

  useEffect(() => {
    return () => {
      messagesRef.current.forEach((message) => {
        if (message.imageUrl) {
          URL.revokeObjectURL(message.imageUrl);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!isListening) return;
    setInputValue(transcript);
  }, [isListening, transcript]);

  useEffect(() => {
    if (recognitionError) {
      setError(recognitionError);
    }
  }, [recognitionError]);

  useEffect(() => {
    const wasListening = previousListeningRef.current;

    if (wasListening && !isListening && voiceSessionRef.current) {
      const finalTranscript = transcript.trim();
      voiceSessionRef.current = false;

      if (finalTranscript) {
        submitResponse({
          text: finalTranscript,
          displayText: finalTranscript,
        });
      } else {
        clearTranscript();
      }
    }

    previousListeningRef.current = isListening;
  }, [clearTranscript, isListening, transcript]);

  useEffect(() => {
    const latestAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.sender === "bot" && message.text?.trim());

    if (!latestAssistantMessage) return;
    if (lastSpokenMessageIdRef.current === latestAssistantMessage.id) return;

    lastSpokenMessageIdRef.current = latestAssistantMessage.id;
    speak(latestAssistantMessage.text);
  }, [messages, speak]);

  const mapMessagesForApi = (chatMessages) =>
    chatMessages
      .filter(
        (message) => message.sender === "user" || message.sender === "bot",
      )
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

  const sendToAI = async ({
    text = "",
    imageFile = null,
    displayText,
  } = {}) => {
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
        JSON.stringify(mapMessagesForApi(nextMessages)),
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
      
        const finalMessages = [...messages];
        console.log(finalMessages);

navigate("/transcript", {
  state: {
    survey,
    messages: finalMessages,
    progress,
  },
});
      }
    } catch (err) {
      console.error("Survey chat error:", err);
      setError(err.message || "Failed to connect to the survey service.");
      appendSystemMessage(
        "We couldn’t send that response right now. Please try again.",
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

  const submitResponse = ({
    text = "",
    imageFile = null,
    displayText,
  } = {}) => {
    if (!text.trim() && !imageFile) return;

    // When the user sends a message, return to stick-to-bottom behavior.
    shouldStickToBottomRef.current = true;

    sendToAI({
      text,
      imageFile,
      displayText:
        displayText ?? (text.trim() || (imageFile ? "[Photo uploaded]" : "")),
    });
    setInputValue("");
    clearTranscript();
  };

  const handleSend = () => {
    if (!inputValue.trim() && !selectedImage) return;

    submitResponse({
      text: inputValue,
      imageFile: selectedImage,
      displayText:
        inputValue.trim() || (selectedImage ? "[Photo uploaded]" : ""),
    });
  };

  const handleVoiceInput = () => {
    if (!recognitionSupported) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    stopSpeaking();
    setError("");
    voiceSessionRef.current = true;
    clearTranscript();

    const started = startListening();
    if (!started) {
      voiceSessionRef.current = false;
    }
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

            <main
              className="messages-container"
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
            >
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
                  <div className="voice-status-row">
                    <span
                      className={`voice-status-pill ${isListening ? "listening" : isSpeaking ? "speaking" : "idle"}`}
                    >
                      {isListening
                        ? "Listening"
                        : isSpeaking
                          ? "Assistant speaking"
                          : "Voice idle"}
                    </span>
                    {!recognitionSupported ? (
                      <span className="voice-support-note">
                        Voice input unavailable in this browser
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`voice-toggle-button ${voiceEnabled ? "" : "muted"}`}
                onClick={toggleVoiceEnabled}
                aria-label={
                  voiceEnabled
                    ? "Mute assistant voice"
                    : "Unmute assistant voice"
                }
                title={
                  voiceEnabled
                    ? "Mute assistant voice"
                    : "Unmute assistant voice"
                }
              >
                {voiceEnabled ? (
                  <Volume2
                    className="voice-toggle-icon"
                    size={46}
                    strokeWidth={3.2}
                  />
                ) : (
                  <VolumeX
                    className="voice-toggle-icon"
                    size={46}
                    strokeWidth={3.2}
                  />
                )}
              </button>
            </div>
          </header>

          <main
            className="messages-container"
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
          >
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
                        message.sender === "user"
                          ? "timestamp-user"
                          : "timestamp-bot"
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
                placeholder={
                  isListening ? "Listening..." : "Type your answer..."
                }
                className="text-input"
                disabled={loading || surveyComplete}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={
                  (!inputValue.trim() && !selectedImage) ||
                  loading ||
                  surveyComplete
                }
                className="action-button send-button"
              >
                <Send className="button-icon" />
              </button>
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={loading || surveyComplete || !recognitionSupported}
                className={`action-button voice-button ${isListening ? "is-listening" : ""} ${isSpeaking ? "is-speaking" : ""}`}
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
              <p className="privacy-notice">
                Image attached. Add a note or press send.
              </p>
            ) : null}
            {error ? <p className="privacy-notice">{error}</p> : null}
            {!error && !selectedImage ? (
              <p className="privacy-notice">
                {isListening
                  ? "Listening... your response will send automatically when you stop speaking."
                  : !recognitionSupported
                    ? "Your responses are anonymous and confidential. Voice input is not supported in this browser."
                    : !speechSupported
                      ? "Your responses are anonymous and confidential. Voice playback is not supported in this browser."
                      : "Your responses are anonymous and confidential"}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurveyChat;
