'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap, FileText } from 'lucide-react';
import { EventBrief } from '@/types';

interface Props {
  assetCount: number;
  onSubmit: (brief: EventBrief) => void;
  onBack: () => void;
}

const toneOptions: { value: EventBrief['tone']; label: string; desc: string; emoji: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Formal, authoritative, B2B', emoji: '💼' },
  { value: 'energetic',    label: 'Energetic',    desc: 'High energy, action-oriented', emoji: '⚡' },
  { value: 'inspirational',label: 'Inspirational',desc: 'Motivating, story-driven', emoji: '✨' },
  { value: 'casual',       label: 'Casual',       desc: 'Friendly, conversational', emoji: '😊' },
];



export default function BriefStep({ assetCount, onSubmit, onBack }: Props) {
  const [form, setForm] = useState<EventBrief>({
    eventName: '',
    brandName: '',
    eventType: 'Brand Activation',
    location: '',
    date: '',
    keyHighlights: '',
    targetAudience: '',
    tone: 'professional',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof EventBrief, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.eventName.trim() &&
    form.brandName.trim() &&
    form.keyHighlights.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #09090f 0%, #0f0f1a 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-bold text-white text-sm">Event Brief</h2>
          <p className="text-white/30 text-xs">Step 2 of 2 · {assetCount} photos ready</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-white/10" />
          <div className="w-6 h-1.5 rounded-full bg-indigo-500" />
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h1 className="text-3xl font-black text-white">Tell us about your event</h1>
          </div>
          <p className="text-white/40 text-sm mb-8">
            The more detail you give, the better the AI-generated content will be.
          </p>

          <div className="space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Event Name *</label>
                <input type="text" value={form.eventName} onChange={(e) => update('eventName', e.target.value)}
                  placeholder="e.g. TechSummit 2025" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Brand Name *</label>
                <input type="text" value={form.brandName} onChange={(e) => update('brandName', e.target.value)}
                  placeholder="e.g. StepOne" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Event Type</label>
                <select value={form.eventType} onChange={(e) => update('eventType', e.target.value)}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm">
                  {['Product Launch','Brand Activation','Corporate Conference','Award Ceremony','Trade Show','Networking Event','Workshop / Training','Concert / Festival','Sports Event','CSR Initiative','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Location</label>
                <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)}
                  placeholder="e.g. Mumbai, India" className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Date</label>
                <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Key Highlights *</label>
              <textarea value={form.keyHighlights} onChange={(e) => update('keyHighlights', e.target.value)}
                placeholder="e.g. 500+ attendees, keynote by CEO, product demo, live performances, networking dinner..."
                rows={4} className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none" />
              <p className="text-white/20 text-xs mt-1.5">Be specific — numbers, names, moments. The AI uses this to write real content.</p>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Target Audience</label>
              <input type="text" value={form.targetAudience} onChange={(e) => update('targetAudience', e.target.value)}
                placeholder="e.g. Marketing professionals, startup founders, enterprise decision-makers"
                className="input-field w-full rounded-xl px-4 py-3 text-sm" />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-3 uppercase tracking-wider">Content Tone</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {toneOptions.map((t) => (
                  <button key={t.value} onClick={() => update('tone', t.value)}
                    className={`p-4 rounded-2xl border text-left transition-all ${form.tone === t.value ? 'border-indigo-500 text-white' : 'border-white/8 text-white/40 hover:border-white/20 hover:text-white/70'}`}
                    style={form.tone === t.value ? { background: 'rgba(99,102,241,0.12)' } : { background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-xl mb-2">{t.emoji}</div>
                    <div className="font-bold text-sm mb-0.5">{t.label}</div>
                    <div className="text-xs opacity-60">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <motion.button whileHover={{ scale: isValid ? 1.02 : 1 }} whileTap={{ scale: isValid ? 0.98 : 1 }}
              onClick={handleSubmit} disabled={!isValid || loading}
              className={`flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all ${isValid && !loading ? 'text-white glow-indigo' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
              style={isValid && !loading ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' } : {}}>
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Starting...</>
                : <><Zap className="w-5 h-5" />Generate All Content<ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
