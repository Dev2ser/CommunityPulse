import { useCallback, useEffect, useRef, useState } from "react";

function useSpeechRecognition() {
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return undefined;
    }

    setRecognitionSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setError("");
      finalTranscriptRef.current = "";
      setTranscript("");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let nextFinalTranscript = finalTranscriptRef.current;
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const value = result[0]?.transcript || "";

        if (result.isFinal) {
          nextFinalTranscript = `${nextFinalTranscript} ${value}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${value}`.trim();
        }
      }

      finalTranscriptRef.current = nextFinalTranscript;
      setTranscript(`${nextFinalTranscript} ${interimTranscript}`.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        setError("No speech detected. Try again.");
        return;
      }
      setError("Voice input failed. Try again or type your response.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Voice input is not supported in this browser.");
      return false;
    }

    try {
      setError("");
      recognitionRef.current.start();
      return true;
    } catch (err) {
      setError("Voice input could not start. Please try again.");
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const abortListening = useCallback(() => {
    recognitionRef.current?.abort();
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return {
    recognitionSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    abortListening,
    clearTranscript,
  };
}

export default useSpeechRecognition;
