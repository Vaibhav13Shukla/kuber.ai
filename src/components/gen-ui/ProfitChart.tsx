'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { z } from 'zod';

export const ProfitChartSchema = z.object({
    timeframe: z.string().describe('The timeframe for the data (e.g., Weekly, Monthly)'),
    profit: z.number().describe('Total profit value'),
    trend: z.number().describe('Percentage change from previous period'),
    dataPoints: z.array(z.object({
        label: z.string(),
        value: z.number(),
    })).describe('Array of data points for the simplified chart representation'),
});

export type ProfitChartProps = z.infer<typeof ProfitChartSchema>;

export const ProfitChart: React.FC<ProfitChartProps> = ({
    timeframe,
    profit,
    trend,
    dataPoints,
}) => {
    const isPositive = trend >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl overflow-hidden relative"
        >
            {/* Background Decorative Circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-indigo-100 text-sm font-medium">{timeframe} Profit</p>
                        <h2 className="text-4xl font-black mt-1">₹{profit.toLocaleString()}</h2>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(trend)}%
                    </div>
                </div>

                {/* Simplified Streaming Chart Mock */}
                <div className="flex items-end justify-between h-32 gap-2 mt-8">
                    {dataPoints.map((point, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(point.value / Math.max(...dataPoints.map(d => d.value))) * 100}%` }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                                className="w-full bg-white/20 rounded-t-lg group-hover:bg-white/40 transition-colors relative"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-indigo-600 text-[10px] px-2 py-0.5 rounded font-bold">
                                    {point.value}
                                </div>
                            </motion.div>
                            <span className="text-[10px] text-indigo-200 font-bold uppercase">{point.label}</span>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-3xl text-sm font-bold backdrop-blur-sm transition-all">
                    View Detailed Analytics
                </button>
            </div>
        </motion.div>
    );
};
