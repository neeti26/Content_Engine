'use client';

import { motion } from 'framer-motion';
import {
  Zap, Instagram, Linkedin, ArrowRight,
  Brain, Twitter, Sparkles, Play, MessageCircle, Film
} from 'lucide-react';
import Logo from '@/components/Logo';

interface Props {
  onStart: () => void;
  onDemo: () => void;
  isSignedIn?: boolean;
  userEmail?: string;
  onShowHistory?: () => void;
  onSignOut?: () => void;
}

const outputs = [
  { icon: Linkedin,       color: '#3b82f6', label: 'LinkedIn Post',    desc: 'B2B narrative + CTA' },
  { icon: Instagram,      color: '#ec4899', label: 'Instagram Post',   desc: 'Caption + 30 hashtags' },
  { icon: Film,           color: '#a855f7', label: 'IG Reel',          desc: 'Shot list + MP4 render' },
  { icon: Twitter,        color: '#38bdf8', label: 'Twitter Thread',   desc: '5-tweet viral thread' },
  { icon: MessageCircle,  color: '#22c55e', label: 'WhatsApp',         desc: 'Status + message copy' },
];

const steps = [
  { n: '01', label: 'Upload Photos',       sub: 'Up to 20 photos & videos' },
  { n: '02', label: 'Describe Your Event', sub: 'Name, brand, highlights' },
  { n: '03', label: 'AI Processes',        sub: 'Scores + selects + generates' },
  { n: '04', label: 'Get 5 Outputs',       sub: 'Copy, download, export' },
];

export default function HeroSection({ onStart, onDemo, isSignedIn, userEmail, onShowHistory }: Props) {
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
        <div className="flex items-center gap-2">
          {isSignedIn && (
            <button
              onClick={onShowHistory}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all"
            >
              History
            </button>
          )}
          {!isSignedIn && (
            <a
              href="/sign-in"
              className="flex items-center gap-1.5 text-xs font-semibold text-white border border-violet-500/40 hover:border-violet-400/60 px-4 py-1.5 rounded-full transition-all"
              style={{ background: 'rgba(124,58,237,0.15)' }}
            >
              Sign in
            </a>
          )}
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-7 border"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.15))',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(240,171,252,0.4)',
              boxShadow: '0 0 24px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <Brain className="w-3.5 h-3.5 text-fuchsia-300" />
            <span className="text-fuchsia-100 text-xs font-bold tracking-widest uppercase">AI-powered · photo scoring · 5 platform outputs</span>
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[72px] font-black text-white mb-4 leading-[1.04] tracking-tight">
            Raw Event Photos
            <br />
            <span className="gradient-text-shimmer">→ 5 Publish-Ready</span>
            <br />
            <span className="gradient-text">Marketing Assets</span>
          </h1>

          {/* Decorative accent line under headline */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="h-px w-16 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.6))' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" style={{ boxShadow: '0 0 8px rgba(232,121,249,0.8)' }} />
            <div className="h-px w-16 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(192,132,252,0.6), transparent)' }} />
          </div>

          <p className="text-violet-100/85 text-base max-w-lg mx-auto mb-8 leading-relaxed font-medium">
            Upload photos and videos, describe your event — get LinkedIn, Instagram, Reel, Twitter, and WhatsApp content in <span className="text-fuchsia-300 font-bold">under 30 seconds</span>. Zero manual work.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="inline-flex items-center gap-3 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #9333ea, #7c3aed, #6366f1)',
                boxShadow: '0 0 48px rgba(147,51,234,0.6), 0 4px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
            >
              <Zap className="w-4 h-4 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              Upload Photos &amp; Generate
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDemo}
              className="inline-flex items-center gap-2 text-white font-semibold text-base px-7 py-4 rounded-2xl transition-all card-hover"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(240,171,252,0.25)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <Play className="w-4 h-4 text-fuchsia-300" />
              Try Demo
            </motion.button>
          </div>

          {/* How it works */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 card-hover"
                  style={{
                    background: 'rgba(20,5,40,0.6)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(192,132,252,0.25)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  <span
                    className="text-xs font-black font-mono"
                    style={{ background: 'linear-gradient(135deg, #f0abfc, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >{s.n}</span>
                  <div className="text-left">
                    <div className="text-white text-xs font-bold leading-tight">{s.label}</div>
                    <div className="text-fuchsia-200/55 text-[10px] mt-0.5">{s.sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(192,132,252,0.7)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Output cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-2xl mx-auto w-full">
            {outputs.map((o, i) => (
              <motion.div
                key={o.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                className="rounded-2xl p-4 text-left card-hover relative overflow-hidden"
                style={{
                  background: 'rgba(15,4,32,0.65)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${o.color}40`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`
                }}
              >
                {/* Color bleed top-left */}
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full opacity-20 pointer-events-none"
                  style={{ background: o.color, filter: 'blur(16px)', transform: 'translate(-30%, -30%)' }} />
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${o.color}22`, border: `1px solid ${o.color}40` }}
                >
                  <o.icon
                    className="w-4 h-4"
                    style={{ color: o.color, filter: `drop-shadow(0 0 8px ${o.color})` }}
                  />
                </div>
                <div className="text-white text-xs font-bold mb-0.5 leading-tight">{o.label}</div>
                <div className="text-white/45 text-[10px]">{o.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
