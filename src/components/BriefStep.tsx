'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { EventBrief } from '@/types';

interface Props {
  assetCount: number;
  onSubmit: (brief: EventBrief) => void;
  onBack: () => void;
}

const tones: { value: EventBrief['tone']; emoji: string; label: string; desc: string }[] = [
  { value: 'professional',  emoji: '💼', label: 'Professional',  desc: 'Formal, B2B authority' },
  { value: 'energetic',     emoji: '⚡', label: 'Energetic',     desc: 'Bold, action-driven' },
  { value: 'inspirational', emoji: '✨', label: 'Inspirational', desc: 'Story-first, aspirational' },
  { value: 'casual',        emoji: '😊', label: 'Casual',        desc: 'Warm, conversational' },
];

const eventTypes = [
  'Brand Activation','Product Launch','Corporate Conference','Award Ceremony',
  'Trade Show','Networking Event','Workshop / Training','Concert / Festival',
  'Sports Event','CSR Initiative','Other',
];

export default function BriefStep({ assetCount, onSubmit, onBack }: Props) {
  const [form, setForm] = useState<EventBrief>({
    eventName: '', brandName: '', eventType: 'Brand Activation',
    location: '', date: '', keyHighlights: '', targetAudience: '', tone: 'professional',
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof EventBrief, v: string) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.eventName.trim() && form.brandName.trim() && form.keyHighlights.trim();

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #09090f 0%, #0d0d1f 50%, #09090f 100%)' }}>
      {/* Orbs */}
      <div className="orb w-[600px] h-[600px] opacity-[0.06]" style={{ background: 'radial-gradient(circle, #6366f1, transparent)', top: '-200px', right: '-100px' }} />

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 px-6 py-4 flex items-center gap-4" style={{ background: 'rgba(9,9,15,0.8)', backdropFilter: 'blur(20px)' }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors card-hover">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-bold text-white text-sm">Event Brief</h2>
          <p className="text-white/30 text-xs">Step 2 of 2 · {assetCount} photo{assetCount !== 1 ? 's' : ''} ready</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-8 h-1.5 rounded-full bg-white/10" />
          <div className="w-8 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
        </div>
      </div>

      <div className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Title */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white">Tell us about your event</h1>
          </div>
          <p className="text-white/35 text-sm mb-8 ml-12">The more detail you give, the better the AI-generated content will be.</p>

          <div className="space-y-5">

            {/* Row 1: Event + Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Event Name <span className="text-indigo-400">*</span></label>
                <input value={form.eventName} onChange={e => set('eventName', e.target.value)}
                  placeholder="e.g. TechSummit 2025" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Brand Name <span className="text-indigo-400">*</span></label>
                <input value={form.brandName} onChange={e => set('brandName', e.target.value)}
                  placeholder="e.g. StepOne" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>

            {/* Row 2: Type + Location + Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Event Type</label>
                <select value={form.eventType} onChange={e => set('eventType', e.target.value)}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Location</label>
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="e.g. Mumbai, India" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Date</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Key Highlights <span className="text-indigo-400">*</span></label>
              <textarea value={form.keyHighlights} onChange={e => set('keyHighlights', e.target.value)}
                placeholder="e.g. 500+ attendees, keynote by CEO, product demo of AI platform, live performances, networking dinner, 3 panel discussions..."
                rows={4} className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none" />
              <p className="text-white/20 text-xs">Be specific — numbers, names, moments. The AI uses this to write real content.</p>
            </div>

            {/* Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Target Audience</label>
              <input value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)}
                placeholder="e.g. Marketing professionals, startup founders, enterprise decision-makers"
                className="input-field w-full rounded-xl px-4 py-3 text-sm" />
            </div>

            {/* Tone */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Content Tone</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tones.map(t => (
                  <button key={t.value} onClick={() => set('tone', t.value)}
                    className={`p-4 rounded-2xl border text-left transition-all card-hover ${form.tone === t.value ? 'border-indigo-500/60' : 'border-white/8 hover:border-white/20'}`}
                    style={{ background: form.tone === t.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)' }}>
                    <div className="text-2xl mb-2">{t.emoji}</div>
                    <div className={`font-bold text-sm mb-0.5 ${form.tone === t.value ? 'text-white' : 'text-white/60'}`}>{t.label}</div>
                    <div className="text-xs text-white/30">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Submit */}
          <div className="mt-10 flex items-center justify-between">
            <p className="text-white/20 text-xs">Fields marked <span className="text-indigo-400">*</span> are required</p>
            <motion.button whileHover={{ scale: valid ? 1.02 : 1 }} whileTap={{ scale: valid ? 0.97 : 1 }}
              onClick={handleSubmit} disabled={!valid || loading}
              className={`flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all ${valid && !loading ? 'text-white glow-indigo' : 'text-white/20 cursor-not-allowed'}`}
              style={valid && !loading ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' } : { background: 'rgba(255,255,255,0.05)' }}>
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                : <><Zap className="w-5 h-5" />Generate All Content<ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
