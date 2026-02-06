/**
 * iOS Human Interface Guidelines Design System
 * Applied to React/Tailwind for Kuber.ai
 */

// iOS Semantic Colors (works in both light/dark mode)
export const iosColors = {
  // System Colors
  system: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
    gray: '#8E8E93',
    gray2: '#AEAEB2',
    gray3: '#C7C7CC',
    gray4: '#D1D1D6',
    gray5: '#E5E5EA',
    gray6: '#F2F2F7',
  },
  
  // Semantic Colors (adapts to dark mode)
  label: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.6)',
    tertiary: 'rgba(255,255,255,0.3)',
    quaternary: 'rgba(255,255,255,0.18)',
  },
  
  // Backgrounds
  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    elevated: '#1C1C1E',
  },
  
  // Grouped Backgrounds
  grouped: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },
  
  // Fill Colors
  fill: {
    primary: 'rgba(120,120,128,0.36)',
    secondary: 'rgba(120,120,128,0.24)',
    tertiary: 'rgba(118,118,128,0.16)',
    quaternary: 'rgba(116,116,128,0.08)',
  },
  
  // Materials (blur backgrounds)
  material: {
    ultraThin: 'rgba(0,0,0,0.5)',
    thin: 'rgba(0,0,0,0.7)',
    regular: 'rgba(30,30,30,0.85)',
    thick: 'rgba(40,40,40,0.95)',
    chrome: 'rgba(20,20,20,0.98)',
  },
  
  // Separator
  separator: 'rgba(84,84,88,0.6)',
  opaqueSeparator: '#38383A',
  
  // Brand Colors for Kuber
  brand: {
    primary: '#007AFF',    // iOS Blue
    success: '#34C759',    // iOS Green  
    warning: '#FF9500',    // iOS Orange
    danger: '#FF3B30',     // iOS Red
    voice: '#AF52DE',      // iOS Purple
  }
};

// iOS Typography (San Francisco)
export const iosTypography = {
  // Large Titles
  largeTitle: 'text-4xl font-bold tracking-tight leading-none',  // 34pt
  title1: 'text-3xl font-bold tracking-tight',                   // 28pt
  title2: 'text-2xl font-bold tracking-tight',                   // 22pt
  title3: 'text-xl font-semibold tracking-tight',                // 20pt
  
  // Body Styles
  headline: 'text-lg font-semibold',                             // 17pt semibold
  body: 'text-base font-normal leading-relaxed',                 // 17pt regular
  callout: 'text-base font-normal',                              // 16pt
  subheadline: 'text-sm font-normal',                            // 15pt
  footnote: 'text-xs font-normal',                               // 13pt
  caption1: 'text-xs font-medium',                               // 12pt
  caption2: 'text-[11px] font-medium uppercase tracking-wide',   // 11pt
};

// iOS Spacing (8pt grid)
export const iosSpacing = {
  xs: '4px',    // 4pt
  sm: '8px',    // 8pt
  md: '16px',   // 16pt
  lg: '20px',   // 20pt
  xl: '24px',   // 24pt
  xxl: '32px',  // 32pt
  xxxl: '48px', // 48pt
};

// iOS Corner Radius
export const iosRadius = {
  small: '6px',   // Small elements
  medium: '10px', // Buttons, inputs
  large: '16px',  // Cards, sheets
  xlarge: '20px', // Large cards
  xxlarge: '28px',// Hero elements
  full: '9999px', // Circles
};

// iOS Shadows (elevation)
export const iosShadows = {
  none: 'none',
  small: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  large: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  elevated: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
  
  // Card shadows (iOS style)
  card: {
    rest: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    pressed: '0 2px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.20)',
  }
};

// iOS Animation Timing
export const iosAnimation = {
  // Durations
  duration: {
    immediate: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Curves
  ease: {
    default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0.0, 1, 1)',
    out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
};

// iOS Component Styles
export const iosComponents = {
  // iOS Button Styles
  button: {
    primary: `
      bg-[#007AFF] 
      text-white 
      font-semibold 
      rounded-[10px]
      px-5 py-3
      active:scale-[0.96]
      active:opacity-90
      transition-all
      duration-150
      shadow-sm
    `,
    secondary: `
      bg-[#1C1C1E]
      text-[#007AFF]
      font-medium
      rounded-[10px]
      px-5 py-3
      border border-[#38383A]
      active:scale-[0.96]
      transition-all
      duration-150
    `,
    ghost: `
      text-[#007AFF]
      font-medium
      px-4 py-2
      active:opacity-60
      transition-opacity
      duration-150
    `,
  },
  
  // iOS Card Style
  card: `
    bg-[#1C1C1E]
    rounded-[16px]
    shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]
    overflow-hidden
  `,
  
  // iOS List Cell
  listCell: `
    bg-[#1C1C1E]
    px-4 py-3
    border-b border-[rgba(84,84,88,0.6)]
    active:bg-[#2C2C2E]
    transition-colors
    duration-150
  `,
  
  // iOS Input Field
  input: `
    bg-[#2C2C2E]
    text-white
    rounded-[10px]
    px-4 py-3.5
    border border-transparent
    focus:border-[#007AFF]
    focus:ring-1
    focus:ring-[#007AFF]
    placeholder:text-[rgba(255,255,255,0.3)]
    transition-all
    duration-150
  `,
  
  // iOS Section Header
  sectionHeader: `
    text-[rgba(255,255,255,0.6)]
    text-xs
    font-medium
    uppercase
    tracking-wider
    px-4
    py-2
  `,
};

// iOS Safe Area (for notched devices)
export const iosSafeArea = {
  top: 'pt-safe',
  bottom: 'pb-safe',
  left: 'pl-safe',
  right: 'pr-safe',
};

// Accessibility
export const iosAccessibility = {
  // Minimum touch target size (44pt)
  minTouchTarget: 'min-w-[44px] min-h-[44px]',
  
  // Focus styles
  focus: 'focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2',
  
  // Reduced motion
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
};
