/**
 * Shared AI System Interfaces
 * Use these to coordinate between Member 1 (AI), Member 2 (UI), and Member 3 (DB)
 */

export enum KuberIntent {
    INVENTORY_CHECK = 'INVENTORY_CHECK',
    PLACE_ORDER = 'PLACE_ORDER',
    SHIPPING_QUERY = 'SHIPPING_QUERY',
    PARCHI_SCAN = 'PARCHI_SCAN',
    PROFIT_ANALYSIS = 'PROFIT_ANALYSIS',
    UDHAR_KHATA = 'UDHAR_KHATA',
    LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
    UNKNOWN = 'UNKNOWN'
}

export interface IntentResult {
    intent: KuberIntent;
    entities: {
        product?: string;
        quantity?: number;
        unit?: string;
        party?: string; // For Udhar-Khata or Customer name
        date?: string;
    };
    confidence: number;
    trigger?: string; // UI trigger code like [[SHOW_INVENTORY_CARD]]
}

/**
 * Interface for Member 3 (Database Engineer)
 * AI will call these types of queries
 */
export interface AIDataQuery {
    type: 'SELECT' | 'UPDATE' | 'INSERT';
    table: 'inventory' | 'orders' | 'udhar_khata' | 'sales';
    params: Record<string, any>;
}

/**
 * Interface for Member 2 (UI/UX)
 * Voice commands will trigger these component views
 */
export interface GenUITrigger {
    component: string; // e.g., 'StockCard', 'ProfitChart'
    props: Record<string, any>;
    priority: 'high' | 'normal';
}

/**
 * Parchi Scan Result
 */
export interface ParchiItem {
    product: string;
    quantity: number;
    unit: string;
    price: number;
}

export interface ParchiScanResult {
    items: ParchiItem[];
    totalAmount?: number;
    imagePath?: string;
    timestamp: number;
}
