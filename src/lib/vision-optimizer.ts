/**
 * Vision OCR Pipeline
 * Optimizes images and extracts text from handwritten/printed Parchis
 */

import Tesseract from 'tesseract.js';

export interface ParchiData {
  rawText: string;
  items: Array<{
    product: string;
    quantity?: number;
    unit?: string;
    price?: number;
  }>;
  totalAmount?: number;
  confidence: number;
}

/**
 * Optimize image for better OCR accuracy
 */
export async function optimizeImageForOCR(imageBase64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw original
      ctx.drawImage(img, 0, 0);

      // 2. Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 3. Convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      // 4. Increase contrast (critical for handwriting)
      const contrast = 1.5;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
      }

      // 5. Apply sharpening
      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.src = imageBase64;
  });
}

/**
 * Extract text from Parchi image using Tesseract OCR
 */
export async function extractParchiText(imageBase64: string): Promise<string> {
  try {
    console.log('[OCR] Starting text extraction...');

    // 1. Optimize image
    const optimizedImage = await optimizeImageForOCR(imageBase64);

    // 2. Create worker with Hindi + English support
    const worker = await Tesseract.createWorker(['hin', 'eng'], 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // 3. Configure for better accuracy
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzअआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह₹./-() ',
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    });

    // 4. Run OCR
    const { data } = await worker.recognize(optimizedImage);

    // 5. Cleanup
    await worker.terminate();

    console.log('[OCR] Extraction complete:', data.text);
    return data.text;

  } catch (error) {
    console.error('[OCR] Extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parse extracted text into structured Parchi data
 */
export function parseParchiData(rawText: string): ParchiData {
  console.log('[Parser] Parsing raw text:', rawText);

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
  const items: ParchiData['items'] = [];
  let totalAmount: number | undefined;

  // Regex patterns for common formats
  const patterns = {
    // Product - Quantity Unit - Price
    // e.g., "आटा - 10 किलो - ₹450" or "Atta - 10kg - Rs 450"
    standard: /^(.+?)\s*[-–]\s*(\d+\.?\d*)\s*(kg|kilo|किलो|किग्रा|packet|box|pcs)?\s*[-–]?\s*(?:₹|Rs\.?|रु\.?)?\s*(\d+\.?\d*)$/i,

    // Product Quantity Unit Price (space separated)
    // e.g., "चावल 5 किलो 200"
    spaceSeparated: /^(.+?)\s+(\d+\.?\d*)\s*(kg|kilo|किलो|किग्रा|packet|box|pcs)?\s+(?:₹|Rs\.?|रु\.?)?\s*(\d+\.?\d*)$/i,

    // Total amount
    total: /(?:total|कुल|Total|TOTAL).*?(?:₹|Rs\.?|रु\.?)?\s*(\d+\.?\d*)/i,
  };

  for (const line of lines) {
    // Check for total
    const totalMatch = line.match(patterns.total);
    if (totalMatch) {
      totalAmount = parseFloat(totalMatch[1]);
      continue;
    }

    // Try standard format
    let match = line.match(patterns.standard);
    if (!match) {
      // Try space-separated format
      match = line.match(patterns.spaceSeparated);
    }

    if (match) {
      const product = match[1].trim();
      const quantity = parseFloat(match[2]);
      const unit = match[3] || 'unit';
      const price = parseFloat(match[4]);

      if (product && !isNaN(quantity) && !isNaN(price)) {
        items.push({ product, quantity, unit, price });
      }
    }
  }

  // Calculate total if not found
  if (!totalAmount && items.length > 0) {
    totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  // Calculate confidence based on how many items we parsed
  const confidence = lines.length > 0 ? Math.min(1, items.length / lines.length) : 0;

  console.log('[Parser] Parsed items:', items);

  return {
    rawText,
    items,
    totalAmount,
    confidence,
  };
}

/**
 * Complete Parchi scanning pipeline
 * Prioritizes High-Accuracy Vision AI, falls back to Tesseract OCR if offline
 */
export async function scanParchi(imageBase64: string): Promise<ParchiData> {
  try {
    console.log('[Parchi Scanner] Attempting Vision AI extraction...');

    // 1. Try Groq Llama 3.2 Vision API first
    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Parchi Scanner] Vision AI success:', data);

        return {
          rawText: JSON.stringify(data),
          items: data.items || [],
          totalAmount: data.totalAmount,
          confidence: 0.95, // AI-generated structured data is high confidence
        };
      }

      console.warn('[Parchi Scanner] Vision AI failed or returned error, falling back to local OCR');
    } catch (e) {
      console.warn('[Parchi Scanner] Vision AI could not be reached (likely offline), falling back to local OCR');
    }

    // 2. Fallback: Local Tesseract OCR
    console.log('[Parchi Scanner] Starting local Tesseract OCR fallback...');
    const rawText = await extractParchiText(imageBase64);
    const parchiData = parseParchiData(rawText);

    return parchiData;

  } catch (error) {
    console.error('[Parchi Scanner] Global failure:', error);
    throw error;
  }
}
