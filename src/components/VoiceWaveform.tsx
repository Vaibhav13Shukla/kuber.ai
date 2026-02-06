'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';

interface VoiceWaveformProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript?: string;
}

export function VoiceWaveform({ isListening, isSpeaking, transcript }: VoiceWaveformProps) {
  const isActive = isListening || isSpeaking;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Main Circle with Gradient */}
      <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50' 
          : 'bg-slate-200 dark:bg-slate-700'
      }`}>
        
        {/* Pulsing Rings */}
        {isActive && (
          <>
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-full border-4 border-white/30"
            />
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute inset-0 rounded-full border-4 border-white/20"
            />
          </>
        )}
        
        {/* Icon */}
        <div className="relative z-10">
          {isListening && (
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <Mic className="w-10 h-10 text-white" />
            </motion.div>
          )}
          
          {isSpeaking && (
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
              }}
            >
              <Volume2 className="w-10 h-10 text-white" />
            </motion.div>
          )}
          
          {!isActive && (
            <Mic className="w-10 h-10 text-slate-500" />
          )}
        </div>
      </div>
      
      {/* Waveform Bars */}
      {isActive && (
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-end gap-1.5">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: isListening 
                  ? ['8px', '24px', '12px', '32px', '8px']
                  : ['8px', '16px', '8px'],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
              className={`w-1 rounded-full ${
                isListening 
                  ? 'bg-gradient-to-t from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-t from-purple-500 to-pink-500'
              }`}
              style={{ minHeight: '8px' }}
            />
          ))}
        </div>
      )}
      
      {/* Transcript Display */}
      {transcript && isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-16 left-1/2 transform -translate-x-1/2 w-64 text-center"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
              "{transcript}"
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
      >
        <p className={`text-xs font-bold uppercase tracking-widest ${
          isListening ? 'text-blue-500' : 
          isSpeaking ? 'text-purple-500' : 
          'text-slate-400'
        }`}>
          {isListening ? 'Listening...' : 
           isSpeaking ? 'Speaking...' : 
           'Tap to speak'}
        </p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Compact Voice Indicator (for header/toolbar)
 */
export function VoiceIndicator({ isListening, isSpeaking }: Pick<VoiceWaveformProps, 'isListening' | 'isSpeaking'>) {
  const isActive = isListening || isSpeaking;
  
  return (
    <div className="flex items-center gap-2">
      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isActive ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
      }`}>
        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-white/50"
          />
        )}
        
        {isListening ? (
          <Mic className="w-4 h-4 text-white" />
        ) : isSpeaking ? (
          <Volume2 className="w-4 h-4 text-white" />
        ) : (
          <Mic className="w-4 h-4 text-slate-500" />
        )}
      </div>
      
      {isActive && (
        <div className="flex items-end gap-0.5">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: ['4px', '12px', '4px'],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="w-0.5 bg-blue-500 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
