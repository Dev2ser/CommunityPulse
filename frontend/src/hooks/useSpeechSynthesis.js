import { useCallback, useEffect, useRef, useState } from "react";

function useSpeechSynthesis() {
  const utteranceRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSpeechSupported(Boolean(window.speechSynthesis));

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text) => {
      if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        !voiceEnabled ||
        !text?.trim()
      ) {
        return false;
      }

      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        utteranceRef.current = null;
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        utteranceRef.current = null;
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [stopSpeaking, voiceEnabled]
  );

  const toggleVoiceEnabled = useCallback(() => {
    setVoiceEnabled((previous) => {
      const next = !previous;
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  return {
    speechSupported,
    isSpeaking,
    voiceEnabled,
    speak,
    stopSpeaking,
    toggleVoiceEnabled,
  };
}

export default useSpeechSynthesis;
