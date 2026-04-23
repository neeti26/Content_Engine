'use client';

import { useState } from 'react';
import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import HeroSection from '@/components/HeroSection';
import UploadStep from '@/components/UploadStep';
import BriefStep from '@/components/BriefStep';
import ProcessingView from '@/components/ProcessingView';
import ResultsDashboard from '@/components/ResultsDashboard';

type AppStep = 'hero' | 'upload' | 'brief' | 'processing' | 'results';

export default function Home() {
  const [step, setStep] = useState<AppStep>('hero');
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [brief, setBrief] = useState<EventBrief | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedContent | null>(null);
  const [apiKey, setApiKey] = useState('');

  const handleStart = () => setStep('upload');

  const handleAssetsReady = (a: MediaAsset[]) => { setAssets(a); setStep('brief'); };

  const handleBriefSubmit = async (eventBrief: EventBrief) => {
    setBrief(eventBrief);
    setStep('processing');
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: eventBrief, assets, apiKey: apiKey || undefined }),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error ?? 'Failed to start');
      }
      const { jobId: id } = await res.json() as { jobId: string };
      setJobId(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start processing');
      setStep('brief');
    }
  };

  const handleDemoMode = async () => {
    setBrief({ eventName: 'TechSummit 2025', brandName: 'StepOne', eventType: 'Corporate Conference', location: 'Mumbai, India', date: '2025-04-15', keyHighlights: '500+ attendees, AI keynote, product demo, networking', targetAudience: 'Marketing leaders', tone: 'professional' });
    setStep('processing');
    try {
      const res = await fetch('/api/demo', { method: 'POST' });
      const { jobId: id } = await res.json() as { jobId: string };
      setJobId(id);
    } catch {
      setStep('hero');
    }
  };

  const handleReset = () => { setStep('hero'); setAssets([]); setBrief(null); setJobId(null); setResults(null); };

  return (
    <main className="min-h-screen bg-gray-950">
      {step === 'hero' && <HeroSection onStart={handleStart} onDemo={handleDemoMode} apiKey={apiKey} onApiKeyChange={setApiKey} />}
      {step === 'upload' && <UploadStep onNext={handleAssetsReady} onBack={() => setStep('hero')} />}
      {step === 'brief' && <BriefStep assetCount={assets.length} onSubmit={handleBriefSubmit} onBack={() => setStep('upload')} />}
      {step === 'processing' && jobId && <ProcessingView jobId={jobId} onComplete={(c) => { setResults(c); setStep('results'); }} onError={() => setStep('brief')} />}
      {step === 'results' && results && brief && <ResultsDashboard content={results} assets={assets} brief={brief} onReset={handleReset} />}
    </main>
  );
}
