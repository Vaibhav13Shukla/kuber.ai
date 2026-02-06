/**
 * Universal Voice Service - Works on Web AND Native iOS/Android
 * Automatically detects platform and uses appropriate API
 */

import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';

export interface VoiceConfig {
  language: string;
  enableBargeIn?: boolean;
  continuous?: boolean;
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

export type VoiceCallback = (state: VoiceState) => void;

export class NativeVoiceService {
  private listeners: VoiceCallback[] = [];
  private currentState: VoiceState = {
    isListening: false,
    isSpeaking: false,
    transcript: '',
    confidence: 0,
    error: null,
  };
  
  private webRecognition: any | null = null;
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.setupListeners();
    
    // Setup Web Speech API for browser
    if (!this.isNative && typeof window !== 'undefined') {
      this.setupWebSpeech();
    }
  }

  private setupListeners() {
    if (this.isNative) {
      // Listen for native speech recognition results
      SpeechRecognition.addListener('listeningState', (state: any) => {
        this.updateState({ isListening: state.status === 'started' });
      });
      
      SpeechRecognition.addListener('partialResults', (data: any) => {
        if (data.matches && data.matches.length > 0) {
          this.updateState({ transcript: data.matches[0] });
        }
      });
    }
  }

  private setupWebSpeech() {
    // Check if browser supports Web Speech API
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      this.webRecognition = new SpeechRecognitionAPI();
      this.webRecognition.continuous = false;
      this.webRecognition.interimResults = true;
      
      this.webRecognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        this.updateState({ 
          transcript: finalTranscript || interimTranscript,
          confidence: event.results[0]?.[0]?.confidence || 0
        });
      };
      
      this.webRecognition.onend = () => {
        this.updateState({ isListening: false });
      };
      
      this.webRecognition.onerror = (event: any) => {
        console.error('[Web Speech] Error:', event.error);
        this.updateState({ 
          isListening: false,
          error: event.error === 'not-allowed' ? 'Microphone permission denied' : 'Speech recognition error'
        });
      };
    }
  }

  private updateState(partialState: Partial<VoiceState>) {
    this.currentState = { ...this.currentState, ...partialState };
    this.listeners.forEach(callback => callback(this.currentState));
  }

  subscribe(callback: VoiceCallback): () => void {
    this.listeners.push(callback);
    callback(this.currentState);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  async requestPermissions(): Promise<boolean> {
    if (this.isNative) {
      try {
        const result = await SpeechRecognition.requestPermissions();
        return result.speechRecognition === 'granted';
      } catch (error) {
        console.error('[NativeVoice] Permission error:', error);
        return false;
      }
    } else {
      // Web - request mic permission
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      } catch {
        return false;
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    if (this.isNative) {
      try {
        const available = await SpeechRecognition.available();
        return available.available;
      } catch (error) {
        return false;
      }
    } else {
      // Check Web Speech API availability
      return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
    }
  }

  async startListening(config: VoiceConfig): Promise<void> {
    try {
      const langCode = this.mapLanguageCode(config.language);
      
      if (this.isNative) {
        // Native iOS/Android
        await SpeechRecognition.start({
          language: langCode,
          maxResults: 1,
          prompt: 'Bolo...',
          partialResults: true,
          popup: false,
        });
        this.updateState({ isListening: true, transcript: '', error: null });
      } else if (this.webRecognition) {
        // Web browser
        this.webRecognition.lang = langCode;
        this.webRecognition.start();
        this.updateState({ isListening: true, transcript: '', error: null });
      } else {
        throw new Error('Speech recognition not available on this device');
      }
    } catch (error: any) {
      console.error('[Voice] Start listening error:', error);
      this.updateState({
        isListening: false,
        error: error.message || 'Failed to start listening',
      });
    }
  }

  async stopListening(): Promise<string> {
    try {
      if (this.isNative) {
        await SpeechRecognition.stop();
      } else if (this.webRecognition) {
        this.webRecognition.stop();
      }
      
      this.updateState({ isListening: false });
      return this.currentState.transcript;
    } catch (error: any) {
      console.error('[Voice] Stop listening error:', error);
      this.updateState({ isListening: false });
      return '';
    }
  }

  async speak(text: string, language: string = 'hi-IN'): Promise<void> {
    return new Promise((resolve) => {
      this.updateState({ isSpeaking: true });

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.mapLanguageCode(language);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find Indian voice
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(v => 
          v.lang.includes('hi') || 
          v.lang.includes('en-IN') ||
          v.name.includes('India')
        );
        
        if (indianVoice) {
          utterance.voice = indianVoice;
        }

        utterance.onend = () => {
          this.updateState({ isSpeaking: false });
          resolve();
        };

        utterance.onerror = () => {
          this.updateState({ isSpeaking: false });
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        this.updateState({ isSpeaking: false });
        resolve();
      }
    });
  }

  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.updateState({ isSpeaking: false });
  }

  async bargeIn(config: VoiceConfig): Promise<void> {
    this.stopSpeaking();
    await this.startListening(config);
  }

  private mapLanguageCode(lang: string): string {
    const mapping: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'hinglish': 'hi-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'en-IN': 'en-IN',
    };

    return mapping[lang] || 'en-US';
  }

  getState(): VoiceState {
    return { ...this.currentState };
  }
  
  getPlatform(): string {
    return this.isNative ? 'native' : 'web';
  }
}

// Singleton instance
export const nativeVoice = new NativeVoiceService();

// Hook-friendly function to get voice state
export function useNativeVoiceState(): VoiceState {
  return nativeVoice.getState();
}
