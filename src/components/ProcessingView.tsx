'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, XCircle, Zap, Brain, Sparkles } from 'lucide-react';
import { ProcessingStatus, GeneratedContent } from '@/types';

interface Props {
  jobId: string;
  onComplete: (content: GeneratedContent) => void;
  onError: () => void;
}

const POLL_INTERVAL = 1800;

const insights = [
  { emoji: '🔍', text: 'Analyzing sharpness, composition, and brand relevance of each photo...' },
  { emoji: '🎯', text: 'Selecting the best asset for each platform with documented rationale...' },
  { emoji: '💼', text: 'Crafting a professional LinkedIn narrative with storytelling structure...' },
  { emoji: '📸', text: 'Writing scroll-stopping Instagram captions with strategic hashtags...' },
  { emoji: '⚡', text: 'Designing Instagram Story text overlays for maximum 3-second impact...' },
  { emoji: '🐦', text: 'Building a viral Twitter/X thread with hooks and engagement triggers...' },
  { emoji: '📊', text: 'Generating a comprehensive case study with impact metrics...' },
  { emoji: '✨', text: 'Finalizing your publish-ready content package...' },
];

const outputLabels = ['LinkedIn Post', 'Instagram Post', 'IG Story', 'Twitter Thread', 'Case Study'];

export default function ProcessingView({ jobId, onComplete, onError }: Props) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [insightIdx, setInsightIdx] = useState(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const insightRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    insightRef.current = setInterval(() => {
      setInsightIdx((i) => (i + 1) % insights.length);
    }, 3500);
    return () => { if (insightRef.current) clearInterval(insightRef.current); };
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/status/${jobId}`);
        if (!res.ok) return;
        const data = await res.json() as ProcessingStatus;
        setStatus(data);
        if (data.status === 'done' && data.result) {
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => onComplete(data.result!), 600);
        } else if (data.status === 'error') {
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(onError, 2000);
        }
      } catch { /* ignore */ }
    };
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [jobId, onComplete, onError]);

  const progress = status?.progress ?? 0;
  const insight = insights[insightIdx];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gray-950 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-brand-600 top-[-150px] left-[-150px]" />
      <div className="orb w-[300px] h-[300px] bg-orange-500 bottom-[-80px] right-[-80px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Animated brain icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-600/30 to-brand-800/30 border border-brand-500/30 flex items-center justify-center glow"
            >
              <Brain className="w-12 h-12 text-brand-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white text-center mb-2">
          AI is building your content
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          GPT-4o Vision is analyzing your photos and generating 5 platform-ready outputs
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400 text-xs truncate max-w-[70%]">
              {status?.currentStep ?? 'Initializing pipeline...'}
            </span>
            <span className="text-brand-400 font-black text-sm">{progress}%</span>
          </div>
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8, #f97316)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps list */}
        {status?.steps && status.steps.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-6 space-y-2.5">
            {status.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0">
                  {step.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {step.status === 'processing' && <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />}
                  {step.status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                  {step.status === 'pending' && <div className="w-4 h-4 rounded-full border border-gray-700" />}
                </div>
                <span className={`text-xs flex-1 ${
                  step.status === 'done' ? 'text-gray-400 line-through decoration-gray-600' :
                  step.status === 'processing' ? 'text-white font-semibold' : 'text-gray-700'
                }`}>
                  {step.step}
                </span>
                {step.detail && (
                  <span className="text-gray-700 text-xs">{step.detail}</span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Output preview chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {outputLabels.map((label, i) => {
            const done = progress >= (i + 1) * 18;
            return (
              <motion.span
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-gray-800/50 border-gray-700 text-gray-600'
                }`}
              >
                {done ? '✓ ' : ''}{label}
              </motion.span>
            );
          })}
        </div>

        {/* Rotating insight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={insightIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 glass rounded-xl px-4 py-3"
          >
            <span className="text-xl flex-shrink-0">{insight.emoji}</span>
            <p className="text-gray-500 text-xs leading-relaxed">{insight.text}</p>
            <Sparkles className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {status?.status === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center"
          >
            <p className="text-red-400 font-semibold text-sm">Processing failed</p>
            <p className="text-gray-500 text-xs mt-1">{status.error}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
