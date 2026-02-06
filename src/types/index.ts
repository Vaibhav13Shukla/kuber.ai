/**
 * Type Definitions for Kuber.ai
 */

export interface AIConfig {
    modelName: string;
    temperature: number;
    maxTokens: number;
    topP: number;
}

export interface ToolCall {
    name: string;
    arguments: Record<string, any>;
    result?: any;
    error?: string;
    timestamp: Date;
}

export interface ChatSession {
    id: string;
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: Date;
    }>;
    toolCalls: ToolCall[];
    startedAt: Date;
    lastActivity: Date;
}

export interface GenerativeUITrigger {
    type: 'INVENTORY_CARD' | 'PROFIT_CHART' | 'SHIPPING_OPTIONS' | 'PAYMENT_REMINDER' | 'ORDER_SUCCESS' | 'LOW_STOCK_ALERT';
    data?: any;
}

export interface ModelLoadingState {
    isLoading: boolean;
    progress: number;
    text: string;
    timeRemaining?: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    sku?: string;
    quantity: number;
    unit: 'pieces' | 'kg' | 'liters' | 'boxes' | 'dozens';
    costPrice: number;
    sellingPrice: number;
    gstRate: number;
    reorderPoint: number;
    category?: string;
}

export interface Order {
    orderId: string;
    orderNumber: string;
    timestamp: Date;
    customerName: string;
    customerPhone: string;
    items: OrderItem[];
    subtotal: number;
    gstTotal: number;
    discountAmount: number;
    grandTotal: number;
    profitMargin: number;
    paymentMethod: 'cash' | 'upi' | 'card' | 'credit';
    paymentStatus: 'paid' | 'pending' | 'partial';
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    gstAmount: number;
}

export interface ShippingRate {
    provider: string;
    providerName: string;
    rate: number;
    estimatedDays: number;
    codAvailable: boolean;
    codCharges: number;
    fuelSurcharge: number;
    totalCost: number;
    trackingAvailable: boolean;
    insuranceIncluded: boolean;
    recommendationScore: number;
}
