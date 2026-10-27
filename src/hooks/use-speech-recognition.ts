"use client";

import * as React from "react";

import { useBrowserCapability } from "@/hooks/use-browser-capability";

/**
 * Web Speech API — speech-to-text.
 *
 * Supported in Chrome, Edge and Safari 14.1+. The hook degrades gracefully:
 * `supported` is false when the browser has no implementation, and the UI
 * then hides the microphone button.
 */

interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  /** Called with the full transcript whenever it changes. */
  onTranscript?: (transcript: string) => void;
}

export function useSpeechRecognition({ lang = "en-US", onTranscript }: UseSpeechRecognitionOptions = {}) {
  const supported = useBrowserCapability(() => Boolean(getConstructor()));
  const [listening, setListening] = React.useState(false);
  const [interim, setInterim] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = React.useRef("");
  const onTranscriptRef = React.useRef(onTranscript);

  // Keep the latest callback available to the event handlers without
  // re-creating the recognition instance on every render.
  React.useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  const start = React.useCallback(() => {
    const Ctor = getConstructor();
    if (!Ctor) {
      setError("Your browser does not support speech recognition. Try Chrome or Edge.");
      return;
    }

    // Stop any previous session first.
    recognitionRef.current?.abort();

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    finalTranscriptRef.current = "";

    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.results.length - 1; i >= 0; i -= 1) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalTranscriptRef.current += `${transcript} `;
        } else {
          interimText = `${transcript} ${interimText}`;
        }
      }
      setInterim(interimText);
      onTranscriptRef.current?.(finalTranscriptRef.current.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        setError("I didn't catch anything. Try again a little closer to the mic.");
      } else if (event.error === "not-allowed") {
        setError("Microphone access was blocked. Allow it in your browser settings to dictate answers.");
      } else if (event.error === "audio-capture") {
        setError("No microphone was found.");
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
      setError(null);
    } catch {
      setError("Could not start the microphone. Please try again.");
      setListening(false);
    }
  }, [lang]);

  // Stop the microphone when the component unmounts.
  React.useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported, listening, interim, error, start, stop };
}
