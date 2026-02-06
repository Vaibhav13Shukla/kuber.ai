/**
 * Full-Duplex Voice AI Hook
 * Combines Speech-to-Text, AI Processing, and Text-to-Speech
 * with Intent Detection and Barge-in capability
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useKuberAI } from './useKuberAI';
import { detectIntent, getIntentContext } from '@/lib/intent-detector';

interface VoiceConfig {
  language: string;
  enableBargeIn?: boolean;
  autoStart?: boolean;
  voiceRate?: number;
  voicePitch?: number;
}

export interface UseVoiceKuberAIReturn extends ReturnType<typeof useKuberAI> {
  // Voice-specific states
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  voiceError: string | null;

  // Voice controls
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  speak: (text: string) => void;

  // Voice availability
  isVoiceSupported: boolean;
}

export function useVoiceKuberAI(config: VoiceConfig): UseVoiceKuberAIReturn {
  const ai = useKuberAI();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastMessageLengthRef = useRef(0);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(config.language);

    recognition.onstart = () => {
      console.log('[Voice] Listening started');
      setIsListening(true);
      setVoiceError(null);
    };

    let silenceTimer: NodeJS.Timeout;

    recognition.onresult = (event: any) => {
      // Manual volume-based VAD would be better, but we can use interim results
      // to detect active speech and stop AI immediately (Barge-in)
      if (isSpeaking) {
        stopSpeaking();
      }

      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        console.log('[Voice] Final transcript:', finalTranscript);
        setTranscript(finalTranscript);

        // Use a shorter delay for faster responsiveness
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (finalTranscript.trim()) {
            processVoiceInput(finalTranscript);
          }
        }, 800);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] Recognition error:', event.error);

      if (event.error === 'no-speech') {
        // Don't show error for no-speech, just restart silently if active
        if (isListening) startListening();
      } else if (event.error === 'network') {
        setVoiceError('Network error. Check your connection.');
      } else if (event.error === 'not-allowed') {
        setVoiceError('Microphone access denied.');
      } else {
        setVoiceError(`Voice error: ${event.error}`);
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('[Voice] Listening ended');
      setIsListening(false);
      // Auto-restart if we expect to keep listening
      if (config.autoStart !== false && !isSpeaking) {
        setTimeout(startListening, 300);
      }
    };

    recognitionRef.current = recognition;
    setIsVoiceSupported(true);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [config.language]);

  // Process voice input with intent detection
  const processVoiceInput = useCallback(async (voiceText: string) => {
    if (!ai.isModelLoaded || ai.isThinking) return;

    try {
      setTranscript('');

      // Detect intent
      const intentResult = detectIntent(voiceText);
      console.log('[Voice→Intent]', intentResult);

      // Add intent context to message
      const contextualMessage = voiceText + getIntentContext(intentResult);

      // Send to AI
      await ai.sendMessage(contextualMessage);

    } catch (error) {
      console.error('[Voice] Processing error:', error);
      setVoiceError('Failed to process voice input');
    }
  }, [ai]);

  // Auto-speak AI responses
  useEffect(() => {
    if (!ai.messages.length) return;
    if (ai.messages.length <= lastMessageLengthRef.current) return;

    const lastMessage = ai.messages[ai.messages.length - 1];

    if (lastMessage.role === 'assistant' && !isSpeaking) {
      lastMessageLengthRef.current = ai.messages.length;

      // Clean UI triggers from speech
      const cleanText = lastMessage.content
        .replace(/\[SHOW_.*?\]/g, '')
        .replace(/\[\[.*?\]\]/g, '')
        .replace(/\[INTENT:.*?\]/g, '')
        .trim();

      if (cleanText) {
        speak(cleanText);
      }
    }
  }, [ai.messages, isSpeaking]);

  // Text-to-Speech
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('[Voice] Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(config.language);
    utterance.rate = config.voiceRate || 0.9;
    utterance.pitch = config.voicePitch || 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log('[Voice] Speaking started');
      setIsSpeaking(true);

      // Stop listening while AI is speaking (unless barge-in is enabled)
      // If barge-in is enabled, we keep listening but ignore our own echo
      // For now, simpler: user speaking stops AI
    };

    utterance.onend = () => {
      console.log('[Voice] Speaking ended');
      setIsSpeaking(false);

      // Resume listening after AI finishes speaking
      if (config.autoStart !== false) {
        setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    utterance.onerror = (event) => {
      console.error('[Voice] Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [config]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setVoiceError('Voice recognition not initialized');
      return;
    }

    // Stop speaking if AI is talking (barge-in)
    if (isSpeaking) {
      stopSpeaking();
    }

    try {
      recognitionRef.current.start();
    } catch (error: any) {
      // Already started - ignore
      if (error.message?.includes('already started')) {
        console.log('[Voice] Recognition already active');
      } else {
        console.error('[Voice] Start error:', error);
        setVoiceError('Failed to start listening');
      }
    }
  }, [isSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    ...ai,

    // Voice states
    isListening,
    isSpeaking,
    transcript,
    voiceError,
    isVoiceSupported,

    // Voice controls
    startListening,
    stopListening,
    stopSpeaking,
    speak,
  };
}

/**
 * Map language ID to BCP 47 language code
 */
function getLanguageCode(langId: string): string {
  const mapping: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'hinglish': 'hi-IN', // Use Hindi recognition for Hinglish
    'ta': 'ta-IN',
    'te': 'te-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
  };

  return mapping[langId] || 'en-US';
}
