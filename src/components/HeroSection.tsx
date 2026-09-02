'use client';

import { motion } from 'framer-motion';
import {
  Zap, Instagram, Linkedin, ArrowRight,
  Brain, Twitter, Sparkles, Play
} from 'lucide-react';
import Logo from '@/components/Logo';

interface Props {
  onStart: () => void;
  onDemo: () => void;
}

const outputs = [
  { icon: Linkedin,  color: '#3b82f6', label: 'LinkedIn Post',    desc: 'B2B narrative + CTA' },
  { icon: Instagram, color: '#ec4899', label: 'Instagram Post',   desc: 'Caption + 30 hashtags' },
  { icon: Instagram, color: '#f97316', label: 'IG Story',         desc: '1080×1920 rendered' },
  { icon: Twitter,   color: '#38bdf8', label: 'Twitter Thread',   desc: '5-tweet viral thread' },
];

const steps = [
  { n: '01', label: 'Upload Photos',       sub: 'Up to 20 event images' },
  { n: '02', label: 'Describe Your Event', sub: 'Name, brand, highlights' },
  { n: '03', label: 'AI Processes',        sub: 'Scores + selects + generates' },
  { n: '04', label: 'Get 4 Outputs',       sub: 'Copy, download, export' },
];

export default function HeroSection({ onStart, onDemo }: Props) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#09090f' }}>

      {/* Dot grid */}
      <div className="dot-grid" />

      {/* Background orbs — two focused, centered */}
      <div className="orb w-[700px] h-[700px] opacity-[0.12]" style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '-200px', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="orb w-[400px] h-[400px] opacity-[0.07]" style={{ background: 'radial-gradient(circle, #818cf8, transparent)', bottom: '-100px', right: '10%' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="font-black text-white text-sm tracking-tight">Content Engine</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="hidden sm:inline">Powered by Gemini AI</span>
        </div>
      </nav>

      {/* Hero body */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto w-full"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border-animated border"
            style={{ background: 'rgba(99,102,241,0.08)' }}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">AI-powered · photo scoring · 4 platform outputs</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[68px] font-black text-white mb-4 leading-[1.06] tracking-tight">
            Raw Event Photos
            <br />
            <span className="gradient-text">→ 4 Publish-Ready</span>
            <br />
            <span className="gradient-text">Marketing Assets</span>
          </h1>

          <p className="text-white/45 text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Upload photos, describe your event — get LinkedIn, Instagram, Story, and a Twitter thread in under 30 seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 text-white font-bold text-base px-7 py-3.5 rounded-2xl transition-all glow-indigo"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <Zap className="w-4 h-4" />
              Upload Photos & Generate
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDemo}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white font-semibold text-base px-7 py-3.5 rounded-2xl transition-all glass card-hover"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              Try Demo
            </motion.button>
          </div>

          {/* How it works */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className="flex items-center gap-2 glass rounded-xl px-3.5 py-2 card-hover">
                  <span className="text-indigo-500 text-xs font-black font-mono">{s.n}</span>
                  <div className="text-left">
                    <div className="text-white text-xs font-semibold">{s.label}</div>
                    <div className="text-white/30 text-[11px]">{s.sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-indigo-700 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Output cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto w-full">
            {outputs.map((o, i) => (
              <motion.div
                key={o.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="glass rounded-2xl p-4 text-left card-hover"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${o.color}18` }}>
                  <o.icon className="w-4 h-4" style={{ color: o.color }} />
                </div>
                <div className="text-white text-xs font-bold mb-0.5 leading-tight">{o.label}</div>
                <div className="text-white/30 text-[11px]">{o.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
