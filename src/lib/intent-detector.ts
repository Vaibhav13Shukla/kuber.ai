import { KuberIntent, IntentResult } from '@/types/ai-interfaces';

/**
 * Detect user intent from text or voice input
 */
export function detectIntent(text: string): IntentResult {
  const input = text.toLowerCase().trim();

  // 1. Inventory Check
  if (input.includes('stock') || input.includes('maal') || input.includes('item') || input.includes('inventory')) {
    return {
      intent: KuberIntent.INVENTORY_CHECK,
      entities: extractEntities(input),
      confidence: 0.9,
      trigger: '[[SHOW_INVENTORY_CARD]]'
    };
  }

  // 2. Place Order
  if (input.includes('order') || input.includes('buy') || input.includes('kharid') || input.includes('mangao')) {
    return {
      intent: KuberIntent.PLACE_ORDER,
      entities: extractEntities(input),
      confidence: 0.85,
      trigger: '[[SHOW_ORDER_SUCCESS]]'
    };
  }

  // 3. Shipping / Logistics
  if (input.includes('ship') || input.includes('delivery') || input.includes('bhejna') || input.includes('courier')) {
    return {
      intent: KuberIntent.SHIPPING_QUERY,
      entities: extractEntities(input),
      confidence: 0.8,
      trigger: '[[SHOW_SHIPPING_OPTIONS]]'
    };
  }

  // 4. Parchi Scan
  if (input.includes('scan') || input.includes('parchi') || input.includes('photo') || input.includes('bill')) {
    return {
      intent: KuberIntent.PARCHI_SCAN,
      entities: {},
      confidence: 0.95,
      trigger: '[[SCAN_PARCHI]]'
    };
  }

  // 5. Profit / Analysis
  if (input.includes('profit') || input.includes('faida') || input.includes('kamayi') || input.includes('analysis') || input.includes('hikmat')) {
    return {
      intent: KuberIntent.PROFIT_ANALYSIS,
      entities: {},
      confidence: 0.85,
      trigger: '[[SHOW_PROFIT_CHART]]'
    };
  }

  // 6. Udhar-Khata (Credit Ledger)
  if (input.includes('udhar') || input.includes('khata') || input.includes('bokeh') || input.includes('hisab')) {
    return {
      intent: KuberIntent.UDHAR_KHATA,
      entities: extractEntities(input),
      confidence: 0.9,
      trigger: '[[SHOW_UDHAR_KHATA]]'
    };
  }

  // 7. Low Stock Alert
  if (input.includes('kam') || input.includes('low') || input.includes('khatam')) {
    return {
      intent: KuberIntent.LOW_STOCK_ALERT,
      entities: extractEntities(input),
      confidence: 0.8,
      trigger: '[[SHOW_LOW_STOCK_ALERT]]'
    };
  }

  return {
    intent: KuberIntent.UNKNOWN,
    entities: {},
    confidence: 0.5
  };
}

/**
 * Extract entities like product names, quantities, and party names
 */
function extractEntities(text: string): IntentResult['entities'] {
  const entities: IntentResult['entities'] = {};

  // Product extraction (mock)
  const products = ['atta', 'milk', 'doodh', 'oil', 'shakkar', 'chini', 'sugar', 'rice', 'chawal'];
  for (const p of products) {
    if (text.includes(p)) {
      entities.product = p;
      break;
    }
  }

  // Quantity extraction
  const quantMatch = text.match(/(\d+)\s*(kg|kilo|gram|gm|packet|bori|drum|ltr|liter)?/i);
  if (quantMatch) {
    entities.quantity = parseFloat(quantMatch[1]);
    entities.unit = quantMatch[2];
  }

  // Party name for Udhar-Khata (after 'pe' or 'ki')
  const partyMatch = text.match(/(?:pe|ka|ki|ko)\s+([a-zA-Z\u0900-\u097F]+)/i);
  if (partyMatch) {
    entities.party = partyMatch[1];
  }

  return entities;
}

/**
 * Get context instructions for AI based on intent
 */
export function getIntentContext(intentResult: IntentResult): string {
  const { intent, trigger } = intentResult;

  switch (intent) {
    case KuberIntent.INVENTORY_CHECK:
      return `\n[CONTEXT: User wants to check stock. Include ${trigger ?? '[[SHOW_INVENTORY_CARD]]'} in response if items found.]`;
    case KuberIntent.PLACE_ORDER:
      return `\n[CONTEXT: User wants to place an order. Confirm details and include ${trigger ?? '[[SHOW_ORDER_SUCCESS]]'}.]`;
    case KuberIntent.SHIPPING_QUERY:
      return `\n[CONTEXT: User is asking about shipping. Show options using ${trigger ?? '[[SHOW_SHIPPING_OPTIONS]]'}.]`;
    case KuberIntent.PARCHI_SCAN:
      return `\n[CONTEXT: User wants to scan a parchi. Inform them that the camera is opening. Trigger: ${trigger ?? '[[SCAN_PARCHI]]'}]`;
    case KuberIntent.PROFIT_ANALYSIS:
      return `\n[CONTEXT: User wants to see profit/sales analysis. Include ${trigger ?? '[[SHOW_PROFIT_CHART]]'}.]`;
    case KuberIntent.UDHAR_KHATA:
      return `\n[CONTEXT: User is checking or adding to the credit ledger (Udhar-Khata). Include ${trigger ?? '[[SHOW_UDHAR_KHATA]]'}.]`;
    case KuberIntent.LOW_STOCK_ALERT:
      return `\n[CONTEXT: User is worried about low stock. Show alerts via ${trigger ?? '[[SHOW_LOW_STOCK_ALERT]]'}.]`;
    default:
      return '';
  }
}
