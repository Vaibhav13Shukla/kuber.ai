# 🧠 Kuber.ai - AI Brain for Business Management

> **Complete AI-powered business assistant running 100% offline in your browser**

Kuber.ai is a mobile-first, offline-sovereign PWA that brings AI-powered business management to small businesses in India. Built with WebLLM for complete offline functionality, it features a Hinglish-speaking AI assistant ("Kuber Seth") that helps manage inventory, process orders, and calculate shipping rates.

---

## ✨ Features

### 🤖 **Offline AI Brain**
- Runs entirely in browser using WebLLM (Llama-3-8B)
- No API keys required
- Complete privacy - your data never leaves your device
- ~500MB model downloads once, then instant loads

### 💬 **Kuber Seth AI Assistant**
- Natural Hinglish conversation (Hindi + English mix)
- Business-savvy responses using local terminology
- Proactive suggestions and alerts
- Mobile-optimized concise responses

### 🛠️ **Smart Tools**
1. **Inventory Management** - Real-time stock checking with low-stock alerts
2. **Order Processing** - Quick sales recording with GST calculations
3. **Shipping Calculator** - Compare rates from BlueDart, Delhivery, DTDC

### 🎨 **Generative UI**
- Dynamic UI components triggered by AI responses
- Inventory cards, profit charts, shipping tables
- Real-time data visualization

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Modern browser (Chrome/Edge recommended for WebGPU support)
- ~4GB RAM for optimal performance

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd kuber-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` and wait for the AI model to download (~30-60 seconds on first load).

---

## 📁 Project Structure

```
kuber-ai/
├── src/
│   ├── tambo/
│   │   ├── config.ts      # AI configuration & persona
│   │   └── tools.ts       # Tool definitions with Zod schemas
│   ├── hooks/
│   │   └── useKuberAI.ts  # WebLLM integration hook
│   ├── components/
│   │   └── ChatInterface.tsx  # Main chat UI
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   └── types/
│       └── index.ts       # TypeScript definitions
├── app/
│   ├── page.tsx           # Main entry point
│   └── layout.tsx         # App layout
├── next.config.ts         # Next.js + WebLLM config
└── .env.local             # Environment variables
```

---

## 🔧 Configuration

### Environment Variables

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=Kuber.ai
NEXT_PUBLIC_DEFAULT_LOCALE=hi-IN

# Model Configuration
NEXT_PUBLIC_MODEL_NAME=Llama-3-8B-Instruct-q4f32_1-MLC
NEXT_PUBLIC_MODEL_CACHE_SIZE=500

# Debug Mode
NEXT_PUBLIC_DEBUG_AI=false
```

### AI Persona

Kuber Seth is configured in `src/tambo/config.ts`:
- **Language**: Hinglish (natural code-switching)
- **Tone**: Warm, encouraging, practical
- **Response Style**: Concise (2-3 sentences)
- **Business Slang**: maal, udhar, party, khata

---

## 🎯 Usage Examples

### Check Inventory
```
User: "Stock check karo pen ka"
AI: "Pen ka stock: 145 units available. ✅"
```

### Low Stock Alert
```
User: "Chawal ka kya hisaab hai?"
AI: "Seth Ji, Basmati Rice ka stock critical hai (sirf 5kg bacha hai). 
     Turant order lagana padega. [[SHOW_INVENTORY_CARD]] [[SHOW_LOW_STOCK_ALERT]]"
```

### Shipping Rates
```
User: "Shipping rates batao"
AI: "Found 3 shipping options. Best: Delhivery at ₹128 (3 days). [[SHOW_SHIPPING_OPTIONS]]"
```

---

## 👥 Team Integration

### For Member 2 (UI Components)

The AI sends UI trigger markers in responses:

```typescript
import { parseUITriggers, removeTriggers } from '@/lib/utils';

const triggers = parseUITriggers(message.content);
const cleanContent = removeTriggers(message.content);

if (triggers.includes('SHOW_INVENTORY_CARD')) {
  return <InventoryCard data={...} />;
}
```

**Available Triggers:**
- `SHOW_INVENTORY_CARD` - Display inventory widget
- `SHOW_PROFIT_CHART` - Render profit graph
- `SHOW_SHIPPING_OPTIONS` - Display shipping rates table
- `SHOW_PAYMENT_REMINDER` - Show payment alerts
- `SHOW_ORDER_SUCCESS` - Show order confirmation
- `SHOW_LOW_STOCK_ALERT` - Show low stock warning

### For Member 3 (Database)

Replace mock functions in `src/tambo/tools.ts`:

```typescript
// Current (mock):
const items = await mockFetchInventory(input);

// Replace with (Dexie):
const items = await db.inventory.getFiltered(input);
```

**Integration Points:**
- `mockFetchInventory` → `db.inventory.getFiltered`
- `mockSaveOrder` → `db.orders.create`
- `mockUpdateInventory` → `db.inventory.decrementStock`
- `mockCalculateShipping` → `db.shippingCache.get` (optional)

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Build for production
npm run build

# Run production build
npm start
```

---

## 📊 Performance

- **First Load**: 30-60 seconds (model download)
- **Subsequent Loads**: <2 seconds (cached)
- **Model Size**: ~500MB (cached in IndexedDB)
- **RAM Usage**: ~1.5GB when model loaded
- **Response Time**: 1-2 seconds per message

---

## 🐛 Troubleshooting

### Model Won't Load
- **Check browser compatibility**: Requires WebGPU or WebAssembly
- **Verify CORS headers**: Ensure `next.config.ts` is configured correctly
- **Check network**: First load requires internet connection

### Out of Memory
- Use smaller model: `Llama-3-8B-Instruct-q4f16_1`
- Check device memory: `navigator.deviceMemory`
- Close other tabs/applications

### CORS Errors
- Restart dev server after changing `next.config.ts`
- Verify headers are set correctly
- Check browser console for specific errors

---

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Fast lookup guide
- **[INSTALL.md](./INSTALL.md)** - Installation commands

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI**: WebLLM (Llama-3-8B)
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Dexie.js (Member 3)

---

## 📝 License

MIT

---

## 🙏 Acknowledgments

Built for the Kuber.ai hackathon project by:
- **Member 1 (AI Brain)** - You are here! 🧠
- **Member 2 (UI)** - Generative UI components
- **Member 3 (Database)** - Dexie.js integration

---

## 🚀 Next Steps

1. **Test the AI**: Run `npm run dev` and chat with Kuber Seth
2. **Integrate UI**: Member 2 should implement UI trigger components
3. **Connect Database**: Member 3 should replace mock functions
4. **Demo Preparation**: Prepare demo script showing full workflow

**Happy Building! 🎉**
