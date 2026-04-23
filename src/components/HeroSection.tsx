'use client';

import { motion } from 'framer-motion';
import { Zap, FileText, Instagram, Linkedin, ArrowRight, Sparkles, Brain, BarChart2, Twitter } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const outputs = [
  { icon: Linkedin,   color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'LinkedIn Post',     desc: 'Professional narrative + hashtags + CTA' },
  { icon: Instagram,  color: 'text-pink-400',   bg: 'bg-pink-500/10',   label: 'Instagram Post',    desc: 'Scroll-stopping caption + 20+ hashtags' },
  { icon: Instagram,  color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Instagram Story',   desc: 'Bold text overlay + rendered 1080×1920' },
  { icon: Twitter,    color: 'text-sky-400',    bg: 'bg-sky-500/10',    label: 'Twitter/X Thread',  desc: '5-tweet thread with hooks and engagement' },
  { icon: FileText,   color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Case Study Draft',  desc: 'Metrics, narrative, conclusion — export ready' },
  { icon: BarChart2,  color: 'text-brand-400',  bg: 'bg-brand-500/10',  label: 'Asset Intelligence',desc: 'Every photo scored on 4 AI dimensions' },
];

const stats = [
  { value: '< 3 min', label: 'Full pipeline' },
  { value: '6',       label: 'Output formats' },
  { value: 'GPT-4o',  label: 'Vision model' },
  { value: '0',       label: 'Manual steps' },
];

const pipeline = ['Upload Photos', 'AI Scores Assets', 'Select Best Per Platform', 'Generate Content', '6 Publish-Ready Outputs'];

export default function HeroSection({ onStart }: Props) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-950">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-brand-600 top-[-200px] left-[-200px]" />
      <div className="orb w-[400px] h-[400px] bg-orange-500 bottom-[-100px] right-[-100px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-black text-white text-sm">StepOne</span>
            <span className="text-gray-500 text-xs ml-1.5">Content Intelligence Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · GPT-4o Vision
          </span>
          <span className="text-xs text-gray-500 bg-gray-800/80 px-3 py-1.5 rounded-full border border-white/5">
            StepOne AI Buildathon 2025
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/25 rounded-full px-5 py-2 mb-8"
          >
            <Brain className="w-4 h-4 text-brand-400" />
            <span className="text-brand-300 text-sm font-semibold">
              AI-Powered · Zero Manual Work · 6 Platform Outputs
            </span>
            <Sparkles className="w-4 h-4 text-brand-400" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight">
            Raw Event Photos
            <br />
            <span className="gradient-text">→ Publish-Ready Content</span>
            <br />
            <span className="text-gray-400 text-3xl sm:text-4xl md:text-5xl font-bold">in under 3 minutes</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload event photos, describe your event, and get AI-generated LinkedIn posts,
            Instagram content, Stories, Twitter threads, and a full case study — all selected
            and written by GPT-4o Vision. No prompting. No editing. Just results.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all glow"
            >
              <Zap className="w-5 h-5" />
              Start Building Content
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-gray-600 text-sm">
              No signup · Bring your OpenAI key · Free to use
            </p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-2xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center card-lift">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Pipeline flow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-center gap-1.5 flex-wrap mb-12"
          >
            {pipeline.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className="bg-gray-800/80 border border-white/5 text-gray-400 text-xs px-3 py-1.5 rounded-full">
                  {step}
                </span>
                {i < pipeline.length - 1 && (
                  <span className="text-brand-600 text-sm font-bold">→</span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Output cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {outputs.map((o, i) => (
              <motion.div
                key={o.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.07 }}
                className="glass glass-hover rounded-2xl p-4 text-left card-lift cursor-default"
              >
                <div className={`w-9 h-9 rounded-xl ${o.bg} flex items-center justify-center mb-3`}>
                  <o.icon className={`w-4.5 h-4.5 ${o.color}`} />
                </div>
                <div className="font-semibold text-white text-xs mb-1 leading-tight">{o.label}</div>
                <div className="text-gray-600 text-xs leading-relaxed">{o.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
