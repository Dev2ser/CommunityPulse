import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Mic, Image, Volume2, VolumeX } from "lucide-react";
import imgImageTippingPoint from "../assets/TP_Stacked_BlackGreen.png";
import "../Styles/SurveyChat.css";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import { API_BASE } from "../utils/api";

const TRANSCRIPT_SESSION_KEY = "communityPulseTranscript";

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
  const progressRef = useRef({ current: 0, total: 1 });
  const hasNavigatedToTranscriptRef = useRef(false);

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

  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    // Only auto-scroll if stick-to-bottom is true AND a new message was actually added
    if (!shouldStickToBottomRef.current) {
      prevMessageCountRef.current = messages.length;
      return;
    }

    // Check if message count increased (new message arrived)
    const messageCountIncreased = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (!messageCountIncreased && !loading) return;

    // Scroll after a brief delay to ensure DOM is updated
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 0);

    return () => clearTimeout(timer);
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
          // Attach any structured data from the AI (multiple choice options)
          options: data.options || null,
          questionType: data.questionType || "text",
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

  // Navigate to transcript when survey is complete
  useEffect(() => {
    if (!surveyComplete || !survey || hasNavigatedToTranscriptRef.current)
      return;

    hasNavigatedToTranscriptRef.current = true;
    stopSpeaking();

    const transcriptPayload = {
      survey,
      messages: messagesRef.current,
      progress: progressRef.current,
      savedAt: Date.now(),
    };

    try {
      sessionStorage.setItem(
        TRANSCRIPT_SESSION_KEY,
        JSON.stringify(transcriptPayload),
      );
    } catch (err) {
      console.warn("Failed to persist transcript payload", err);
    }

    // Use a full-page navigation to ensure the UI actually switches routes.
    window.location.replace("/transcript");
  }, [surveyComplete, survey, stopSpeaking]);

  // When a new bot message appears, disable options for any older bot messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    let lastBotIndex = -1;
    messages.forEach((m, idx) => {
      if (m.sender === "bot") lastBotIndex = idx;
    });

    if (lastBotIndex <= 0) return;

    const shouldDisable = messages.some(
      (m, idx) => m.options && idx < lastBotIndex,
    );
    if (!shouldDisable) return;

    setMessages((prev) =>
      prev.map((m, idx) =>
        m.options && idx < lastBotIndex ? { ...m, optionsDisabled: true } : m,
      ),
    );
  }, [messages]);

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

  const isCheckboxQuestion = (message) =>
    (message.questionType || "").toLowerCase().includes("checkbox") ||
    (message.questionType || "").toLowerCase() === "checkboxes";

  // Find the most recent bot message that has options or a selected answer
  const activeOptionsMessage = [...messages]
    .reverse()
    .find(
      (m) =>
        m.sender === "bot" &&
        (m.options ||
          m.selectedOption ||
          m.selectedOptions ||
          m.optionsDisabled),
    );

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
                    {message.options && message.sender === "bot" ? (
                      <div
                        className={`message-options ${isCheckboxQuestion(message) ? "message-options-checkbox" : ""}`}
                      >
                        {isCheckboxQuestion(message) ? (
                          <>
                            {message.options.map((opt, i) => {
                              const selected = (
                                message.selectedOptions || []
                              ).includes(opt);
                              return (
                                <div
                                  key={`${message.id}-opt-${i}`}
                                  className="checkbox-wrapper"
                                >
                                  <input
                                    id={`${message.id}-opt-${i}`}
                                    type="checkbox"
                                    checked={selected}
                                    disabled={Boolean(message.optionsDisabled)}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setMessages((prev) =>
                                        prev.map((m) =>
                                          m.id === message.id
                                            ? {
                                                ...m,
                                                selectedOptions: isChecked
                                                  ? [
                                                      ...(m.selectedOptions ||
                                                        []),
                                                      opt,
                                                    ]
                                                  : (
                                                      m.selectedOptions || []
                                                    ).filter((o) => o !== opt),
                                              }
                                            : m,
                                        ),
                                      );
                                    }}
                                  />
                                  <label
                                    htmlFor={`${message.id}-opt-${i}`}
                                    className="checkbox-label-text"
                                  >
                                    {opt}
                                  </label>
                                </div>
                              );
                            })}

                            <div className="checkbox-submit-container">
                              <button
                                type="button"
                                className="btn btn-publish"
                                onClick={() => {
                                  const selected =
                                    message.selectedOptions || [];
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m.id === message.id
                                        ? { ...m, optionsDisabled: true }
                                        : m,
                                    ),
                                  );

                                  submitResponse({
                                    text: selected.join("; "),
                                    displayText: selected.join("; "),
                                  });
                                }}
                                disabled={
                                  Boolean(message.optionsDisabled) ||
                                  !(
                                    message.selectedOptions &&
                                    message.selectedOptions.length
                                  )
                                }
                              >
                                Submit
                              </button>
                            </div>
                          </>
                        ) : (message.questionType || "")
                            .toLowerCase()
                            .includes("dropdown") ? (
                          <div className="dropdown-submit-container">
                            <select
                              value={message.selectedOption || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === message.id
                                      ? { ...m, selectedOption: val }
                                      : m,
                                  ),
                                );
                              }}
                              disabled={Boolean(message.optionsDisabled)}
                              className="text-input"
                            >
                              <option value="">Choose...</option>
                              {message.options.map((opt, i) => (
                                <option
                                  key={`${message.id}-opt-${i}`}
                                  value={opt}
                                >
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn-publish"
                              onClick={() => {
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === message.id
                                      ? { ...m, optionsDisabled: true }
                                      : m,
                                  ),
                                );
                                submitResponse({
                                  text: message.selectedOption || "",
                                  displayText: message.selectedOption || "",
                                });
                              }}
                              disabled={
                                Boolean(message.optionsDisabled) ||
                                !message.selectedOption
                              }
                            >
                              Submit
                            </button>
                          </div>
                        ) : (
                          // default: single-choice buttons
                          message.options.map((opt, i) => (
                            <button
                              key={`${message.id}-opt-${i}`}
                              type="button"
                              className={`option-button ${message.selectedOption === opt ? "selected" : ""}`}
                              disabled={Boolean(
                                message.optionsDisabled ||
                                message.selectedOption,
                              )}
                              onClick={() => {
                                // mark this option as selected and disable options for this message
                                setMessages((prev) =>
                                  prev.map((m) =>
                                    m.id === message.id
                                      ? {
                                          ...m,
                                          selectedOption: opt,
                                          optionsDisabled: true,
                                        }
                                      : m,
                                  ),
                                );

                                // submit the chosen option as the user's response
                                submitResponse({ text: opt, displayText: opt });
                              }}
                            >
                              {opt}
                            </button>
                          ))
                        )}
                      </div>
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
                disabled={
                  loading ||
                  surveyComplete ||
                  Boolean(
                    activeOptionsMessage &&
                    !activeOptionsMessage.optionsDisabled,
                  )
                }
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={
                  (!inputValue.trim() && !selectedImage) ||
                  loading ||
                  surveyComplete ||
                  Boolean(
                    activeOptionsMessage &&
                    !activeOptionsMessage.optionsDisabled,
                  )
                }
                className="action-button send-button"
              >
                <Send className="button-icon" />
              </button>
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={loading || surveyComplete || !recognitionSupported}
                className={`action-button voice-button ${isListening ? "is-listening" : ""}`}
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
