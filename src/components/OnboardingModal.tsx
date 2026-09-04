'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { BrandKit } from '@/lib/supabase';

interface Props {
  onSave: (kit: Partial<BrandKit>) => Promise<void>;
  onSkip: () => void;
}

export default function OnboardingModal({ onSave, onSkip }: Props) {
  const [step, setStep]         = useState(0);
  const [saving, setSaving]     = useState(false);
  const [kit, setKit]           = useState<Partial<BrandKit>>({
    brand_name: '', industry: '', tone: 'professional',
    target_audience: '', brand_voice: '', past_content_examples: '',
  });

  const set = (k: keyof BrandKit, v: string) => setKit(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(kit);
    setSaving(false);
  };

  const steps = [
    {
      title: "Welcome to Content Engine 👋",
      subtitle: "Let's set up your Brand Kit so every generation is personalised to your brand — not generic.",
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Brand Name</label>
            <input
              value={kit.brand_name}
              onChange={e => set('brand_name', e.target.value)}
              placeholder="e.g. Acme Corp"
              className="input-field w-full rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Industry</label>
            <input
              value={kit.industry}
              onChange={e => set('industry', e.target.value)}
              placeholder="e.g. B2B SaaS, FMCG, Experiential Marketing..."
              className="input-field w-full rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Target Audience</label>
            <input
              value={kit.target_audience}
              onChange={e => set('target_audience', e.target.value)}
              placeholder="e.g. Marketing leaders, startup founders, CMOs"
              className="input-field w-full rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Your Brand Voice",
      subtitle: "This is what makes your content sound like YOU, not a robot.",
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Default Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {(['professional', 'energetic', 'inspirational', 'casual'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => set('tone', t)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize
                    ${kit.tone === t ? 'text-white border-violet-500/60' : 'text-white/50 border-white/8'}`}
                  style={{ background: kit.tone === t ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Brand Voice Guidelines</label>
            <textarea
              value={kit.brand_voice}
              onChange={e => set('brand_voice', e.target.value)}
              placeholder="e.g. We're bold but approachable. We use data to back claims. We never use corporate jargon. We speak to practitioners, not executives."
              rows={4}
              className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
            <p className="text-white/20 text-xs">The AI will use this to write in your brand's style.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Past Content (Optional)",
      subtitle: "Paste examples of your best posts. The AI learns your style.",
      content: (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Past Content Examples</label>
            <textarea
              value={kit.past_content_examples}
              onChange={e => set('past_content_examples', e.target.value)}
              placeholder={"Paste 1-3 of your best LinkedIn posts or captions here...\n\nExample:\nWe ran 47 events last quarter. Here's what we learned about post-event content...\n---\nAnother post here"}
              rows={8}
              className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none"
            />
            <p className="text-white/20 text-xs">Separate posts with --- on a new line. Skip this if you want.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-3xl border p-6 relative"
          style={{ background: 'rgba(9,5,20,0.98)', borderColor: 'rgba(167,139,250,0.2)', boxShadow: '0 0 60px rgba(124,58,237,0.2)' }}
        >
          <button onClick={onSkip} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? '24px' : '8px',
                  background: i <= step ? 'linear-gradient(90deg, #7c3aed, #a78bfa)' : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="font-black text-white text-xl">{steps[step].title}</h2>
          </div>
          <p className="text-white/40 text-sm mb-6">{steps[step].subtitle}</p>

          {steps[step].content}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={onSkip}
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              Skip setup
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
                >
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Sparkles className="w-4 h-4" />Save Brand Kit</>}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
