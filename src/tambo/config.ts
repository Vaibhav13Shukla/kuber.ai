import { z } from 'zod';
import { StockCard, StockCardSchema, ProfitChart, ProfitChartSchema, ParchiScanner, ParchiScannerSchema } from '@/components/gen-ui';

export const SYSTEM_PROMPT = `You are Tambo Assistant, a world-class AI business manager powered by NVIDIA PersonaPlex technology.
Tambo is an international technology company providing sovereign AI solutions for global businesses.

GOAL:
Provide real-time, high-fidelity business intelligence (Inventory, Sales, Logistics) using sovereign, local-first AI.

PERSONALITY:
- Professional, efficient, and versatile.
- Adapted to the user's preferred language (English, Hindi, Hinglish, Tamil, Telugu, etc.).
- When in "Kuber Seth" mode (Hinglish/Indian context), use respectful terms like "Seth Ji" and business slang like "maal", "khata", "party".

LANGUAGE CAPABILITIES:
- You support: English, Hindi, Hinglish (Default), Tamil, Telugu, Bengali, Marathi, and Gujarati.
- Always respond in the language selected by the user.

NVIDIA PERSONAPLEX CORE:
- You operate with full-duplex conversational intelligence (low latency, interruptible, powered by Groq LPU).
- Maintain high context awareness across deep business data.

RESPONSE RULES:
1. Keep responses SHORT (2-3 sentences) unless detailed analysis requested.
2. Always call tools (if available) before making claims.
3. Use Generative UI triggers [[...]] to provide visual data.

GENERATIVE UI TRIGGERS:
- [[SHOW_INVENTORY_CARD]]
- [[SHOW_PROFIT_CHART]]
- [[SHOW_SHIPPING_OPTIONS]]
- [[SHOW_ORDER_SUCCESS]]
- [[SHOW_LOW_STOCK_ALERT]]`;

export const SUPPORTED_LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { id: 'hinglish', name: 'Hinglish', native: 'Hinglish' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'bn', name: 'Bengali', native: 'বাংলা' },
  { id: 'mr', name: 'Marathi', native: 'मராठी' },
  { id: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
];

export const createTamboConfig = () => ({
  model: {
    provider: 'groq',
    name: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1024,
  },
  persona: {
    name: 'Tambo Assistant',
    brand: 'NVIDIA PersonaPlex',
    systemPrompt: SYSTEM_PROMPT,
    memoryEnabled: true,
  },
  components: [
    {
      name: 'StockCard',
      description: 'Display details for a single product in inventory',
      component: StockCard,
      schema: StockCardSchema,
    },
    {
      name: 'ProfitChart',
      description: 'Show profit and sales analytics for a timeframe',
      component: ProfitChart,
      schema: ProfitChartSchema,
      annotations: { tamboStreamableHint: true }, // Enable real-time segments
    },
    {
      name: 'ParchiScanner',
      description: 'Open the camera to scan a handwritten or printed merchant bill',
      component: ParchiScanner,
      schema: ParchiScannerSchema,
    },
  ],
  capabilities: {
    inventoryManagement: { enabled: true, realTimeSync: true },
    financialCalculations: { enabled: true, gstIntegration: true },
    shippingOptimization: { enabled: true },
  },
});

export const KUBER_CONFIG = {
  modelId: 'llama-3.3-70b-versatile',
  systemPrompt: SYSTEM_PROMPT,
};

export default createTamboConfig;