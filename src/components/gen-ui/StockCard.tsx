'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { z } from 'zod';

// Zod Schema for Tambo AI to consume
export const StockCardSchema = z.object({
    name: z.string().describe('The name of the product'),
    quantity: z.number().describe('The current stock level'),
    unit: z.string().describe('The unit of measurement (kg, packet, etc.)'),
    status: z.enum(['low', 'good', 'critical']).describe('The stock status'),
    lastUpdated: z.string().optional().describe('Last updated timestamp'),
    price: z.number().optional().describe('Current market price per unit'),
});

export type StockCardProps = z.infer<typeof StockCardSchema>;

export const StockCard: React.FC<StockCardProps> = ({
    name,
    quantity,
    unit,
    status,
    lastUpdated,
    price,
}) => {
    const statusColors = {
        low: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        good: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-sm rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
        >
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{name}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Inventory Item</p>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusColors[status]}`}>
                        {status.toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                    <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Stock Level</p>
                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                            {quantity} <span className="text-sm font-medium">{unit}</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Price</p>
                        <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                            ₹{price || '--'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span>Demand is increasing for this item</span>
                </div>
            </div>

            <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                Record New Sale
                <ArrowRight size={18} />
            </button>
        </motion.div>
    );
};
