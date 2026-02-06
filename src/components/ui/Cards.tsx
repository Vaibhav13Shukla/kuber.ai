'use client';

import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertCircle, CheckCircle2, Truck, IndianRupee } from 'lucide-react';
import { colors, spacing, radius } from '@/styles/design-system';

// Base Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Card({ children, className = '', delay = 0 }: CardProps) {
  return (
    <motion.div
      className={`
        bg-[#1C1C1E] 
        rounded-[20px] 
        border border-white/5
        overflow-hidden
        ${className}
      `}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      whileHover={{ scale: 1.01 }}
    >
      {children}
    </motion.div>
  );
}

// Inventory Card
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderPoint: number;
  category?: string;
}

interface InventoryCardProps {
  items: InventoryItem[];
  totalValue?: number;
  lowStockCount?: number;
  delay?: number;
}

export function InventoryCard({ items, totalValue, lowStockCount, delay }: InventoryCardProps) {
  return (
    <Card className="p-5" delay={delay}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Stock Status</h3>
            <p className="text-xs text-white/50">{items.length} items</p>
          </div>
        </div>
        {lowStockCount && lowStockCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-medium text-orange-400">{lowStockCount} Low</span>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.slice(0, 4).map((item, index) => {
          const isLow = item.quantity <= item.reorderPoint;
          const percentage = Math.min((item.quantity / (item.reorderPoint * 3)) * 100, 100);
          
          return (
            <motion.div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (delay ?? 0) + 0.1 + index * 0.05 }}
            >
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${isLow ? 'bg-orange-500' : 'bg-green-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: (delay ?? 0) + 0.2 + index * 0.05, duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className={`font-semibold ${isLow ? 'text-orange-400' : 'text-white'}`}>
                  {item.quantity}
                </p>
                <p className="text-xs text-white/40">{item.unit}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      {totalValue && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Total Value</span>
            <span className="text-lg font-bold text-white flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {totalValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

// Profit Card
interface ProfitData {
  date: string;
  revenue: number;
  profit: number;
}

interface ProfitCardProps {
  data: ProfitData[];
  totalRevenue: number;
  totalProfit: number;
  growthPercentage: number;
  delay?: number;
}

export function ProfitCard({ data, totalRevenue, totalProfit, growthPercentage, delay }: ProfitCardProps) {
  const maxValue = Math.max(...data.map(d => d.revenue));
  
  return (
    <Card className="p-5" delay={delay}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">This Week</h3>
            <p className="text-xs text-white/50">Revenue & Profit</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${growthPercentage >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <TrendingUp className={`w-3.5 h-3.5 ${growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          <span className={`text-xs font-medium ${growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {growthPercentage > 0 ? '+' : ''}{growthPercentage}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 flex items-end justify-between gap-1 mb-4">
        {data.slice(-7).map((day, index) => {
          const height = (day.revenue / maxValue) * 100;
          const profitHeight = (day.profit / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full h-full flex items-end">
                {/* Revenue bar */}
                <motion.div
                  className="absolute bottom-0 w-full bg-blue-500/30 rounded-t"
                  style={{ height: `${height}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: (delay ?? 0) + index * 0.05, duration: 0.5 }}
                />
                {/* Profit bar */}
                <motion.div
                  className="absolute bottom-0 w-full bg-green-500 rounded-t"
                  style={{ height: `${profitHeight}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${profitHeight}%` }}
                  transition={{ delay: (delay ?? 0) + index * 0.05 + 0.1, duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] text-white/40">
                {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'narrow' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-white/50 mb-1">Revenue</p>
          <p className="text-lg font-bold text-white flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            {(totalRevenue / 1000).toFixed(1)}k
          </p>
        </div>
        <div>
          <p className="text-xs text-white/50 mb-1">Profit</p>
          <p className="text-lg font-bold text-green-400 flex items-center gap-1">
            <IndianRupee className="w-4 h-4" />
            {(totalProfit / 1000).toFixed(1)}k
          </p>
        </div>
      </div>
    </Card>
  );
}

// Order Confirmation Card
interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface OrderCardProps {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  delay?: number;
}

export function OrderCard({ orderId, customerName, items, subtotal, gst, total, delay }: OrderCardProps) {
  return (
    <Card className="p-5" delay={delay}>
      {/* Success Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Order Confirmed!</h3>
          <p className="text-xs text-white/50">#{orderId}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-4 p-3 rounded-xl bg-white/5">
        <p className="text-xs text-white/50 mb-1">Customer</p>
        <p className="font-medium text-white">{customerName}</p>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-white text-sm">{item.name}</p>
              <p className="text-xs text-white/50">{item.quantity} {item.unit}</p>
            </div>
            <p className="font-medium text-white">₹{item.price.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Subtotal</span>
          <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">GST (18%)</span>
          <span className="text-white">₹{gst.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-white/10">
          <span className="font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-green-400">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-xl active:scale-95 transition-transform">
          Track Order
        </button>
        <button className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl active:scale-95 transition-transform">
          Share
        </button>
      </div>
    </Card>
  );
}

// Low Stock Alert Card
interface LowStockItem {
  name: string;
  currentStock: number;
  reorderPoint: number;
  unit: string;
}

interface LowStockAlertProps {
  items: LowStockItem[];
  delay?: number;
}

export function LowStockAlert({ items, delay }: LowStockAlertProps) {
  return (
    <Card className="p-5 border-orange-500/30" delay={delay}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Low Stock Alert</h3>
          <p className="text-xs text-orange-400">{items.length} items need attention</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (delay ?? 0) + index * 0.1 }}
          >
            <div>
              <p className="font-medium text-white">{item.name}</p>
              <p className="text-xs text-orange-400">
                Only {item.currentStock} {item.unit} left
              </p>
            </div>
            <button className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg active:scale-95 transition-transform">
              Reorder
            </button>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// Shipping Options Card
interface ShippingRate {
  provider: string;
  logo?: string;
  rate: number;
  days: number;
  isRecommended?: boolean;
}

interface ShippingCardProps {
  rates: ShippingRate[];
  from: string;
  to: string;
  delay?: number;
}

export function ShippingCard({ rates, from, to, delay }: ShippingCardProps) {
  return (
    <Card className="p-5" delay={delay}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Truck className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Shipping Options</h3>
          <p className="text-xs text-white/50">{from} → {to}</p>
        </div>
      </div>

      {/* Rates */}
      <div className="space-y-2">
        {rates.map((rate, index) => (
          <motion.div
            key={index}
            className={`relative flex items-center justify-between p-3 rounded-xl ${rate.isRecommended ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (delay ?? 0) + index * 0.1 }}
          >
            {rate.isRecommended && (
              <div className="absolute -top-2 left-3 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
                BEST
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{rate.provider[0]}</span>
              </div>
              <div>
                <p className="font-medium text-white">{rate.provider}</p>
                <p className="text-xs text-white/50">{rate.days} days delivery</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${rate.isRecommended ? 'text-blue-400' : 'text-white'}`}>
                ₹{rate.rate}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
