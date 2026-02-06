'use client';

import { motion } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { colors, animation } from '@/styles/design-system';

interface VoiceOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceOrb({ 
  isListening, 
  isSpeaking, 
  isProcessing = false,
  onClick,
  size = 'lg' 
}: VoiceOrbProps) {
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  const getStatusText = () => {
    if (isListening) return 'Sun raha hoon...';
    if (isSpeaking) return 'Bol raha hoon...';
    if (isProcessing) return 'Soch raha hoon...';
    return 'Tap karein';
  };

  const getStatusColor = () => {
    if (isListening) return colors.brand.voice;
    if (isSpeaking) return colors.brand.success;
    if (isProcessing) return colors.brand.primary;
    return '#3A3A3C';
  };

  return (
    <div className="flex flex-col items-center">
      <motion.button
        className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center`}
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {/* Outer glow rings */}
        {(isListening || isSpeaking) && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${getStatusColor()}20 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${getStatusColor()}15 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
            />
          </>
        )}

        {/* Main orb background */}
        <motion.div
          className={`absolute inset-0 rounded-full`}
          style={{ backgroundColor: getStatusColor() }}
          animate={{
            boxShadow: isListening 
              ? `0 0 60px ${colors.brand.voice}60, 0 0 100px ${colors.brand.voice}30`
              : isSpeaking
              ? `0 0 60px ${colors.brand.success}60, 0 0 100px ${colors.brand.success}30`
              : '0 4px 20px rgba(0,0,0,0.5)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Inner gradient overlay */}
        <div 
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />

        {/* Icon */}
        <motion.div
          className="relative z-10 text-white"
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isListening ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          {isListening ? (
            <WaveformBars size={iconSizes[size]} />
          ) : isSpeaking ? (
            <Volume2 size={iconSizes[size]} strokeWidth={2.5} />
          ) : (
            <Mic size={iconSizes[size]} strokeWidth={2.5} />
          )}
        </motion.div>

        {/* Processing dots */}
        {isProcessing && !isListening && !isSpeaking && (
          <div className="absolute -bottom-1 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white"
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        )}
      </motion.button>

      {/* Status text */}
      <motion.p
        className="mt-3 text-xs font-medium text-white/60"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        key={getStatusText()}
      >
        {getStatusText()}
      </motion.p>
    </div>
  );
}

// Animated waveform bars for listening state
function WaveformBars({ size }: { size: number }) {
  const barCount = 4;
  const barWidth = size / 8;
  const barGap = 2;

  return (
    <div 
      className="flex items-center justify-center gap-[2px]"
      style={{ height: size * 0.6 }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-white rounded-full"
          style={{ width: barWidth, borderRadius: barWidth / 2 }}
          animate={{
            height: [size * 0.2, size * 0.5, size * 0.2],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
