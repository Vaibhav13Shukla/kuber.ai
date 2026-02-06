/**
 * Data Service - Offline-first database with Dexie.js
 * Connects AI outputs to local storage
 * Works completely offline on iOS/Android
 */

import Dexie, { Table } from 'dexie';

// Types
export interface InventoryItem {
  id?: number;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  reorderPoint?: number;
  lastUpdated: Date;
}

export interface Order {
  id?: number;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  profit: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit';
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: Date;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
}

export interface UdharEntry {
  id?: number;
  partyName: string;
  amount: number;
  type: 'credit' | 'payment';
  description?: string;
  createdAt: Date;
  settledAt?: Date;
  isSettled: boolean;
}

// Dexie Database
export class KuberDatabase extends Dexie {
  inventory!: Table<InventoryItem, number>;
  orders!: Table<Order, number>;
  udharKhata!: Table<UdharEntry, number>;

  constructor() {
    super('KuberDatabase');
    
    this.version(1).stores({
      inventory: '++id, productName, category, quantity, unit, buyPrice, sellPrice, lastUpdated',
      orders: '++id, orderNumber, customerName, status, createdAt',
      udharKhata: '++id, partyName, isSettled, createdAt',
    });
  }
}

// Database instance
const db = new KuberDatabase();

export class DataService {
  /**
   * Initialize database with seed data
   */
  async initialize(): Promise<void> {
    const count = await db.inventory.count();
    if (count === 0) {
      await this.seedData();
    }
  }

  /**
   * Seed with grocery items (as Member 3 mentioned)
   */
  private async seedData(): Promise<void> {
    const groceryItems: Omit<InventoryItem, 'id'>[] = [
      { productName: 'Tata Salt', category: 'Groceries', quantity: 50, unit: 'kg', buyPrice: 18, sellPrice: 22, lastUpdated: new Date() },
      { productName: 'Maggi Noodles', category: 'Groceries', quantity: 120, unit: 'pcs', buyPrice: 12, sellPrice: 15, lastUpdated: new Date() },
      { productName: 'Basmati Rice', category: 'Groceries', quantity: 5, unit: 'kg', buyPrice: 80, sellPrice: 100, lastUpdated: new Date() },
      { productName: 'Cooking Oil', category: 'Groceries', quantity: 8, unit: 'ltr', buyPrice: 120, sellPrice: 145, lastUpdated: new Date() },
      { productName: 'Sugar', category: 'Groceries', quantity: 25, unit: 'kg', buyPrice: 38, sellPrice: 45, lastUpdated: new Date() },
      { productName: 'Wheat Flour', category: 'Groceries', quantity: 40, unit: 'kg', buyPrice: 32, sellPrice: 40, lastUpdated: new Date() },
      { productName: 'Pulses (Toor Dal)', category: 'Groceries', quantity: 15, unit: 'kg', buyPrice: 95, sellPrice: 115, lastUpdated: new Date() },
      { productName: 'Tea Powder', category: 'Beverages', quantity: 12, unit: 'kg', buyPrice: 280, sellPrice: 320, lastUpdated: new Date() },
      { productName: 'Coffee', category: 'Beverages', quantity: 8, unit: 'kg', buyPrice: 450, sellPrice: 520, lastUpdated: new Date() },
      { productName: 'Milk Powder', category: 'Dairy', quantity: 20, unit: 'kg', buyPrice: 380, sellPrice: 425, lastUpdated: new Date() },
      { productName: 'Blue Pen', category: 'Stationery', quantity: 145, unit: 'pcs', buyPrice: 5, sellPrice: 10, lastUpdated: new Date() },
      { productName: 'Red Pen', category: 'Stationery', quantity: 8, unit: 'pcs', buyPrice: 5, sellPrice: 10, lastUpdated: new Date() },
      { productName: 'Notebook A4', category: 'Stationery', quantity: 0, unit: 'pcs', buyPrice: 30, sellPrice: 60, lastUpdated: new Date() },
      { productName: 'Pencil Box', category: 'Stationery', quantity: 25, unit: 'pcs', buyPrice: 40, sellPrice: 80, lastUpdated: new Date() },
      { productName: 'Eraser', category: 'Stationery', quantity: 200, unit: 'pcs', buyPrice: 2, sellPrice: 5, lastUpdated: new Date() },
      { productName: 'Sharpener', category: 'Stationery', quantity: 150, unit: 'pcs', buyPrice: 3, sellPrice: 6, lastUpdated: new Date() },
      { productName: 'Ruler', category: 'Stationery', quantity: 60, unit: 'pcs', buyPrice: 8, sellPrice: 15, lastUpdated: new Date() },
      { productName: 'Glue Stick', category: 'Stationery', quantity: 45, unit: 'pcs', buyPrice: 15, sellPrice: 25, lastUpdated: new Date() },
      { productName: 'Scissors', category: 'Stationery', quantity: 30, unit: 'pcs', buyPrice: 25, sellPrice: 45, lastUpdated: new Date() },
      { productName: 'Stapler', category: 'Stationery', quantity: 18, unit: 'pcs', buyPrice: 45, sellPrice: 75, lastUpdated: new Date() },
    ];

    await db.inventory.bulkAdd(groceryItems as InventoryItem[]);
    console.log('[DataService] Seeded with 20+ items');
  }

  // ==================== INVENTORY METHODS ====================

  async getInventory(filters?: { category?: string; lowStock?: boolean }): Promise<InventoryItem[]> {
    let collection = db.inventory.toCollection();

    if (filters?.category) {
      collection = db.inventory.where('category').equals(filters.category);
    }

    const items = await collection.toArray();

    if (filters?.lowStock) {
      return items.filter(item => item.quantity <= 10); // Low stock threshold
    }

    return items;
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    return db.inventory.get(id);
  }

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<number> {
    return db.inventory.add({
      ...item,
      lastUpdated: new Date(),
    } as InventoryItem);
  }

  async updateInventoryQuantity(id: number, newQuantity: number): Promise<void> {
    await db.inventory.update(id, {
      quantity: newQuantity,
      lastUpdated: new Date(),
    });
  }

  async searchInventory(query: string): Promise<InventoryItem[]> {
    const items = await db.inventory.toArray();
    return items.filter(item =>
      item.productName.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getInventoryStats(): Promise<{ totalValue: number; lowStockCount: number; totalItems: number }> {
    const items = await db.inventory.toArray();
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.sellPrice), 0);
    const lowStockCount = items.filter(item => item.quantity <= 10).length;
    
    return {
      totalValue,
      lowStockCount,
      totalItems: items.length,
    };
  }

  // ==================== ORDER METHODS ====================

  async placeOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<number> {
    // Check inventory availability
    for (const item of orderData.items) {
      const product = await db.inventory.get(item.productId);
      if (!product || product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName}`);
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const orderId = await db.orders.add({
      ...orderData,
      orderNumber,
      createdAt: new Date(),
    } as Order);

    // Update inventory
    for (const item of orderData.items) {
      const product = await db.inventory.get(item.productId);
      if (product) {
        await this.updateInventoryQuantity(
          item.productId,
          product.quantity - item.quantity
        );
      }
    }

    return orderId;
  }

  async getOrders(limit: number = 50): Promise<Order[]> {
    return db.orders
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return db.orders.get(id);
  }

  // ==================== PROFIT ANALYSIS ====================

  async getProfitAnalysis(days: number = 7): Promise<{
    daily: { date: string; revenue: number; profit: number }[];
    totalRevenue: number;
    totalProfit: number;
    averageMargin: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const orders = await db.orders
      .where('createdAt')
      .above(cutoffDate)
      .toArray();

    // Group by date
    const dailyMap = new Map<string, { revenue: number; profit: number }>();

    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { revenue: 0, profit: 0 };
      
      dailyMap.set(dateKey, {
        revenue: existing.revenue + order.total,
        profit: existing.profit + order.profit,
      });
    });

    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
    const totalProfit = daily.reduce((sum, d) => sum + d.profit, 0);
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      daily,
      totalRevenue,
      totalProfit,
      averageMargin,
    };
  }

  // ==================== UDHAR-KHATA ====================

  async addUdharEntry(entry: Omit<UdharEntry, 'id' | 'createdAt'>): Promise<number> {
    return db.udharKhata.add({
      ...entry,
      createdAt: new Date(),
    } as UdharEntry);
  }

  async getUdharKhata(partyName?: string): Promise<UdharEntry[]> {
    if (partyName) {
      return db.udharKhata
        .where('partyName')
        .equals(partyName)
        .toArray();
    }
    return db.udharKhata.toArray();
  }

  async getOutstandingUdhar(): Promise<{ partyName: string; amount: number }[]> {
    const entries = await db.udharKhata
      .where('isSettled')
      .equals(0)
      .toArray();

    // Group by party
    const partyMap = new Map<string, number>();
    
    entries.forEach(entry => {
      const current = partyMap.get(entry.partyName) || 0;
      if (entry.type === 'credit') {
        partyMap.set(entry.partyName, current + entry.amount);
      } else {
        partyMap.set(entry.partyName, current - entry.amount);
      }
    });

    return Array.from(partyMap.entries())
      .map(([partyName, amount]) => ({ partyName, amount }))
      .filter(p => p.amount > 0);
  }

  // ==================== UTILITY ====================

  async exportData(): Promise<{
    inventory: InventoryItem[];
    orders: Order[];
    udharKhata: UdharEntry[];
  }> {
    return {
      inventory: await db.inventory.toArray(),
      orders: await db.orders.toArray(),
      udharKhata: await db.udharKhata.toArray(),
    };
  }

  async clearAllData(): Promise<void> {
    await db.inventory.clear();
    await db.orders.clear();
    await db.udharKhata.clear();
  }
}

// Export singleton
export const dataService = new DataService();
export { db };
