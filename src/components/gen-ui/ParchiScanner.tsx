'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { z } from 'zod';
import { scanParchi } from '@/lib/vision-optimizer';

export const ParchiScannerSchema = z.object({
    title: z.string().default('Scan Parchi'),
    instructions: z.string().default('Place the bill in front of the camera'),
});

export type ParchiScannerProps = z.infer<typeof ParchiScannerSchema>;

export const ParchiScanner: React.FC<ParchiScannerProps> = ({
    title,
    instructions,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                setError(null);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Could not access camera. Please check permissions.');
        }
    };

    const capture = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        // Draw video frame to canvas
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = canvasRef.current.toDataURL('image/jpeg');

        setIsProcessing(true);
        try {
            const data = await scanParchi(imageData);
            setResult(data);
            // Stop stream
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsStreaming(false);
        } catch (err) {
            setError('Failed to process image');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-[2.5rem] bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden p-6 text-white"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{title}</h3>
                {isStreaming && (
                    <button onClick={() => setIsStreaming(false)} className="p-2 rounded-full bg-zinc-800">
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="relative aspect-[3/4] rounded-3xl bg-black border border-zinc-800 overflow-hidden mb-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {!isStreaming && !result && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center p-8"
                        >
                            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Camera size={40} />
                            </div>
                            <p className="text-sm text-zinc-400 mb-6">{instructions}</p>
                            <button
                                onClick={startCamera}
                                className="px-8 py-3 bg-white text-black font-bold rounded-full transition-transform active:scale-95"
                            >
                                Open Camera
                            </button>
                        </motion.div>
                    )}

                    {isStreaming && (
                        <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 border-2 border-dashed border-indigo-500/50 m-8 rounded-2xl pointer-events-none" />
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4">
                                <button
                                    onClick={capture}
                                    disabled={isProcessing}
                                    className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50"
                                >
                                    {isProcessing ? <RefreshCw className="text-black animate-spin" /> : <div className="w-12 h-12 rounded-full border-4 border-black/10" />}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {result && (
                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 w-full">
                            <div className="flex items-center gap-3 text-emerald-400 mb-4">
                                <CheckCircle2 size={24} />
                                <span className="font-bold">Scan Successful</span>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-auto pr-2 custom-scrollbar">
                                {result.items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700">
                                        <span className="text-sm font-medium">{item.product}</span>
                                        <span className="text-sm font-bold">₹{item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setResult(null)}
                                className="w-full mt-6 py-3 border border-zinc-700 rounded-full text-sm font-medium hover:bg-zinc-800"
                            >
                                Scan Another
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <canvas ref={canvasRef} className="hidden" width={480} height={640} />
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mt-4">
                    {error}
                </div>
            )}
        </motion.div>
    );
};
