'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, FileText, Instagram, Linkedin, ArrowRight, Sparkles, Brain, BarChart2, Twitter, Eye, EyeOff, Key } from 'lucide-react';

interface Props {
  onStart: () => void;
  onDemo: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const outputs = [
  { icon: Linkedin,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'LinkedIn Post',    desc: 'Professional narrative + CTA' },
  { icon: Instagram, color: 'text-pink-400',   bg: 'bg-pink-500/10',   label: 'Instagram Post',   desc: 'Scroll-stopping caption + hashtags' },
  { icon: Instagram, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Instagram Story',  desc: 'Bold overlay + 1080×1920 render' },
  { icon: Twitter,   color: 'text-sky-400',    bg: 'bg-sky-500/10',    label: 'Twitter/X Thread', desc: '5-tweet viral thread' },
  { icon: FileText,  color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Case Study',       desc: 'Metrics + narrative + conclusion' },
  { icon: BarChart2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Asset Intelligence','desc': 'Every photo scored on 4 AI dimensions' },
];

const stats = [
  { value: '~60s', label: 'Total pipeline time' },
  { value: '6',    label: 'Platform outputs' },
  { value: '4',    label: 'AI scoring dimensions' },
  { value: '0',    label: 'Manual steps' },
];

export default function HeroSection({ onStart, onDemo, apiKey, onApiKeyChange }: Props) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-950">
      {/* Orbs */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[120px] top-[-200px] left-[-200px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-orange-500/8 blur-[100px] bottom-[-100px] right-[-100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-white text-sm">StepOne</span>
            <span className="text-gray-500 text-xs ml-1.5">Content Intelligence Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Gemini 1.5 Flash 8B · Free API
          </span>
          <span className="text-xs text-gray-500 bg-gray-800/80 px-3 py-1.5 rounded-full border border-white/5">
            StepOne AI Buildathon 2025
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto w-full"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/25 rounded-full px-5 py-2 mb-7">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-semibold">Gemini 1.5 Flash 8B · Free tier · ~20-30 seconds</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-5 leading-[1.05] tracking-tight">
            Raw Event Photos
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              → 6 Publish-Ready Outputs
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload event photos → AI scores every image on 4 dimensions → selects the best per platform → generates LinkedIn, Instagram, Story, Twitter thread, and Case Study simultaneously. Zero manual work.
          </p>

          {/* API Key input */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Paste your Gemini API key (free at aistudio.google.com)"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-gray-700 text-xs mt-1.5 text-center">Free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-400 underline">aistudio.google.com</a> · stays in your browser · or use Demo Mode</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
            >
              <Zap className="w-5 h-5" />
              Upload Photos & Generate
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDemo}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-white/8 font-semibold text-base px-7 py-3.5 rounded-xl transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Try Demo Mode
              <span className="text-xs text-gray-500 font-normal">no API key needed</span>
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Output cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {outputs.map((o, i) => (
              <motion.div
                key={o.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="rounded-2xl p-4 text-left border hover:border-indigo-500/30 transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <div className={`w-9 h-9 rounded-xl ${o.bg} flex items-center justify-center mb-3`}>
                  <o.icon className={`w-4 h-4 ${o.color}`} />
                </div>
                <div className="font-semibold text-white text-xs mb-1 leading-tight">{o.label}</div>
                <div className="text-gray-600 text-xs leading-relaxed">{o.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
