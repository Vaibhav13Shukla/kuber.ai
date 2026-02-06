'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceOrb } from './ui/VoiceOrb';
import { VoiceTranscript, AIResponse, UserMessage } from './ui/VoiceTranscript';
import { InventoryCard, LowStockAlert } from './ui/Cards';
import { useKuberNativeAI } from '@/lib/native/useKuberNativeAI';
import { Onboarding } from './Onboarding';
import { getOnboardingState, setOnboardingState } from '@/lib/storage';
import { Camera, Mic } from 'lucide-react';
import { iosColors, iosTypography, iosComponents } from '@/styles/ios-design-system';

export function KuberApp() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('hinglish');
  
  const nativeAI = useKuberNativeAI(selectedLanguage);
  
  const {
    isListening,
    isSpeaking,
    transcript,
    voiceError,
    isScanning,
    isLoading,
    isThinking,
    messages,
    inventory,
    startListening,
    stopListening,
    scanParchi,
    initialize,
  } = nativeAI;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const state = getOnboardingState();
    if (state.hasCompletedOnboarding) {
      setShowOnboarding(false);
      setSelectedLanguage(state.selectedLanguage || 'hinglish');
    }
  }, []);

  const handleOnboardingComplete = (language: string) => {
    setOnboardingState({
      selectedLanguage: language,
      hasCompletedOnboarding: true,
      permissionsGranted: { microphone: true, camera: true },
    });
    setSelectedLanguage(language);
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <IOSStatusBar />
      
      <main className="flex flex-col h-screen pb-safe">
        <IOSHeader />
        
        <IOSScrollView 
          messages={messages}
          inventory={inventory}
          isListening={isListening}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
        />
        
        <VoiceTranscript
          transcript={transcript}
          isListening={isListening}
          isProcessing={isThinking}
        />

        <IOSScanningModal isScanning={isScanning} />
        <IOSErrorToast error={voiceError} />
      </main>
      
      <IOSBottomControls
        isListening={isListening}
        isSpeaking={isSpeaking}
        onMicClick={isListening ? stopListening : startListening}
        onScanClick={scanParchi}
      />
    </div>
  );
}

// iOS Loading Screen
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-[#007AFF] border-t-transparent mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-white/60 text-sm font-medium">Loading...</p>
      </motion.div>
    </div>
  );
}

// iOS Status Bar (HIG Standard)
function IOSStatusBar() {
  const [time, setTime] = useState('9:41');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-2 bg-black select-none">
      <span className="text-sm font-semibold tracking-wide">{time}</span>
      <div className="flex items-center gap-1.5">
        {/* Signal Bars */}
        <div className="flex items-end gap-[2px] h-3">
          {[0.4, 0.6, 0.8, 1].map((height, i) => (
            <div
              key={i}
              className="w-[3px] bg-white rounded-sm"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
        {/* WiFi */}
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21l12-12.02C20.93 5.9 16.69 4 12 4z" />
        </svg>
        {/* Battery */}
        <div className="flex items-center gap-1">
          <div className="w-6 h-[11px] border border-white/30 rounded-[3px] relative flex items-center p-[1px]">
            <div className="h-full bg-white rounded-[1px]" style={{ width: '75%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// iOS Navigation Header
function IOSHeader() {
  return (
    <div className="px-5 pt-2 pb-3">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <p className={`${iosTypography.subheadline} text-white/60`}>Good Morning,</p>
        <h1 className={`${iosTypography.title1} text-white mt-0.5`}>Seth Ji 👋</h1>
        <p className={`${iosTypography.subheadline} text-white/50 mt-0.5`}>
          &ldquo;Bolo, main sun raha hoon&rdquo;
        </p>
      </motion.div>
    </div>
  );
}

// iOS Scroll View with Content
function IOSScrollView({ 
  messages, 
  inventory,
  isListening, 
  isSpeaking,
  isThinking,
}: { 
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  inventory: Array<{ id?: number; productName: string; quantity: number; unit: string; reorderPoint?: number }>;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const inventoryItems = inventory.slice(0, 4).map(item => ({
    id: String(item.id || Math.random()),
    name: item.productName,
    quantity: item.quantity,
    unit: item.unit,
    reorderPoint: item.reorderPoint || 10,
    category: 'General',
  }));

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * 100), 0);
  const lowStockCount = inventory.filter(item => item.quantity <= 10).length;

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide"
    >
      {/* Empty State */}
      {messages.length === 0 && !isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-[28px] bg-gradient-to-br from-[#007AFF] to-[#AF52DE] flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mic className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className={`${iosTypography.title2} text-white mb-1`}>Tap mic to start</h2>
          <p className={`${iosTypography.subheadline} text-white/50`}>Try: &ldquo;Stock check karo&rdquo;</p>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {msg.role === 'user' ? (
              <UserMessage message={msg.content} />
            ) : (
              <AIResponse 
                message={msg.content} 
                isSpeaking={isSpeaking && index === messages.length - 1}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* iOS Cards */}
      {messages.length > 0 && inventoryItems.length > 0 && (
        <motion.div 
          className="space-y-3 pb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <InventoryCard
            items={inventoryItems}
            totalValue={totalValue}
            lowStockCount={lowStockCount}
            delay={0.2}
          />
          {lowStockCount > 0 && (
            <LowStockAlert
              items={inventory
                .filter(item => item.quantity <= 10)
                .map(item => ({
                  name: item.productName,
                  currentStock: item.quantity,
                  reorderPoint: item.reorderPoint || 10,
                  unit: item.unit,
                }))}
              delay={0.3}
            />
          )}
        </motion.div>
      )}

      {/* iOS Quick Actions */}
      {messages.length === 0 && <IOSQuickActions />}
    </div>
  );
}

// iOS Quick Actions (HIG Style)
function IOSQuickActions() {
  const actions = [
    { icon: '📦', label: 'Check Stock', command: 'Stock check karo', color: '#007AFF' },
    { icon: '💰', label: 'Profit', command: 'Aaj ka profit', color: '#34C759' },
    { icon: '📸', label: 'Scan', command: 'Parchi scan karo', color: '#FF9500' },
    { icon: '🚚', label: 'Ship', command: 'Shipping rates', color: '#AF52DE' },
  ];

  return (
    <div className="pt-6">
      <p className={`${iosTypography.caption2} text-white/40 mb-3 px-1`}>QUICK ACTIONS</p>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            className={`
              flex items-center gap-3 p-4 
              bg-[#1C1C1E] 
              rounded-[16px]
              active:scale-[0.96]
              active:opacity-80
              transition-all
              duration-150
              shadow-[0_1px_3px_rgba(0,0,0,0.12)]
            `}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + index * 0.05, ease: [0.4, 0, 0.2, 1] }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className={`${iosTypography.callout} text-white font-medium`}>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// iOS Scanning Modal
function IOSScanningModal({ isScanning }: { isScanning: boolean }) {
  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 rounded-full border-4 border-white/20 border-t-[#007AFF] mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className={`${iosTypography.callout} text-white`}>Parchi scan ho raha hai...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// iOS Error Toast
function IOSErrorToast({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          className="fixed top-16 left-4 right-4 bg-[#FF3B30] rounded-[12px] p-4 z-50 shadow-lg"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <p className={`${iosTypography.callout} text-white font-medium`}>{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// iOS Bottom Controls
function IOSBottomControls({ 
  isListening, 
  isSpeaking, 
  onMicClick,
  onScanClick,
}: { 
  isListening: boolean;
  isSpeaking: boolean;
  onMicClick: () => void;
  onScanClick: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent pt-24 pb-safe px-6">
      <div className="flex flex-col items-center">
        {/* iOS Camera Button */}
        <motion.button
          className="mb-5 w-11 h-11 rounded-full bg-[#1C1C1E] flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          onClick={onScanClick}
          whileTap={{ scale: 0.9 }}
        >
          <Camera className="w-5 h-5 text-white" />
        </motion.button>

        {/* Voice Orb */}
        <VoiceOrb
          isListening={isListening}
          isSpeaking={isSpeaking}
          onClick={onMicClick}
          size="lg"
        />
        
        {/* iOS Hint Label */}
        <motion.p
          className={`${iosTypography.footnote} text-white/40 mt-4 text-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isListening 
            ? 'Listening... Tap to stop'
            : 'Tap mic and speak in Hindi or English'
          }
        </motion.p>
      </div>
    </div>
  );
}
