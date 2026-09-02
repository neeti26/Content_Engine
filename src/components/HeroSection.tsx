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
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bg-purple.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        style={{ zIndex: 0 }}
      />
      {/* Dark scrim — keeps text legible without hiding the photo */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, background: 'linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ zIndex: 10, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="font-black text-white text-sm tracking-tight">Content Engine</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-400/15 border border-emerald-400/30 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="hidden sm:inline">Powered by Gemini AI</span>
        </div>
      </nav>

      {/* Hero body */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10 text-center" style={{ zIndex: 10 }}>
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
            style={{ background: 'rgba(124,58,237,0.22)', backdropFilter: 'blur(10px)', borderColor: 'rgba(167,139,250,0.45)' }}
          >
            <Brain className="w-3.5 h-3.5 text-violet-300" />
            <span className="text-violet-100 text-xs font-semibold tracking-wide">AI-powered · photo scoring · 4 platform outputs</span>
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[68px] font-black text-white mb-4 leading-[1.06] tracking-tight"
            style={{ textShadow: '0 2px 40px rgba(167,139,250,0.3)' }}>
            Raw Event Photos
            <br />
            <span className="gradient-text">→ 4 Publish-Ready</span>
            <br />
            <span className="gradient-text">Marketing Assets</span>
          </h1>

          <p className="text-violet-100/80 text-base max-w-lg mx-auto mb-8 leading-relaxed font-medium">
            Upload photos, describe your event — get LinkedIn, Instagram, Story, and a Twitter thread in under 30 seconds.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 text-white font-bold text-base px-7 py-3.5 rounded-2xl transition-all glow-indigo"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', boxShadow: '0 0 40px rgba(124,58,237,0.55), 0 4px 20px rgba(99,102,241,0.3)' }}
            >
              <Zap className="w-4 h-4" />
              Upload Photos & Generate
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDemo}
              className="inline-flex items-center gap-2 text-white font-semibold text-base px-7 py-3.5 rounded-2xl transition-all card-hover"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.22)' }}
            >
              <Play className="w-4 h-4 text-violet-300" />
              Try Demo
            </motion.button>
          </div>

          {/* How it works */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 card-hover"
                  style={{ background: 'rgba(15,5,30,0.55)', backdropFilter: 'blur(14px)', border: '1px solid rgba(167,139,250,0.2)' }}>
                  <span className="text-violet-300 text-xs font-black font-mono">{s.n}</span>
                  <div className="text-left">
                    <div className="text-white text-xs font-bold">{s.label}</div>
                    <div className="text-violet-200/60 text-[11px]">{s.sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-violet-400 flex-shrink-0" />}
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
                className="rounded-2xl p-4 text-left card-hover"
                style={{ background: 'rgba(15,5,30,0.6)', backdropFilter: 'blur(18px)', border: '1px solid rgba(167,139,250,0.22)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5" style={{ background: `${o.color}30` }}>
                  <o.icon className="w-4 h-4" style={{ color: o.color, filter: `drop-shadow(0 0 6px ${o.color}88)` }} />
                </div>
                <div className="text-white text-xs font-bold mb-0.5 leading-tight">{o.label}</div>
                <div className="text-violet-200/55 text-[11px]">{o.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
