'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain, Image, FileText, Instagram, Linkedin, Twitter, BarChart2, Clock, GitBranch, Shield, Cpu } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="min-h-screen bg-gray-950 px-6 py-12 overflow-auto">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold">System Architecture</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-3">How It Works</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            A fully automated pipeline from raw event media to publish-ready content. Every decision is documented. Every output is platform-native.
          </p>
        </div>

        {/* Pipeline */}
        <div className="space-y-3 mb-12">
          {[
            {
              step: '01',
              title: 'Media Ingestion',
              desc: 'Up to 20 photos uploaded as base64. Client-side processing — no server storage.',
              icon: Image,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20',
              detail: 'Browser FileReader API → base64 → MediaAsset objects with UUID',
            },
            {
              step: '02',
              title: 'Parallel AI Scoring',
              desc: 'All images scored simultaneously using GPT-4o Vision. 10 images = same time as 1.',
              icon: Brain,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
              border: 'border-purple-500/20',
              detail: 'Promise.allSettled() → scoreAndDescribeImage() → 4 dimensions + description in 1 call',
            },
            {
              step: '03',
              title: 'Intelligent Asset Selection',
              desc: 'GPT-4o selects the best image for each platform based on scores + context. Documents why.',
              icon: BarChart2,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10',
              border: 'border-indigo-500/20',
              detail: 'Sorted scored assets → GPT-4o JSON selection → rationale per platform',
            },
            {
              step: '04',
              title: 'Parallel Content Generation',
              desc: 'All 5 platform outputs generated simultaneously. LinkedIn, Instagram, Story, Twitter, Case Study.',
              icon: Zap,
              color: 'text-orange-400',
              bg: 'bg-orange-500/10',
              border: 'border-orange-500/20',
              detail: 'Promise.all([linkedin, instagram, story, twitter, caseStudy]) → ~15s total',
            },
            {
              step: '05',
              title: 'Output Package',
              desc: 'All content assembled, copyable, exportable. Story renders to 1080×1920 JPG via Canvas API.',
              icon: FileText,
              color: 'text-green-400',
              bg: 'bg-green-500/10',
              border: 'border-green-500/20',
              detail: 'Tabbed dashboard → one-click copy → export all as .txt → story download as JPG',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-5 rounded-2xl border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-gray-600 font-mono">{item.step}</span>
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                <code className="text-xs text-gray-600 font-mono">{item.detail}</code>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timing breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Performance Breakdown</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Image scoring (10 photos, parallel)', time: '~8s', color: 'bg-purple-500' },
                { label: 'Asset selection', time: '~3s', color: 'bg-indigo-500' },
                { label: 'Content generation (5 outputs, parallel)', time: '~15s', color: 'bg-orange-500' },
                { label: 'Total pipeline', time: '~26s', color: 'bg-green-500', bold: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${row.color}`} />
                    <span className={`text-xs ${row.bold ? 'text-white font-bold' : 'text-gray-400'}`}>{row.label}</span>
                  </div>
                  <span className={`text-xs font-mono ${row.bold ? 'text-green-400 font-bold' : 'text-gray-500'}`}>{row.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">AI Model Usage</h3>
            </div>
            <div className="space-y-3">
              {[
                { task: 'Image scoring + description', model: 'GPT-4o Vision (low detail)', calls: 'N parallel' },
                { task: 'Asset selection', model: 'GPT-4o (JSON mode)', calls: '1 call' },
                { task: 'LinkedIn post', model: 'GPT-4o (JSON mode)', calls: '1 call' },
                { task: 'Instagram caption', model: 'GPT-4o (JSON mode)', calls: '1 call' },
                { task: 'Story overlay', model: 'GPT-4o (JSON mode)', calls: '1 call' },
                { task: 'Twitter thread', model: 'GPT-4o (JSON mode)', calls: '1 call' },
                { task: 'Case study', model: 'GPT-4o (JSON mode)', calls: '1 call' },
              ].map((row) => (
                <div key={row.task} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-gray-400 flex-1">{row.task}</span>
                  <span className="text-xs text-indigo-300 font-mono text-right">{row.calls}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform differentiation */}
        <div className="p-6 rounded-2xl border mb-12" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
          <h3 className="font-bold text-white text-sm mb-4">Platform Differentiation Strategy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { platform: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-500/10', strategy: 'B2B storytelling. Specific numbers. Thought leadership angle. Ends with professional debate question. 3-4 short paragraphs.' },
              { platform: 'Instagram Post', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10', strategy: 'Hook-first. Emojis woven in naturally. Speaks directly to reader with "you". 30 hashtags across mega/mid/niche tiers.' },
              { platform: 'Instagram Story', icon: Instagram, color: 'text-orange-400', bg: 'bg-orange-500/10', strategy: '3-second consumption. Billboard thinking. 3-4 word ALL CAPS headline. Canvas-rendered 1080×1920 JPG.' },
              { platform: 'Twitter/X', icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-500/10', strategy: '5-tweet thread: hook → scene → insight → proof → CTA. Each tweet standalone. Max 260 chars. Real value, not hype.' },
              { platform: 'Case Study', icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10', strategy: 'Challenge → execution → results structure. Every claim has a number. 5 impact metrics. Wins new business.' },
              { platform: 'Asset Intelligence', icon: BarChart2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', strategy: '4-dimension scoring: sharpness, composition, brand relevance, human engagement. Selection rationale documented per platform.' },
            ].map((p) => (
              <div key={p.platform} className="p-4 rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${p.bg} flex items-center justify-center`}>
                    <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
                  </div>
                  <span className="text-white text-xs font-bold">{p.platform}</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{p.strategy}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why this beats manual */}
        <div className="p-6 rounded-2xl border" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Why This Solves StepOne's Real Problem</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { before: 'Manual asset selection: 30-60 min per event', after: 'AI scores all photos in ~8s, selects best per platform with documented rationale' },
              { before: 'One copywriter writes all platforms: inconsistent voice', after: 'Platform-native prompts: LinkedIn gets B2B tone, Instagram gets scroll-stopping hooks' },
              { before: 'Content ready 2-3 days after event', after: 'Full content package ready in ~26 seconds after upload' },
            ].map((row, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 text-xs mt-0.5">✗</span>
                  <span className="text-gray-500 text-xs">{row.before}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xs mt-0.5">✓</span>
                  <span className="text-gray-300 text-xs">{row.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
