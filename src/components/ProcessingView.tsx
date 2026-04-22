'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Loader2, XCircle, Zap, Brain } from 'lucide-react';
import { ProcessingStatus, GeneratedContent } from '@/types';

interface Props {
  jobId: string;
  onComplete: (content: GeneratedContent) => void;
  onError: () => void;
}

const POLL_INTERVAL = 2000;

const funFacts = [
  'AI is analyzing sharpness, composition, and brand relevance of each photo...',
  'Selecting the best assets for LinkedIn, Instagram, and Stories...',
  'Crafting a professional LinkedIn narrative with your event highlights...',
  'Writing scroll-stopping Instagram captions with strategic hashtags...',
  'Designing Instagram Story text overlays for maximum impact...',
  'Building a comprehensive case study with impact metrics...',
  'Almost there — finalizing your publish-ready content package...',
];

export default function ProcessingView({ jobId, onComplete, onError }: Props) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [factIndex, setFactIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const factIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Rotate fun facts
    factIntervalRef.current = setInterval(() => {
      setFactIndex((i) => (i + 1) % funFacts.length);
    }, 4000);

    return () => {
      if (factIntervalRef.current) clearInterval(factIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        if (!res.ok) return;
        const data = await res.json() as ProcessingStatus;
        setStatus(data);

        if (data.status === 'done' && data.result) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => onComplete(data.result!), 800);
        } else if (data.status === 'error') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(onError, 2000);
        }
      } catch {
        // ignore poll errors
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, onComplete, onError]);

  const progress = status?.progress ?? 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
              <Brain className="w-10 h-10 text-brand-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white text-center mb-2">
          AI is working its magic
        </h1>
        <p className="text-gray-400 text-center mb-10">
          Processing your event media and generating platform-ready content
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{status?.currentStep ?? 'Initializing...'}</span>
            <span className="text-brand-400 font-bold">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-600 to-accent-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
        {status?.steps && status.steps.length > 0 && (
          <div className="glass rounded-2xl p-6 mb-8 space-y-3">
            {status.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                {step.status === 'done' && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                )}
                {step.status === 'processing' && (
                  <Loader2 className="w-5 h-5 text-brand-400 flex-shrink-0 animate-spin" />
                )}
                {step.status === 'pending' && (
                  <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
                {step.status === 'error' && (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm ${
                      step.status === 'done'
                        ? 'text-gray-300'
                        : step.status === 'processing'
                        ? 'text-white font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {step.step}
                  </span>
                  {step.detail && (
                    <span className="text-gray-600 text-xs ml-2">· {step.detail}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fun fact */}
        <AnimatePresence mode="wait">
          <motion.div
            key={factIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-center text-gray-500 text-sm italic"
          >
            {funFacts[factIndex]}
          </motion.div>
        </AnimatePresence>

        {/* Error state */}
        {status?.status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center"
          >
            <p className="text-red-400 font-medium">Processing failed</p>
            <p className="text-gray-500 text-sm mt-1">{status.error}</p>
            <p className="text-gray-600 text-xs mt-2">Redirecting back...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
