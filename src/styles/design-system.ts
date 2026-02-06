// UPI-Style Design System for Kuber.ai
// iOS-inspired dark mode with Indian business context

export const colors = {
  // Background Hierarchy
  bg: {
    primary: '#000000',      // Pure black (OLED friendly)
    secondary: '#1C1C1E',    // Elevated surfaces
    tertiary: '#2C2C2E',     // Grouped sections
    card: '#1C1C1E',         // Card backgrounds
    input: '#2C2C2E',        // Input fields
  },
  
  // Brand Colors (Trust + Growth + Energy)
  brand: {
    primary: '#0A84FF',      // iOS Blue (Trust, primary actions)
    success: '#30D158',      // Green (Profit, success states)
    warning: '#FF9F0A',      // Orange (Caution, alerts)
    danger: '#FF453A',       // Red (Critical, errors)
    voice: '#BF5AF2',        // Purple (Voice AI, mic active)
    accent: '#5E5CE6',       // Indigo (Secondary accent)
  },
  
  // Text Hierarchy
  text: {
    primary: '#FFFFFF',                    // Main text
    secondary: 'rgba(255,255,255,0.6)',    // Subtitles, descriptions
    tertiary: 'rgba(255,255,255,0.38)',    // Disabled, hints
    inverse: '#000000',                    // Text on light backgrounds
  },
  
  // Utility
  separator: 'rgba(84,84,88,0.6)',         // Dividers
  overlay: 'rgba(0,0,0,0.8)',              // Modal overlays
  blur: 'rgba(28,28,30,0.8)',              // Glassmorphism
};

export const spacing = {
  // 8px Grid System (like UPI)
  xs: '4px',   // 0.25rem
  sm: '8px',   // 0.5rem
  md: '16px',  // 1rem
  lg: '24px',  // 1.5rem
  xl: '32px',  // 2rem
  xxl: '48px', // 3rem
  xxxl: '64px',// 4rem
};

export const radius = {
  // iOS-style rounded corners
  sm: '8px',    // Small elements
  md: '12px',   // Buttons, inputs
  lg: '16px',   // Cards, sheets
  xl: '20px',   // Large cards
  xxl: '24px',  // Hero elements
  full: '9999px', // Circles
};

export const typography = {
  // iOS San Francisco-style typography
  display: 'text-4xl font-bold tracking-tight leading-none',
  title1: 'text-3xl font-semibold tracking-tight',
  title2: 'text-2xl font-semibold tracking-tight',
  title3: 'text-xl font-semibold tracking-tight',
  headline: 'text-lg font-semibold',
  body: 'text-base font-normal leading-relaxed',
  callout: 'text-sm font-medium',
  subhead: 'text-sm font-normal',
  footnote: 'text-xs font-medium',
  caption: 'text-xs font-normal uppercase tracking-wider',
  caption2: 'text-[10px] font-medium uppercase tracking-widest',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  glow: {
    blue: '0 0 40px rgba(10,132,255,0.5)',
    purple: '0 0 40px rgba(191,90,242,0.5)',
    green: '0 0 40px rgba(48,209,88,0.5)',
  }
};

export const animation = {
  // Timing functions
  ease: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  }
};

// Component-specific styles
export const componentStyles = {
  card: `
    bg-[#1C1C1E] 
    rounded-[20px] 
    border border-white/5
    shadow-lg
    overflow-hidden
  `,
  
  button: {
    primary: `
      bg-[#0A84FF] 
      text-white 
      font-semibold 
      rounded-full 
      px-6 py-4
      active:scale-95
      transition-all
      shadow-lg
      shadow-blue-500/25
    `,
    secondary: `
      bg-[#2C2C2E] 
      text-white 
      font-medium 
      rounded-full 
      px-5 py-3
      border border-white/10
      active:scale-95
      transition-all
    `,
    ghost: `
      text-[#0A84FF] 
      font-medium 
      px-4 py-2
      active:opacity-70
      transition-opacity
    `,
  },
  
  input: `
    bg-[#2C2C2E] 
    text-white 
    rounded-[12px] 
    px-4 py-4
    border border-white/10
    focus:border-[#0A84FF]
    focus:ring-2 
    focus:ring-[#0A84FF]/30
    transition-all
    placeholder:text-white/40
  `,
};

// Gradients
export const gradients = {
  hero: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 50%, #BF5AF2 100%)',
  voice: 'radial-gradient(circle, rgba(191,90,242,0.4) 0%, transparent 70%)',
  success: 'linear-gradient(135deg, #30D158 0%, #30D158 100%)',
  card: 'linear-gradient(180deg, rgba(28,28,30,0.95) 0%, rgba(28,28,30,0.9) 100%)',
};
