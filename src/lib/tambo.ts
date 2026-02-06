// Tambo Generative UI Configuration
// Registers our cards with AI for automatic rendering

import { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { StockCard, StockCardSchema, ProfitChart, ProfitChartSchema, ParchiScanner, ParchiScannerSchema } from "@/components/gen-ui";
import { OrderCard, LowStockAlert, ShippingCard } from "@/components/ui/Cards";

export const tamboComponents: TamboComponent[] = [
  {
    name: "StockCard",
    description: "Displays details for a single product in inventory. Use when user asks about a specific item or its stock level.",
    component: StockCard,
    propsSchema: StockCardSchema,
  },
  {
    name: "ProfitChart",
    description: "Visualizes profit and sales analytics for a timeframe. Use when user asks about profit, revenue, kamayi, or trends.",
    component: ProfitChart,
    propsSchema: ProfitChartSchema,
    annotations: { tamboStreamableHint: true },
  },
  {
    name: "ParchiScanner",
    description: "Opens the camera to scan a handwritten or printed merchant bill. Use when user wants to upload a bill or scan a parchi.",
    component: ParchiScanner,
    propsSchema: ParchiScannerSchema,
  },
  {
    name: "OrderCard",
    description: "Displays order confirmation with customer details, items list, pricing breakdown (subtotal, GST, total), and action buttons. Use when order is placed, confirmed, or user asks to see order details.",
    component: OrderCard,
    propsSchema: z.object({
      orderId: z.string(),
      customerName: z.string(),
      items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
        price: z.number(),
      })),
      subtotal: z.number(),
      gst: z.number(),
      total: z.number(),
    }),
  },
  {
    name: "LowStockAlert",
    description: "Shows urgent low stock alerts with red/orange styling. Lists items that need reordering with current stock vs reorder point. Use when inventory is running low or user asks about restocking.",
    component: LowStockAlert,
    propsSchema: z.object({
      items: z.array(z.object({
        name: z.string(),
        currentStock: z.number(),
        reorderPoint: z.number(),
        unit: z.string(),
      })),
    }),
  },
  {
    name: "ShippingCard",
    description: "Compares shipping rates from multiple courier providers (BlueDart, Delhivery, DTDC). Shows rates, delivery days, and recommended option. Use when user asks about shipping, delivery, courier rates, or sending items.",
    component: ShippingCard,
    propsSchema: z.object({
      rates: z.array(z.object({
        provider: z.string(),
        rate: z.number(),
        days: z.number(),
        isRecommended: z.boolean().optional(),
      })),
      from: z.string(),
      to: z.string(),
    }),
  },
];

// Tool definitions for Tambo MCP integration
export const tamboTools = {
  get_inventory: {
    description: "Fetch current inventory status including stock levels, product details, and low stock alerts",
    parameters: z.object({
      productName: z.string().optional(),
      category: z.string().optional(),
      lowStockOnly: z.boolean().default(false),
    }),
  },
  place_order: {
    description: "Create a new sales order with customer details and items",
    parameters: z.object({
      customerName: z.string(),
      customerPhone: z.string().optional(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number(),
      })),
      paymentMethod: z.enum(['cash', 'upi', 'card', 'credit']),
    }),
  },
  get_shipping_rates: {
    description: "Get shipping rates from multiple courier providers",
    parameters: z.object({
      origin: z.string(),
      destination: z.string(),
      weight: z.number(),
    }),
  },
  get_profit_analysis: {
    description: "Analyze profit and revenue for a given time period",
    parameters: z.object({
      days: z.number().default(7),
    }),
  },
};
