# 📦 Kuber.ai - Installation Guide

## Quick Install (Copy-Paste)

```bash
# Navigate to project directory
cd /home/vishal/Desktop/MyHackathonProjects/kuber-ai

# Install all dependencies
npm install

# Start development server
npm run dev
```

---

## Dependencies Installed

### Core Dependencies

```bash
npm install @mlc-ai/web-llm@^0.2.80
```
**WebLLM** - Runs LLM models in browser using WebGPU/WebAssembly

```bash
npm install zod@^4.3.6
```
**Zod** - TypeScript-first schema validation

```bash
npm install zod-to-json-schema@^3.22.4
```
**Zod to JSON Schema** - Convert Zod schemas to JSON Schema format

```bash
npm install ai@^6.0.72
```
**Vercel AI SDK** - AI streaming and tool calling utilities

```bash
npm install nanoid@^5.1.6
```
**Nanoid** - Tiny, secure URL-friendly unique ID generator

### UI Dependencies

```bash
npm install framer-motion@^12.33.0
```
**Framer Motion** - Animation library for React

```bash
npm install lucide-react@^0.563.0
```
**Lucide React** - Beautiful icon library

```bash
npm install clsx@^2.1.1 tailwind-merge@^3.4.0
```
**clsx + tailwind-merge** - Utility for merging Tailwind classes

### Database (Member 3)

```bash
npm install dexie@^4.3.0
```
**Dexie** - IndexedDB wrapper for offline database

---

## Alternative Package Managers

### Using Yarn

```bash
# Install dependencies
yarn install

# Start dev server
yarn dev

# Type check
yarn type-check

# Build
yarn build
```

### Using PNPM

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm type-check

# Build
pnpm build
```

---

## Verify Installation

```bash
# Check TypeScript types
npm run type-check

# Should output: No errors
```

```bash
# Check if dev server starts
npm run dev

# Should output: 
# ▲ Next.js 16.1.6
# - Local:        http://localhost:3000
```

---

## Troubleshooting Installation

### npm install fails

**Issue**: Package installation errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### TypeScript errors

**Issue**: Type errors after installation

**Solution**:
```bash
# Ensure TypeScript is installed
npm install -D typescript@^5

# Run type check
npm run type-check
```

### Dev server won't start

**Issue**: Port 3000 already in use

**Solution**:
```bash
# Use different port
PORT=3001 npm run dev
```

---

## Post-Installation

1. **Set up environment variables**:
   ```bash
   # Create .env.local (already created)
   # Verify it contains:
   cat .env.local
   ```

2. **Test the application**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

3. **Wait for model download**:
   - First load: ~30-60 seconds
   - Progress bar will show download status
   - Model is cached for future use

---

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint
```

---

## System Requirements

- **Node.js**: 18.0.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 1GB free space (for model cache)
- **Browser**: Chrome 113+, Edge 113+, or Firefox 115+

---

## Next Steps

After installation:

1. ✅ Dependencies installed
2. ✅ Environment variables configured
3. ✅ Dev server running
4. ⏳ Model downloading (first time only)
5. 🎉 Ready to chat with Kuber Seth!

---

**Installation Complete! 🎉**

Proceed to [README.md](./README.md) for usage instructions.
