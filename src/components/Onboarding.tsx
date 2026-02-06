'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  ChevronRight,
  Mic,
  Camera,
  Check,
  Sparkles,
  Store,
  Globe,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/tambo/config';

type OnboardingStep = 'splash' | 'language' | 'permissions' | 'complete';

interface OnboardingProps {
  onComplete: (language: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('splash');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({
    microphone: false,
    camera: false,
  });

  // Auto-progress from splash to language selection
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('language');
      }, 2500); // 2.5 seconds splash
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleLanguageSelect = (langId: string) => {
    setSelectedLanguage(langId);
    setTimeout(() => {
      setStep('permissions');
    }, 300);
  };

  const requestPermission = async (type: 'microphone' | 'camera') => {
    try {
      if (type === 'microphone') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissions(prev => ({ ...prev, microphone: true }));
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissions(prev => ({ ...prev, camera: true }));
      }
    } catch (error) {
      console.error(`[Permissions] ${type} access denied:`, error);
      // Allow user to skip - we'll handle gracefully later
    }
  };

  const handleCompleteOnboarding = () => {
    if (!selectedLanguage) return;
    
    setStep('complete');
    setTimeout(() => {
      onComplete(selectedLanguage);
    }, 1500);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'splash' && <SplashScreen key="splash" />}
        {step === 'language' && (
          <LanguageSelection
            key="language"
            onSelect={handleLanguageSelect}
          />
        )}
        {step === 'permissions' && (
          <PermissionsScreen
            key="permissions"
            permissions={permissions}
            onRequestPermission={requestPermission}
            onContinue={handleCompleteOnboarding}
          />
        )}
        {step === 'complete' && <CompletionScreen key="complete" />}
      </AnimatePresence>
    </div>
  );
}

// 1. SPLASH SCREEN
function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col items-center justify-center text-white relative overflow-hidden"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]"
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative z-10"
      >
        <div className="w-32 h-32 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-[48px] flex items-center justify-center shadow-2xl shadow-blue-500/50 mb-8">
          <Store className="w-16 h-16 text-white" />
        </div>
      </motion.div>

      {/* Brand Name */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-center space-y-2"
      >
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
          KUBER.AI
        </h1>
        <p className="text-slate-400 font-semibold tracking-wider text-sm uppercase">
          Your Business Intelligence Partner
        </p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-16 flex flex-col items-center gap-4"
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          ))}
        </div>
        <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">
          Initializing System
        </p>
      </motion.div>
    </motion.div>
  );
}

// 2. LANGUAGE SELECTION
interface LanguageSelectionProps {
  onSelect: (langId: string) => void;
}

function LanguageSelection({ onSelect }: LanguageSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col text-white p-8 relative z-10"
    >
      {/* Header */}
      <div className="mt-12 space-y-6 mb-12">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-8 h-8 text-blue-400" />
            <h1 className="text-5xl font-black tracking-tighter leading-none">
              Choose Your<br />Language
            </h1>
          </div>
          <p className="text-slate-400 text-lg font-medium">
            Select the language you're most comfortable with
          </p>
        </motion.div>
      </div>

      {/* Language Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex-1 overflow-y-auto pb-8"
      >
        <div className="grid grid-cols-1 gap-4">
          {SUPPORTED_LANGUAGES.map((lang: any, index: number) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(lang.id)}
              className="group relative flex items-center justify-between p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-3xl transition-all duration-500" />
              
              <div className="relative flex flex-col items-start">
                <span className="text-2xl font-bold mb-1">{lang.native}</span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400">
                  {lang.name}
                </span>
              </div>
              
              <ChevronRight className="relative w-6 h-6 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="py-6 text-center"
      >
        <p className="text-xs uppercase font-black tracking-widest text-slate-600">
          Powered by NVIDIA NIM • Tambo AI
        </p>
      </motion.div>
    </motion.div>
  );
}

// 3. PERMISSIONS SCREEN
interface PermissionsScreenProps {
  permissions: {
    microphone: boolean;
    camera: boolean;
  };
  onRequestPermission: (type: 'microphone' | 'camera') => void;
  onContinue: () => void;
}

function PermissionsScreen({
  permissions,
  onRequestPermission,
  onContinue,
}: PermissionsScreenProps) {
  const allGranted = permissions.microphone && permissions.camera;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col text-white p-8 relative z-10"
    >
      {/* Header */}
      <div className="mt-12 space-y-6 mb-12">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-5xl font-black tracking-tighter leading-none">
              Enable Smart<br />Features
            </h1>
          </div>
          <p className="text-slate-400 text-lg font-medium">
            Grant permissions for the best experience
          </p>
        </motion.div>
      </div>

      {/* Permission Cards */}
      <div className="flex-1 space-y-6">
        {/* Microphone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`relative p-6 rounded-3xl border ${
            permissions.microphone
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-white/5 border-white/10'
          } backdrop-blur-xl transition-all duration-300`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              permissions.microphone ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {permissions.microphone ? (
                <Check className="w-7 h-7 text-white" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Voice Commands</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Speak naturally to manage inventory, check orders, and get instant insights without typing.
              </p>
              
              {!permissions.microphone && (
                <button
                  onClick={() => onRequestPermission('microphone')}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Enable Microphone
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Camera */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`relative p-6 rounded-3xl border ${
            permissions.camera
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-white/5 border-white/10'
          } backdrop-blur-xl transition-all duration-300`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              permissions.camera ? 'bg-green-500' : 'bg-purple-500'
            }`}>
              {permissions.camera ? (
                <Check className="w-7 h-7 text-white" />
              ) : (
                <Camera className="w-7 h-7 text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Parchi Scanner</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Snap photos of handwritten bills to automatically extract and record transactions.
              </p>
              
              {!permissions.camera && (
                <button
                  onClick={() => onRequestPermission('camera')}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
                >
                  Enable Camera
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <button
          onClick={onContinue}
          disabled={!allGranted}
          className={`w-full py-6 px-8 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
            allGranted
              ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:shadow-2xl hover:shadow-purple-500/50 active:scale-98'
              : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          {allGranted ? (
            <>
              <span>Get Started</span>
              <ChevronRight className="w-6 h-6" />
            </>
          ) : (
            <span>Grant All Permissions to Continue</span>
          )}
        </button>
        
        {!allGranted && (
          <p className="text-center text-xs text-slate-500 mt-4">
            You can skip and enable later in settings, but features will be limited
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// 4. COMPLETION SCREEN
function CompletionScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex items-center justify-center text-white"
    >
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-32 h-32 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50"
        >
          <Check className="w-16 h-16 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-4xl font-black tracking-tight mb-3">
            All Set!
          </h2>
          <p className="text-slate-400 text-lg font-medium">
            Loading your intelligent workspace...
          </p>
        </motion.div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
