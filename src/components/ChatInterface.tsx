'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useVoiceKuberAI } from '@/hooks/useVoiceKuberAI';
import { cn, parseUITriggers, removeTriggers } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  RotateCcw,
  ChevronRight,
  Box,
  Truck,
  AlertCircle,
  CheckCircle2,
  Mic,
  Languages,
  ArrowRight,
  TrendingUp,
  Package,
  Loader2,
  Camera
} from 'lucide-react';
import { Onboarding } from './Onboarding';
import { VoiceWaveform, VoiceIndicator } from './VoiceWaveform';
import { getOnboardingState, markOnboardingComplete, setOnboardingState } from '@/lib/storage';

export function ChatInterface() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  // Check onboarding status on mount
  useEffect(() => {
    const state = getOnboardingState();
    setHasCompletedOnboarding(state.hasCompletedOnboarding);
    setSelectedLang(state.selectedLanguage);
    setIsCheckingOnboarding(false);
  }, []);

  // Show onboarding if not completed
  if (isCheckingOnboarding) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={(language) => {
          setOnboardingState({
            selectedLanguage: language,
            hasCompletedOnboarding: true,
            permissionsGranted: { microphone: true, camera: true },
          });
          markOnboardingComplete();
          setSelectedLang(language);
          setHasCompletedOnboarding(true);
        }}
      />
    );
  }

  return <MainChatInterface initialLanguage={selectedLang!} />;
}

function MainChatInterface({ initialLanguage }: { initialLanguage: string }) {
  const voiceAI = useVoiceKuberAI({
    language: initialLanguage,
    enableBargeIn: true,
    autoStart: false,
    voiceRate: 0.9,
  });

  const {
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
    isListening,
    isSpeaking,
    transcript,
    voiceError,
    isVoiceSupported,
    startListening,
    stopListening,
    stopSpeaking,
  } = voiceAI;

  const [input, setInput] = useState('');
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial language
  useEffect(() => {
    if (!selectedLanguage && initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage, selectedLanguage, setLanguage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  // 1. Loading Screen
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#010101] text-white">
        <div className="text-center space-y-10 p-8 max-w-md w-full">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-30 animate-pulse"></div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto">
                <Bot className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold tracking-tight">Tambo</h2>
            <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Powered by NVIDIA PersonaPlex</p>
          </div>

          <div className="space-y-4 px-4">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
              <motion.div
                className="bg-blue-500 h-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress?.progress || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>{loadingProgress?.text || 'Initializing...'}</span>
              <span>{loadingProgress?.progress || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !isModelLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#010101] p-6">
        <div className="text-center space-y-8 max-w-sm bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10">
          <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">System Offline</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          </div>
          <button
            onClick={retryLoadModel}
            className="w-full py-5 px-6 bg-white text-black rounded-3xl font-black flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-5 h-5" />
            RECONNECT SYSTEM
          </button>
        </div>
      </div>
    );
  }


  // 4. Main Chat View
  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200 px-6 py-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-[22px] flex items-center justify-center shadow-2xl shadow-slate-200">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-xl tracking-tight leading-none uppercase italic">Tambo</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PersonaPlex 1.0 Live</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearMessages}
          className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-32">
        <AnimatePresence>
          {messages.map((m, i) => {
            const triggers = parseUITriggers(m.content);
            const cleanContent = removeTriggers(m.content);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[90%]",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-6 py-4 rounded-[28px] text-sm md:text-base leading-relaxed font-medium shadow-sm",
                  m.role === 'user'
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                )}>
                  {cleanContent}
                </div>

                {/* Generative UI Components via Tambo */}
                {/* Note: Using KuberApp.tsx for new UI implementation */}
              </motion.div>
            );
          })}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto flex items-center gap-3 bg-red-50 text-red-600 px-6 py-4 rounded-[24px] border border-red-100 shadow-sm max-w-sm mb-4"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </motion.div>
          )}

          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-6 py-4 rounded-[28px] border border-slate-100 shadow-sm"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map(dot => (
                  <motion.div
                    key={dot}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: dot * 0.2 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">PERSONAPLEX ANALYZING...</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Mode Overlay */}
      <AnimatePresence>
        {showVoiceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 z-50 flex flex-col items-center justify-center"
            onClick={() => !isListening && !isSpeaking && setShowVoiceMode(false)}
          >
            <VoiceWaveform
              isListening={isListening}
              isSpeaking={isSpeaking}
              transcript={transcript}
            />

            <div className="absolute bottom-12 flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white font-bold hover:bg-white/20 transition-all"
              >
                {isListening ? 'Stop' : 'Start'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVoiceMode(false);
                }}
                className="px-8 py-4 bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-3xl text-red-300 font-bold hover:bg-red-500/30 transition-all"
              >
                Close
              </button>
            </div>

            {voiceError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-32 bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl text-sm font-bold"
              >
                {voiceError}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto flex items-center gap-3 pointer-events-auto">
          {/* Voice Mode Button */}
          <button
            onClick={() => setShowVoiceMode(true)}
            title="Voice Mode"
            disabled={!isVoiceSupported || !isModelLoaded}
            className={cn(
              "w-14 h-14 rounded-[24px] border flex items-center justify-center transition-all active:scale-95 group shadow-xl",
              isListening || isSpeaking
                ? "bg-gradient-to-br from-blue-500 to-purple-500 border-purple-400 text-white"
                : "bg-white border-slate-200 text-slate-400 hover:text-blue-500 disabled:opacity-30"
            )}
          >
            {(isListening || isSpeaking) ? (
              <VoiceIndicator isListening={isListening} isSpeaking={isSpeaking} />
            ) : (
              <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Text Input */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex items-center bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-2xl focus-within:ring-4 ring-blue-500/10 transition-all"
          >
            <input
              className="flex-1 px-6 py-5 bg-transparent outline-none font-bold text-slate-900 placeholder:text-slate-300"
              placeholder={isListening ? "Listening..." : "Ask Assistant..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={!isModelLoaded || isThinking}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={!isModelLoaded || isThinking || !input.trim()}
              className="px-6 h-full flex items-center justify-center text-slate-900 disabled:opacity-20 hover:text-blue-600 transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
