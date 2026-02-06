'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/styles/design-system';

interface VoiceTranscriptProps {
  transcript: string;
  isListening: boolean;
  isProcessing?: boolean;
}

export function VoiceTranscript({ transcript, isListening, isProcessing }: VoiceTranscriptProps) {
  return (
    <AnimatePresence>
      {(transcript || isListening) && (
        <motion.div
          className="fixed bottom-36 left-4 right-4 z-40"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div 
            className="bg-[#1C1C1E]/95 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-2xl"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            {/* Listening indicator */}
            {isListening && !transcript && (
              <div className="flex items-center justify-center gap-3 py-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-4 rounded-full bg-blue-400"
                      animate={{
                        height: [16, 32, 16],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
                <span className="text-white/70 text-sm font-medium">Listening...</span>
              </div>
            )}

            {/* Transcript text */}
            {transcript && (
              <motion.p
                className="text-white text-lg font-medium leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                &ldquo;{transcript}&rdquo;
              </motion.p>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <motion.div
                className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{
                        scale: [0.6, 1, 0.6],
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
                <span className="text-white/60 text-sm">Processing...</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// AI Response bubble
interface AIResponseProps {
  message: string;
  isSpeaking?: boolean;
}

export function AIResponse({ message, isSpeaking }: AIResponseProps) {
  return (
    <motion.div
      className="flex items-start gap-3 mb-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">K</span>
      </div>
      
      {/* Message bubble */}
      <div className="flex-1">
        <div className="bg-[#1C1C1E] rounded-2xl rounded-tl-none p-4 border border-white/5">
          <p className="text-white leading-relaxed">{message}</p>
          
          {isSpeaking && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-green-400"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
              <span className="text-green-400 text-xs">Speaking...</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// User message bubble
interface UserMessageProps {
  message: string;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <motion.div
      className="flex items-start gap-3 mb-4 justify-end"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Message bubble */}
      <div className="bg-blue-500 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
        <p className="text-white leading-relaxed">{message}</p>
      </div>
      
      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">You</span>
      </div>
    </motion.div>
  );
}
