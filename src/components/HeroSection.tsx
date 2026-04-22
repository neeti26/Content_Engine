'use client';

import { motion } from 'framer-motion';
import { Zap, Image, FileText, Instagram, Linkedin, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const features = [
  { icon: Image, label: 'Smart Asset Scoring', desc: 'AI ranks every photo by sharpness, composition & brand relevance' },
  { icon: Linkedin, label: 'LinkedIn Post', desc: 'Professional narrative with hashtags and CTA' },
  { icon: Instagram, label: 'Instagram Post + Story', desc: 'Platform-native captions and visual overlays' },
  { icon: FileText, label: 'Case Study Draft', desc: 'Structured document with metrics and brand narrative' },
];

const stats = [
  { value: '< 3 min', label: 'End-to-end processing' },
  { value: '4 outputs', label: 'Platform-ready assets' },
  { value: '0 clicks', label: 'Manual intervention' },
  { value: 'GPT-4o', label: 'Powered by' },
];

export default function HeroSection({ onStart }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">StepOne</span>
          <span className="text-gray-500 text-sm ml-1">Content Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            Built for StepOne AI Buildathon
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-brand-300 text-sm font-medium">
              Content Intelligence Engine — Powered by GPT-4o Vision
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Raw Event Media
            <br />
            <span className="gradient-text">→ Publish-Ready Assets</span>
            <br />
            <span className="text-gray-400 text-4xl md:text-5xl font-bold">in under 3 minutes</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your event photos. Describe your event. Get LinkedIn posts, Instagram content,
            Stories, and a full case study draft — all generated and selected by AI. Zero manual work.
          </p>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all glow"
          >
            <Zap className="w-5 h-5" />
            Start Building Content
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-gray-600 text-sm mt-4">
            No signup required · Bring your own OpenAI key
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl"
        >
          {stats.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 w-full max-w-5xl"
        >
          {features.map((f) => (
            <div key={f.label} className="glass rounded-2xl p-5 text-left hover:border-brand-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div className="font-semibold text-white text-sm mb-1">{f.label}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Pipeline visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-12 flex items-center gap-2 text-sm text-gray-600 flex-wrap justify-center"
        >
          {['Upload Photos', '→', 'AI Scores Assets', '→', 'Select Best', '→', 'Generate Content', '→', '4 Platform Outputs'].map((item, i) => (
            <span
              key={i}
              className={item === '→' ? 'text-brand-600' : 'bg-gray-800 px-3 py-1 rounded-full text-gray-400'}
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
