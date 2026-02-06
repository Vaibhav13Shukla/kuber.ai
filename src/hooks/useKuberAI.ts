/**
 * Tambo.ai - Global AI Integration Hook
 * Powered by NVIDIA PersonaPlex & Google Gemini
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import { KUBER_CONFIG } from '@/tambo/config';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface LoadingProgress {
  progress: number;
  text: string;
  timeRemaining?: number;
}

export interface UseKuberAIReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isModelLoaded: boolean;
  loadingProgress: LoadingProgress | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  retryLoadModel: () => Promise<void>;
  isThinking: boolean;
  selectedLanguage: string | null;
  setLanguage: (lang: string) => void;
}

export function useKuberAI(): UseKuberAIReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [useCloudAPI, setUseCloudAPI] = useState(false);

  const engineRef = useRef<MLCEngine | null>(null);
  const loadStartTimeRef = useRef<number>(0);

  // Initialize model
  const initializeModel = useCallback(async () => {
    if (engineRef.current) return;

    try {
      setError(null);
      setIsLoading(true);
      setLoadingProgress({ progress: 0, text: 'Initializing Tambo AI...' });

      loadStartTimeRef.current = Date.now();

      // Try WebLLM first if supported
      try {
        const engine = await CreateMLCEngine(
          KUBER_CONFIG.modelId,
          {
            initProgressCallback: (report) => {
              const progress = Math.round(report.progress * 100);
              const elapsed = (Date.now() - loadStartTimeRef.current) / 1000;
              const timeRemaining = report.progress > 0.1
                ? Math.round((elapsed / report.progress) * (1 - report.progress))
                : null;

              setLoadingProgress({
                progress,
                text: report.text || 'Loading NVIDIA PersonaPlex...',
                timeRemaining: timeRemaining || undefined,
              });
            },
          }
        );
        engineRef.current = engine;
        setIsModelLoaded(true);
        setIsLoading(false);
        setLoadingProgress(null);
      } catch (e: any) {
        // Fallback to Gemini Cloud API if WebGPU/WebLLM fails
        console.log('[WebLLM] WebGPU not available, switching to Gemini Cloud mode.');
        setUseCloudAPI(true);
        setIsLoading(false);
        setIsModelLoaded(true);
        setLoadingProgress(null);
      }

    } catch (err: any) {
      console.error('[AI] Initialization failed:', err);
      setError('System initialization failed. Please try again.');
      setIsLoading(false);
    }
  }, []);

  // Language selection
  const setLanguage = useCallback((lang: string) => {
    setSelectedLanguage(lang);
    setMessages([{
      id: Math.random().toString(36).substring(7),
      role: 'assistant',
      content: getGreeting(lang),
      timestamp: new Date(),
    }]);
  }, []);

  const getGreeting = (lang: string) => {
    switch (lang) {
      case 'hi': return 'नमस्ते! मैं टैम्बो असिस्टेंट हूँ। मैं आपके बिज़नेस में कैसे मदद कर सकता हूँ? 🙏';
      case 'ta': return 'வணக்கம்! நான் டாம்போ அசிஸ்டண்ட். உங்கள் வணிகத்திற்கு நான் எவ்வாறு உதவ முடியும்? 🙏';
      case 'te': return 'నమస్కారం! నేను టాంబో అసిస్టెంట్. మీ వ్యాపారానికి నేను ఎలా సహాయపడగలను? 🙏';
      case 'hinglish': return 'Namaste! Main Tambo Assistant hoon. Aapke business mein kaise madad kar sakta hoon? 🙏';
      default: return 'Hello! I am Tambo Assistant, powered by NVIDIA PersonaPlex. How can I help your business today? 🙏';
    }
  };

  // Send message
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!isModelLoaded || isThinking || !userMessage.trim()) return;

    try {
      setError(null);
      setIsThinking(true);

      const userMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMsg]);

      // Cloud API mode (Gemini)
      if (useCloudAPI) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({
              role: m.role,
              content: m.content,
            })),
            language: selectedLanguage,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to get response');
        }

        const data = await response.json();

        setMessages(prev => [...prev, {
          id: data.id || Math.random().toString(36).substring(7),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }]);

        setIsThinking(false);
        return;
      }

      // Local WebLLM mode (NVIDIA PersonaPlex)
      if (!engineRef.current) throw new Error('AI Engine missing');

      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const completion = await engineRef.current.chat.completions.create({
        messages: conversationHistory as any,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'No response.';

      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }]);

      setIsThinking(false);

    } catch (err: any) {
      console.error('[Chat] Error:', err);
      setError(err.message || 'System error. Please try again.');
      setIsThinking(false);
    }
  }, [isModelLoaded, isThinking, messages, useCloudAPI, selectedLanguage]);

  const clearMessages = useCallback(() => {
    if (selectedLanguage) {
      setMessages([{
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: getGreeting(selectedLanguage),
        timestamp: new Date(),
      }]);
    } else {
      setMessages([]);
    }
    setError(null);
  }, [selectedLanguage]);

  const retryLoadModel = useCallback(async () => {
    engineRef.current = null;
    setIsModelLoaded(false);
    setError(null);
    await initializeModel();
  }, [initializeModel]);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return {
    messages,
    isLoading,
    error,
    isModelLoaded,
    loadingProgress,
    sendMessage,
    clearMessages,
    retryLoadModel,
    isThinking,
    selectedLanguage,
    setLanguage,
  };
}