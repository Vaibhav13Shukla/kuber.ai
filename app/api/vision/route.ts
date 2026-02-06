import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { image } = await req.json(); // image should be base64 data URL
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey === 'your-groq-api-key-here' || !apiKey.trim()) {
            return NextResponse.json(
                { error: 'Groq API key not configured.' },
                { status: 500 }
            );
        }

        // Groq Llama 3.2 Vision call
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.2-11b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `You are a specialized OCR parser for Indian merchant "Parchis" (handwritten or printed bills).
Extract all items from the image into a JSON format.
Include product name, quantity, unit (if any), and price for each item.
Also calculate the total amount if visible.
Respond ONLY with the JSON object.

Example format:
{
  "items": [
    {"product": "Atta", "quantity": 10, "unit": "kg", "price": 450},
    {"product": "Milk", "quantity": 2, "unit": "packet", "price": 60}
  ],
  "totalAmount": 510
}`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: image
                                }
                            }
                        ]
                    }
                ],
                temperature: 0,
                max_tokens: 1024,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Vision API Error]', data.error);
            throw new Error(data.error?.message || 'Vision API error');
        }

        let content = data.choices?.[0]?.message?.content || '{}';

        // Clean markdown if present
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0].trim();
        }

        const parsedContent = JSON.parse(content);
        return NextResponse.json(parsedContent);

    } catch (error: any) {
        console.error('[Vision API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process image with Vision AI' },
            { status: 500 }
        );
    }
}
