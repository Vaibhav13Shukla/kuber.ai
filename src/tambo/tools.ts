/**
 * Kuber.ai - AI Tools with Zod Schemas
 * Ready for Member 3's Dexie.js integration
 */

import { z } from 'zod';

// ============= ZOD SCHEMAS =============

export const InventoryStatusInputSchema = z.object({
  productName: z.string().optional().describe('Name of product to search'),
  category: z.string().optional().describe('Product category filter'),
  lowStockOnly: z.boolean().default(false).describe('Show only low stock items'),
  limit: z.number().int().min(1).max(100).default(10).describe('Max items to return'),
});

export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().optional(),
  quantity: z.number().int().min(0),
  unit: z.enum(['pieces', 'kg', 'liters', 'boxes', 'dozens']),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  gstRate: z.number().min(0).max(100).default(18),
  reorderPoint: z.number().int().min(0).default(10),
  category: z.string().optional(),
});

export const PlaceOrderInputSchema = z.object({
  customerName: z.string().min(1).describe('Customer name'),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').describe('10-digit phone'),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
    gstAmount: z.number().min(0),
  })).min(1).describe('Order items'),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'credit']).describe('Payment method'),
  paymentStatus: z.enum(['paid', 'pending', 'partial']).default('paid'),
  discountPercent: z.number().min(0).max(100).default(0),
});

export const ShippingRateInputSchema = z.object({
  origin: z.string().min(1).describe('Origin city'),
  destination: z.string().min(1).describe('Destination city'),
  weight: z.number().min(0.1).max(50).describe('Weight in kg'),
  dimensions: z.object({
    length: z.number().min(1),
    width: z.number().min(1),
    height: z.number().min(1),
  }).optional().describe('Package dimensions in cm'),
  paymentMode: z.enum(['prepaid', 'cod']).default('prepaid'),
  deliverySpeed: z.enum(['express', 'standard', 'economy']).default('standard'),
});

// ============= TOOL IMPLEMENTATIONS =============

export const tools = {
  get_inventory_status: {
    name: 'get_inventory_status',
    description: 'Check inventory levels and stock status. Use when asked about stock, maal, or product availability.',
    schema: InventoryStatusInputSchema,

    async execute(input: z.infer<typeof InventoryStatusInputSchema>) {
      try {
        // === MEMBER 3 INTEGRATION POINT ===
        // Replace with: const items = await db.inventory.getFiltered(input);

        const items = await mockFetchInventory(input);

        const totalValue = items.reduce((sum, item) =>
          sum + (item.quantity * item.sellingPrice), 0
        );

        const lowStockCount = items.filter(item =>
          item.quantity <= item.reorderPoint && item.quantity > 0
        ).length;

        const outOfStockCount = items.filter(item => item.quantity === 0).length;

        let summary = `Total items: ${items.length}`;
        if (lowStockCount > 0) summary += `, Low stock: ${lowStockCount} items`;
        if (outOfStockCount > 0) summary += `, Out of stock: ${outOfStockCount}`;
        summary += `. Total inventory value: ₹${totalValue.toFixed(2)}`;

        return { items, totalValue, lowStockCount, outOfStockCount, summary };
      } catch (error) {
        throw new Error('Failed to fetch inventory. Database may be offline.');
      }
    },
  },

  place_order: {
    name: 'place_order',
    description: 'Record a new sale/order. Use when user says order likh do, sale entry, or recording transaction.',
    schema: PlaceOrderInputSchema,

    async execute(input: z.infer<typeof PlaceOrderInputSchema>) {
      try {
        // === MEMBER 3 INTEGRATION POINT ===
        // 1. await db.inventory.checkAvailability(input.items)
        // 2. await db.orders.create(orderData)
        // 3. await db.inventory.decrementStock(input.items)

        const orderId = crypto.randomUUID();
        const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const timestamp = new Date();

        const subtotal = input.items.reduce((sum, item) =>
          sum + (item.quantity * item.unitPrice), 0
        );

        const gstTotal = input.items.reduce((sum, item) => sum + item.gstAmount, 0);
        const discountAmount = (subtotal * input.discountPercent) / 100;
        const grandTotal = subtotal + gstTotal - discountAmount;

        // Mock profit calculation (needs cost price from DB)
        const profitMargin = subtotal * 0.25; // Assume 25% margin

        // Save to DB (mock)
        await mockSaveOrder({
          orderId, orderNumber, timestamp,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          items: input.items,
          subtotal, gstTotal, discountAmount, grandTotal, profitMargin,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentStatus,
        });

        // Update inventory (mock)
        await mockUpdateInventory(input.items);

        const message = `Order ${orderNumber} created! Total: ₹${grandTotal.toFixed(2)}. Profit: ₹${profitMargin.toFixed(2)}`;

        return {
          orderId, orderNumber, timestamp,
          subtotal, gstTotal, discountAmount, grandTotal, profitMargin,
          success: true, message,
        };
      } catch (error) {
        throw new Error('Failed to create order. Check inventory availability.');
      }
    },
  },

  calculate_shipping: {
    name: 'calculate_shipping',
    description: 'Get shipping rates from couriers. Use when asked about delivery costs, courier rates, or shipping.',
    schema: ShippingRateInputSchema,

    async execute(input: z.infer<typeof ShippingRateInputSchema>) {
      try {
        // === MEMBER 3 INTEGRATION POINT ===
        // Can store rate cache in DB: await db.shippingCache.get(cacheKey)

        const rates = await mockCalculateShipping(input);

        // AI scoring: balance cost vs speed
        const ratesWithScores = rates.map(rate => ({
          ...rate,
          recommendationScore: calculateRecommendationScore(rate, input.deliverySpeed),
        }));

        ratesWithScores.sort((a, b) => b.recommendationScore - a.recommendationScore);

        const recommended = ratesWithScores[0];

        const volumeDiscountAvailable = input.weight > 10;
        const volumeDiscountThreshold = 15;

        let message = `Found ${rates.length} shipping options. `;
        message += `Best: ${recommended.providerName} at ₹${recommended.totalCost} (${recommended.estimatedDays} days).`;
        if (volumeDiscountAvailable) {
          message += ` Volume discount available for orders above ${volumeDiscountThreshold}kg!`;
        }

        return {
          origin: input.origin,
          destination: input.destination,
          weight: input.weight,
          rates: ratesWithScores,
          recommendedProvider: recommended.providerName,
          volumeDiscountAvailable,
          volumeDiscountThreshold,
          message,
        };
      } catch (error) {
        throw new Error('Failed to fetch shipping rates. Please try again.');
      }
    },
  },
};

// ============= MOCK DATABASE FUNCTIONS =============
// Member 3 will replace these with real Dexie.js calls

async function mockFetchInventory(input: z.infer<typeof InventoryStatusInputSchema>) {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate DB delay

  const mockData = [
    { id: '1', name: 'Blue Pen', sku: 'PEN-001', quantity: 145, unit: 'pieces' as const, costPrice: 5, sellingPrice: 10, gstRate: 18, reorderPoint: 50, category: 'Stationery' },
    { id: '2', name: 'Red Pen', sku: 'PEN-002', quantity: 8, unit: 'pieces' as const, costPrice: 5, sellingPrice: 10, gstRate: 18, reorderPoint: 50, category: 'Stationery' },
    { id: '3', name: 'Notebook A4', sku: 'NB-001', quantity: 0, unit: 'pieces' as const, costPrice: 30, sellingPrice: 60, gstRate: 18, reorderPoint: 20, category: 'Stationery' },
    { id: '4', name: 'Pencil Box', sku: 'PB-001', quantity: 25, unit: 'pieces' as const, costPrice: 40, sellingPrice: 80, gstRate: 18, reorderPoint: 10, category: 'Stationery' },
    { id: '5', name: 'Basmati Rice', sku: 'RICE-001', quantity: 5, unit: 'kg' as const, costPrice: 80, sellingPrice: 120, gstRate: 5, reorderPoint: 20, category: 'Groceries' },
  ];

  let filtered = mockData;

  if (input.productName) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(input.productName!.toLowerCase())
    );
  }

  if (input.category) {
    filtered = filtered.filter(item => item.category === input.category);
  }

  if (input.lowStockOnly) {
    filtered = filtered.filter(item => item.quantity <= item.reorderPoint);
  }

  return filtered.slice(0, input.limit);
}

async function mockSaveOrder(orderData: any) {
  await new Promise(resolve => setTimeout(resolve, 150));
  console.log('✅ Order saved to DB:', orderData.orderNumber);
  return true;
}

async function mockUpdateInventory(items: any[]) {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log('✅ Inventory updated for', items.length, 'items');
  return true;
}

async function mockCalculateShipping(input: z.infer<typeof ShippingRateInputSchema>) {
  await new Promise(resolve => setTimeout(resolve, 200));

  const baseRate = input.weight * 15; // ₹15 per kg base
  const codSurcharge = input.paymentMode === 'cod' ? 30 : 0;

  return [
    {
      provider: 'bluedart',
      providerName: 'BlueDart',
      rate: baseRate * 1.8,
      estimatedDays: input.deliverySpeed === 'express' ? 1 : 2,
      codAvailable: true,
      codCharges: codSurcharge,
      fuelSurcharge: baseRate * 0.1,
      totalCost: baseRate * 1.8 + codSurcharge + (baseRate * 0.1),
      trackingAvailable: true,
      insuranceIncluded: true,
      recommendationScore: 0,
    },
    {
      provider: 'delhivery',
      providerName: 'Delhivery',
      rate: baseRate * 1.2,
      estimatedDays: input.deliverySpeed === 'express' ? 2 : 3,
      codAvailable: true,
      codCharges: codSurcharge,
      fuelSurcharge: baseRate * 0.08,
      totalCost: baseRate * 1.2 + codSurcharge + (baseRate * 0.08),
      trackingAvailable: true,
      insuranceIncluded: false,
      recommendationScore: 0,
    },
    {
      provider: 'dtdc',
      providerName: 'DTDC',
      rate: baseRate,
      estimatedDays: input.deliverySpeed === 'express' ? 3 : 5,
      codAvailable: true,
      codCharges: codSurcharge,
      fuelSurcharge: baseRate * 0.05,
      totalCost: baseRate + codSurcharge + (baseRate * 0.05),
      trackingAvailable: true,
      insuranceIncluded: false,
      recommendationScore: 0,
    },
  ];
}

function calculateRecommendationScore(rate: any, preferredSpeed: string): number {
  let score = 100;

  // Cost factor (lower is better)
  score -= (rate.totalCost / 10);

  // Speed factor
  if (preferredSpeed === 'express') {
    score -= (rate.estimatedDays * 10);
  } else if (preferredSpeed === 'economy') {
    score += (rate.estimatedDays * 2); // Slower = cheaper = good
  }

  // Feature bonuses
  if (rate.trackingAvailable) score += 5;
  if (rate.insuranceIncluded) score += 3;

  return Math.max(0, Math.min(100, score));
}

// ============= TYPE EXPORTS =============

export type InventoryStatusInput = z.infer<typeof InventoryStatusInputSchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderInputSchema>;
export type ShippingRateInput = z.infer<typeof ShippingRateInputSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;