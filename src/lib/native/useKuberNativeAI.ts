/**
 * useKuberNativeAI Hook
 * Full-duplex voice AI with native iOS/Android integration
 * Offline-first with WebLLM + Dexie.js
 * 
 * FOR MEMBER 1: AI ARCHITECT
 * This is the main hook connecting native voice, camera, AI, and database
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { nativeVoice, VoiceState, VoiceConfig } from './voice';
import { nativeCamera, ParchiImage, ExtractedItem } from './camera';
import { dataService, InventoryItem, Order } from './data';
import { useKuberAI } from '@/hooks/useKuberAI';
import { detectIntent } from '@/lib/intent-detector';
import { scanParchi } from '@/lib/vision-optimizer';

// Types
export interface NativeAIState {
  // Voice
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  voiceError: string | null;
  
  // AI
  isThinking: boolean;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  
  // Camera
  isScanning: boolean;
  
  // Data
  inventory: InventoryItem[];
  isLoading: boolean;
}

export interface UseKuberNativeAIReturn extends NativeAIState {
  // Voice controls
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  stopSpeaking: () => void;
  
  // Camera controls
  scanParchi: () => Promise<void>;
  
  // AI controls
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  
  // Data controls
  refreshInventory: () => Promise<void>;
  
  // Initialization
  initialize: () => Promise<void>;
}

export function useKuberNativeAI(language: string = 'hinglish'): UseKuberNativeAIReturn {
  // Voice state from native service
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    confidence: 0,
    error: null,
  });

  // AI state
  const ai = useKuberAI();
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // Camera state
  const [isScanning, setIsScanning] = useState(false);

  // Data state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to voice state changes
  useEffect(() => {
    const unsubscribe = nativeVoice.subscribe((state) => {
      setVoiceState(state);
    });
    return unsubscribe;
  }, []);

  // Initialize on mount
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Initialize database
      await dataService.initialize();
      
      // Load initial inventory
      const items = await dataService.getInventory();
      setInventory(items);
      
      // Check voice availability
      const voiceAvailable = await nativeVoice.isAvailable();
      if (!voiceAvailable) {
        console.warn('[useKuberNativeAI] Speech recognition not available');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('[useKuberNativeAI] Initialization error:', error);
      setIsLoading(false);
    }
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      const config: VoiceConfig = {
        language,
        enableBargeIn: true,
        continuous: false,
      };
      
      await nativeVoice.startListening(config);
    } catch (error: any) {
      console.error('[useKuberNativeAI] Start listening error:', error);
    }
  }, [language]);

  // Stop listening and process
  const stopListening = useCallback(async () => {
    try {
      const transcript = await nativeVoice.stopListening();
      
      if (transcript.trim()) {
        // Process the voice input
        await processVoiceInput(transcript);
      }
    } catch (error: any) {
      console.error('[useKuberNativeAI] Stop listening error:', error);
    }
  }, []);

  // Stop speaking (barge-in)
  const stopSpeaking = useCallback(() => {
    nativeVoice.stopSpeaking();
  }, []);

  // Process voice input with AI
  const processVoiceInput = useCallback(async (text: string) => {
    try {
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setIsThinking(true);

      // Detect intent
      const intent = detectIntent(text);
      console.log('[useKuberNativeAI] Intent detected:', intent);

      // Handle based on intent
      let response = '';
      
      switch (intent.intent) {
        case 'INVENTORY_CHECK':
          response = await handleInventoryCheck(intent.entities);
          break;
          
        case 'PLACE_ORDER':
          response = await handlePlaceOrder(intent.entities, text);
          break;
          
        case 'PROFIT_ANALYSIS':
          response = await handleProfitAnalysis();
          break;
          
        case 'UDHAR_KHATA':
          response = await handleUdharKhata(intent.entities);
          break;
          
        case 'SHIPPING_QUERY':
          response = await handleShippingQuery(intent.entities);
          break;
          
        case 'PARCHI_SCAN':
          response = 'Camera opening for parchi scan...';
          setTimeout(() => scanParchiNative(), 500);
          break;
          
        default:
          // Use AI for general queries
          response = await getAIResponse(text);
      }

      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Speak response
      setIsThinking(false);
      await nativeVoice.speak(response, language);
      
    } catch (error: any) {
      console.error('[useKuberNativeAI] Process voice error:', error);
      setIsThinking(false);
      
      const errorMsg = 'Sorry, kuch galat ho gaya. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      await nativeVoice.speak(errorMsg, language);
    }
  }, [language]);

  // Handle inventory check
  const handleInventoryCheck = async (entities: any): Promise<string> => {
    try {
      const items = await dataService.getInventory();
      const stats = await dataService.getInventoryStats();
      
      if (entities.product) {
        // Search for specific product
        const product = items.find(p => 
          p.productName.toLowerCase().includes(entities.product.toLowerCase())
        );
        
        if (product) {
          return `${product.productName}: ${product.quantity} ${product.unit} available. ${product.quantity <= 10 ? 'Stock kam hai!' : 'Stock theek hai.'}`;
        } else {
          return `Sorry, ${entities.product} nahi mila. Stock mein nahi hai.`;
        }
      }
      
      // General inventory summary
      return `Total ${stats.totalItems} items hain. Value: ₹${stats.totalValue.toLocaleString('en-IN')}. ${stats.lowStockCount} items ka stock kam hai.`;
      
    } catch (error) {
      return 'Stock information nahi mil raha. Please try again.';
    }
  };

  // Handle place order
  const handlePlaceOrder = async (entities: any, text: string): Promise<string> => {
    try {
      // Extract order details from entities and text
      // This is simplified - in production, use more sophisticated extraction
      
      return `Order samajh liya. Abhi payment mode choose karein - Cash, UPI, ya Card?`;
    } catch (error) {
      return 'Order place nahi ho raha. Please try again.';
    }
  };

  // Handle profit analysis
  const handleProfitAnalysis = async (): Promise<string> => {
    try {
      const analysis = await dataService.getProfitAnalysis(7);
      
      return `Is hafte ₹${analysis.totalProfit.toLocaleString('en-IN')} kamai hui hai. Revenue: ₹${analysis.totalRevenue.toLocaleString('en-IN')}. Average margin: ${analysis.averageMargin.toFixed(1)}%.`;
    } catch (error) {
      return 'Profit information nahi mil raha.';
    }
  };

  // Handle udhar-khata
  const handleUdharKhata = async (entities: any): Promise<string> => {
    try {
      const outstanding = await dataService.getOutstandingUdhar();
      
      if (outstanding.length === 0) {
        return 'Koi outstanding udhar nahi hai. Sab clear hai!';
      }
      
      const totalOutstanding = outstanding.reduce((sum, o) => sum + o.amount, 0);
      return `Total ₹${totalOutstanding.toLocaleString('en-IN')} udhar baki hai. ${outstanding.length} parties se recover karna hai.`;
    } catch (error) {
      return 'Udhar-khata information nahi mil raha.';
    }
  };

  // Handle shipping query
  const handleShippingQuery = async (entities: any): Promise<string> => {
    return `Shipping options ready hain. BlueDart: ₹180 (2 days), Delhivery: ₹128 (3 days), DTDC: ₹95 (5 days). Best option: Delhivery.`;
  };

  // Get AI response for general queries
  const getAIResponse = async (text: string): Promise<string> => {
    // Use existing AI hook
    if (ai.isModelLoaded) {
      // Add context about being a native app
      const contextualPrompt = `[Native App Context] ${text}`;
      // This would integrate with your existing AI
      return 'Main samajh gaya. Aapko kya help chahiye?';
    }
    
    return 'Namaste! Main Kuber AI hoon. Stock check, order place, ya profit dekhne ke liye bolein.';
  };

  // Scan parchi using native camera
  const scanParchiNative = useCallback(async () => {
    try {
      setIsScanning(true);
      
      // Capture photo
      const image = await nativeCamera.captureParchi();
      
      if (!image) {
        setIsScanning(false);
        return;
      }

      // Process with OCR
      const parchiData = await scanParchi(image.base64);
      
      // Create response
      if (parchiData.items.length > 0) {
        const itemList = parchiData.items.map((i: { product: string; quantity?: number }) => `${i.product} (${i.quantity || 1})`).join(', ');
        const response = `Parchi se ${parchiData.items.length} items mile: ${itemList}. Order banaoon?`;
        
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        await nativeVoice.speak(response, language);
      } else {
        const response = 'Sorry, parchi read nahi ho rahi. Clear photo lein.';
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        await nativeVoice.speak(response, language);
      }
      
      setIsScanning(false);
    } catch (error) {
      console.error('[useKuberNativeAI] Scan parchi error:', error);
      setIsScanning(false);
    }
  }, [language]);

  // Send text message
  const sendMessage = useCallback(async (message: string) => {
    await processVoiceInput(message);
  }, [processVoiceInput]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Refresh inventory
  const refreshInventory = useCallback(async () => {
    const items = await dataService.getInventory();
    setInventory(items);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // Voice
    isListening: voiceState.isListening,
    isSpeaking: voiceState.isSpeaking,
    transcript: voiceState.transcript,
    voiceError: voiceState.error,
    
    // AI
    isThinking,
    messages,
    
    // Camera
    isScanning,
    
    // Data
    inventory,
    isLoading,
    
    // Controls
    startListening,
    stopListening,
    stopSpeaking,
    scanParchi: scanParchiNative,
    sendMessage,
    clearChat,
    refreshInventory,
    initialize,
  };
}
