/**
 * Utility functions for Kuber.ai
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Parse UI triggers from AI response text
 */
export function parseUITriggers(text: string): string[] {
    const triggerRegex = /\[\[([A-Z_]+)\]\]/g;
    const triggers: string[] = [];
    let match;

    while ((match = triggerRegex.exec(text)) !== null) {
        triggers.push(match[1]);
    }

    return triggers;
}

/**
 * Remove UI trigger markers from text
 */
export function removeTriggers(text: string): string {
    return text.replace(/\[\[.*?\]\]/g, '').trim();
}

/**
 * Format currency in Indian Rupees
 */
export function formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format date in Indian format
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

/**
 * Format time in 12-hour format
 */
export function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(date);
}

/**
 * Validate Indian phone number
 */
export function isValidIndianPhone(phone: string): boolean {
    return /^[6-9]\d{9}$/.test(phone);
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
    if (phone.length === 10) {
        return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
}

/**
 * Calculate GST amount
 */
export function calculateGST(amount: number, gstRate: number): number {
    return (amount * gstRate) / 100;
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${date}-${random}`;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
