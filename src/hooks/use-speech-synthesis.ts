"use client";

import * as React from "react";

/**
 * Web Speech API — text-to-speech.
 *
 * Used to read each interview question aloud so the candidate can answer
 * with the microphone instead of typing.
 */

/** Cached so `useSyncExternalStore` always gets a stable snapshot. */
let cachedVoice: SpeechSynthesisVoice | null = null;
let cachedKey = "";

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Prefer a natural English voice.
  return (
    voices.find((item) => item.lang === "en-US" && /Samantha|Google US|Ava/i.test(item.name)) ??
    voices.find((item) => item.lang.startsWith("en")) ??
    voices[0] ??
    null
  );
}

function getVoiceSnapshot(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return cachedVoice;

  const key = voices.map((voice) => voice.name).join("|");
  if (key !== cachedKey) {
    cachedKey = key;
    cachedVoice = pickVoice(voices);
  }
  return cachedVoice;
}

function subscribeToVoices(onChange: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

export function useSpeechSynthesis() {
  const supported = React.useSyncExternalStore(
    subscribeToVoices,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );

  const voice = React.useSyncExternalStore(subscribeToVoices, getVoiceSnapshot, () => null);
  const [speaking, setSpeaking] = React.useState(false);

  const speak = React.useCallback(
    (text: string) => {
      if (!supported || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported, voice],
  );

  const cancel = React.useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  React.useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return { supported, speaking, speak, cancel, voice };
}
