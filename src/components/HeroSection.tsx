'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, FileText, Instagram, Linkedin, ArrowRight,
  Brain, BarChart2, Twitter, Eye, EyeOff, Key, Sparkles, Play
} from 'lucide-react';

interface Props {
  onStart: () => void;
  onDemo: () => void;
  apiKey: string;
  onApiKeyChange: (k: string) => void;
}

const outputs = [
  { icon: Linkedin,  color: '#3b82f6', label: 'LinkedIn Post',    desc: 'B2B narrative + CTA' },
  { icon: Instagram, color: '#ec4899', label: 'Instagram Post',   desc: 'Caption + 30 hashtags' },
  { icon: Instagram, color: '#f97316', label: 'IG Story',         desc: '1080×1920 rendered' },
  { icon: Twitter,   color: '#38bdf8', label: 'Twitter Thread',   desc: '5-tweet viral thread' },
  { icon: FileText,  color: '#34d399', label: 'Case Study',       desc: 'Metrics + narrative' },
  { icon: BarChart2, color: '#a78bfa', label: 'Asset Scores',     desc: '4-dimension AI scoring' },
];

const steps = [
  { n: '01', label: 'Upload Photos',         sub: 'Up to 20 event images' },
  { n: '02', label: 'Describe Your Event',   sub: 'Name, brand, highlights' },
  { n: '03', label: 'AI Processes',          sub: 'Scores + selects + generates' },
  { n: '04', label: 'Get 6 Outputs',         sub: 'Copy, download, export' },
];

export default function HeroSection({ onStart, onDemo, apiKey, onApiKeyChange }: Props) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #09090f 0%, #0f0f1a 50%, #09090f 100%)' }}>

      {/* Background orbs */}
      <div className="orb w-[800px] h-[800px] opacity-[0.07]" style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '-300px', left: '-300px' }} />
      <div className="orb w-[500px] h-[500px] opacity-[0.05]" style={{ background: 'radial-gradient(circle, #f97316, transparent)', bottom: '-150px', right: '-150px' }} />
      <div className="orb w-[300px] h-[300px] opacity-[0.04]" style={{ background: 'radial-gradient(circle, #ec4899, transparent)', top: '40%', right: '10%' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-white text-sm tracking-tight">StepOne</span>
            <span className="text-white/30 text-xs ml-1.5">Content Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span className="hidden sm:inline">Gemini AI · Free Tier</span>
          </div>
          <span className="hidden md:block text-xs text-white/20 bg-white/5 border border-white/8 px-3 py-1.5 rounded-full">
            StepOne AI Buildathon 2025
          </span>
        </div>
      </nav>

      {/* Hero body */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto w-full"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 border-animated border"
            style={{ background: 'rgba(99,102,241,0.08)' }}
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-semibold">AI scores every photo · selects best per platform · generates all 6 outputs</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[72px] font-black text-white mb-5 leading-[1.04] tracking-tight">
            Raw Event Photos
            <br />
            <span className="gradient-text">→ 6 Publish-Ready</span>
            <br />
            <span className="gradient-text">Marketing Assets</span>
          </h1>

          <p className="text-white/40 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Upload photos, describe your event — get LinkedIn, Instagram, Story, Twitter thread, and a full case study in under 30 seconds. Zero manual work.
          </p>

          {/* API Key */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Paste your Gemini API key..."
                className="input-field w-full rounded-2xl pl-11 pr-11 py-3.5 text-sm"
              />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-white/20 text-xs mt-2">
              Free key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">
                aistudio.google.com
              </a>
              {' '}· stays in your browser · or try Demo Mode
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all glow-indigo"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              <Zap className="w-5 h-5" />
              Upload Photos & Generate
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDemo}
              className="inline-flex items-center gap-2.5 text-white/70 hover:text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all glass card-hover"
            >
              <Play className="w-4 h-4 text-indigo-400" />
              Try Demo Mode
              <span className="text-xs text-white/30 font-normal">no key needed</span>
            </motion.button>
          </div>

          {/* How it works */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 card-hover">
                  <span className="text-indigo-500 text-xs font-black font-mono">{s.n}</span>
                  <div className="text-left">
                    <div className="text-white text-xs font-semibold">{s.label}</div>
                    <div className="text-white/30 text-xs">{s.sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Output cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {outputs.map((o, i) => (
              <motion.div
                key={o.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="glass rounded-2xl p-4 text-left card-hover"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${o.color}18` }}>
                  <o.icon className="w-4 h-4" style={{ color: o.color }} />
                </div>
                <div className="text-white text-xs font-bold mb-0.5 leading-tight">{o.label}</div>
                <div className="text-white/30 text-xs">{o.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
