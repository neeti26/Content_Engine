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

const toneOptions: { value: EventBrief['tone']; label: string; desc: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Formal, authoritative, B2B focused' },
  { value: 'energetic', label: 'Energetic', desc: 'High energy, exciting, action-oriented' },
  { value: 'inspirational', label: 'Inspirational', desc: 'Motivating, aspirational, story-driven' },
  { value: 'casual', label: 'Casual', desc: 'Friendly, conversational, approachable' },
];

const eventTypes = [
  'Product Launch', 'Brand Activation', 'Corporate Conference', 'Award Ceremony',
  'Trade Show', 'Networking Event', 'Workshop / Training', 'Concert / Festival',
  'Sports Event', 'CSR Initiative', 'Other',
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold text-white">Event Brief</h2>
          <p className="text-gray-500 text-sm">Step 2 of 2 · {assetCount} photos ready</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <div className="w-8 h-1 rounded-full bg-brand-500" />
          <div className="w-2 h-2 rounded-full bg-brand-500" />
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-brand-400" />
            <h1 className="text-3xl font-black text-white">Tell us about your event</h1>
          </div>
          <p className="text-gray-400 mb-8">
            This context powers the AI to generate platform-specific content that actually sounds human.
          </p>

          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.eventName}
                  onChange={(e) => update('eventName', e.target.value)}
                  placeholder="e.g. TechSummit 2025"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Brand Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.brandName}
                  onChange={(e) => update('brandName', e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
                <select
                  value={form.eventType}
                  onChange={(e) => update('eventType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="e.g. Mumbai, India"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Key Highlights */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Key Highlights <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.keyHighlights}
                onChange={(e) => update('keyHighlights', e.target.value)}
                placeholder="e.g. 500+ attendees, keynote by CEO, product demo of new AI platform, live performances, networking dinner, 3 panel discussions on future of tech..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
              <p className="text-gray-600 text-xs mt-1">
                The more detail you provide, the better the AI-generated content will be.
              </p>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
              <input
                type="text"
                value={form.targetAudience}
                onChange={(e) => update('targetAudience', e.target.value)}
                placeholder="e.g. Marketing professionals, startup founders, enterprise decision-makers"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Content Tone</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update('tone', t.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.tone === t.value
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">{t.label}</div>
                    <div className="text-xs opacity-70">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-10 flex justify-end">
            <motion.button
              whileHover={{ scale: isValid ? 1.02 : 1 }}
              whileTap={{ scale: isValid ? 0.98 : 1 }}
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className={`flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all ${
                isValid && !loading
                  ? 'bg-brand-600 hover:bg-brand-500 text-white glow'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting pipeline...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate All Content
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
