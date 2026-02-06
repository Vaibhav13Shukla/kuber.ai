import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/tambo/config';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey || apiKey === 'your-groq-api-key-here' || !apiKey.trim()) {
            return NextResponse.json(
                { error: 'Groq API key not configured. Please add GROQ_API_KEY to .env.local.' },
                { status: 500 }
            );
        }

        // Format messages for OpenAI/Groq compatible API
        const formattedMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
            }))
        ];

        // Groq API call (Ultra-fast LPU inference)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Groq API Error]', data.error);
            throw new Error(data.error?.message || 'Groq API error');
        }

        const aiResponse = data.choices?.[0]?.message?.content || 'No response generated.';

        return NextResponse.json({ response: aiResponse });
    } catch (error: any) {
        console.error('[Groq API] Internal Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get response from Groq' },
            { status: 500 }
        );
    }
}
