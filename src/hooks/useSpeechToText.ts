'use client';

import { useState, useCallback, useEffect } from 'react';

export function useSpeechToText(onResult: (text: string) => void, language: string = 'en-US') {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = language;

            rec.onstart = () => {
                setIsListening(true);
            };

            rec.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript);
                setIsListening(false);
            };

            rec.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            setRecognition(rec);
        }
    }, [language, onResult]);

    const toggleListening = useCallback(() => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
            } catch (err) {
                console.error('Failed to start recognition:', err);
            }
        }
    }, [recognition, isListening]);

    return {
        isListening,
        toggleListening,
        isSupported: !!recognition || (typeof window !== 'undefined' && (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition))
    };
}
