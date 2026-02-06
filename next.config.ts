import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: Static export for Capacitor
  output: 'export',
  distDir: 'out',
  
  // Required for WebLLM to work properly
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },

  // Turbopack configuration (Next.js 16+)
  turbopack: {
    resolveAlias: {
      // Exclude server-only modules from client bundle (Turbopack equivalent)
      fs: {},
      net: {},
      tls: {},
      crypto: {},
    },
  },

  // External packages for server components (Next.js 16+ syntax)
  serverExternalPackages: ['@mlc-ai/web-llm'],

  // PWA Configuration
  reactStrictMode: true,

  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for static export
  trailingSlash: true,
};

export default nextConfig;
