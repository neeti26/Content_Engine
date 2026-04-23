'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Zap, Brain, Sparkles } from 'lucide-react';
import { GeneratedContent } from '@/types';

interface Props {
  onComplete: (content: GeneratedContent) => void;
  onError: (msg: string) => void;
  // Pass the promise directly — no polling needed
  processingPromise: Promise<GeneratedContent>;
}

const steps = [
  { label: 'Scoring all photos with AI Vision', pct: 5 },
  { label: 'Selecting best asset per platform', pct: 35 },
  { label: 'Generating LinkedIn post', pct: 50 },
  { label: 'Generating Instagram caption', pct: 60 },
  { label: 'Generating Story overlay', pct: 70 },
  { label: 'Generating Twitter/X thread', pct: 78 },
  { label: 'Generating case study draft', pct: 86 },
  { label: 'Packaging all outputs', pct: 96 },
];

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

export default function ProcessingView({ onComplete, onError, processingPromise }: Props) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [doneSteps, setDoneSteps] = useState<string[]>([]);
  const [insightIdx, setInsightIdx] = useState(0);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const insightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stepIdxRef = useRef(0);

  // Animate through steps automatically
  useEffect(() => {
    const advance = () => {
      const idx = stepIdxRef.current;
      if (idx < steps.length) {
        const s = steps[idx];
        setCurrentStep(s.label);
        setProgress(s.pct);
        setDoneSteps(steps.slice(0, idx).map((x) => x.label));
        stepIdxRef.current = idx + 1;
        // Space steps out — faster at start, slower near end
        const delay = idx < 2 ? 4000 : idx < 5 ? 5000 : 7000;
        stepTimerRef.current = setTimeout(advance, delay);
      }
    };
    stepTimerRef.current = setTimeout(advance, 800);

    insightTimerRef.current = setInterval(() => {
      setInsightIdx((i) => (i + 1) % insights.length);
    }, 3500);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      if (insightTimerRef.current) clearInterval(insightTimerRef.current);
    };
  }, []);

  // Wait for the actual result
  useEffect(() => {
    processingPromise
      .then((result) => {
        if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
        setProgress(100);
        setCurrentStep('Done!');
        setDoneSteps(steps.map((s) => s.label));
        setTimeout(() => onComplete(result), 600);
      })
      .catch((err) => {
        if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
        onError(err instanceof Error ? err.message : 'Processing failed');
      });
  }, [processingPromise, onComplete, onError]);

  const insight = insights[insightIdx];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gray-950 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/8 blur-[120px] top-[-150px] left-[-150px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-orange-500/6 blur-[100px] bottom-[-80px] right-[-80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Animated icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 0 40px rgba(99,102,241,0.2)' }}
            >
              <Brain className="w-10 h-10 text-indigo-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </motion.div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white text-center mb-1.5">AI is building your content</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Gemini 2.0 Flash · Parallel processing · ~15-20 seconds</p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400 truncate max-w-[75%]">{currentStep}</span>
            <span className="text-indigo-400 font-black">{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8, #f97316)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-2xl p-5 mb-5 space-y-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {steps.map((step) => {
            const isDone = doneSteps.includes(step.label);
            const isActive = currentStep === step.label;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {isDone
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : isActive
                    ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    : <div className="w-3 h-3 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.12)' }} />
                  }
                </div>
                <span className={`text-xs ${isDone ? 'text-gray-500 line-through decoration-gray-700' : isActive ? 'text-white font-semibold' : 'text-gray-700'}`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Output chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {['LinkedIn', 'Instagram', 'IG Story', 'Twitter/X', 'Case Study'].map((label, i) => {
            const done = progress >= (i + 1) * 18;
            return (
              <span key={label} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${done ? 'text-emerald-400 border-emerald-500/30' : 'text-gray-700 border-gray-800'}`}
                style={{ background: done ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.02)' }}>
                {done ? '✓ ' : ''}{label}
              </span>
            );
          })}
        </div>

        {/* Rotating insight */}
        <AnimatePresence mode="wait">
          <motion.div
            key={insightIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-lg flex-shrink-0">{insight.emoji}</span>
            <p className="text-gray-500 text-xs leading-relaxed">{insight.text}</p>
            <Sparkles className="w-3.5 h-3.5 text-indigo-700 flex-shrink-0" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
