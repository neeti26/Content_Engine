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
  const [results, setResults] = useState<GeneratedContent | null>(null);
  const [apiKey, setApiKey] = useState('');
  // Store the processing promise so ProcessingView can await it
  const [processingPromise, setProcessingPromise] = useState<Promise<GeneratedContent> | null>(null);

  const handleStart = () => setStep('upload');
  const handleAssetsReady = (a: MediaAsset[]) => { setAssets(a); setStep('brief'); };

  const handleBriefSubmit = (eventBrief: EventBrief) => {
    setBrief(eventBrief);

    // Create the promise and store it — don't await here
    const promise = fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: eventBrief, assets, apiKey: apiKey || undefined }),
    }).then(async (res) => {
      const data = await res.json() as { result?: GeneratedContent; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Processing failed');
      if (!data.result) throw new Error('No result returned');
      return data.result;
    });

    setProcessingPromise(promise);
    setStep('processing');
  };

  const handleDemoMode = () => {
    setBrief({
      eventName: 'TechSummit 2026', brandName: 'StepOne', eventType: 'Corporate Conference',
      location: 'Mumbai, India', date: '2025-04-15',
      keyHighlights: '500+ attendees, AI keynote with standing ovation, product demo, 8 partnerships formed, 94% satisfaction',
      targetAudience: 'Marketing leaders and CMOs', tone: 'professional',
    });

    const promise = fetch('/api/demo', { method: 'POST' })
      .then(async (res) => {
        const data = await res.json() as { result?: GeneratedContent; error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? 'Demo failed');
        if (!data.result) throw new Error('No demo result');
        return data.result;
      });

    setProcessingPromise(promise);
    setStep('processing');
  };

  const handleReset = () => {
    setStep('hero'); setAssets([]); setBrief(null);
    setResults(null); setProcessingPromise(null);
  };

  return (
    <main className="min-h-screen bg-gray-950">
      {step === 'hero' && (
        <HeroSection onStart={handleStart} onDemo={handleDemoMode} apiKey={apiKey} onApiKeyChange={setApiKey} />
      )}
      {step === 'upload' && (
        <UploadStep onNext={handleAssetsReady} onBack={() => setStep('hero')} />
      )}
      {step === 'brief' && (
        <BriefStep assetCount={assets.length} onSubmit={handleBriefSubmit} onBack={() => setStep('upload')} />
      )}
      {step === 'processing' && processingPromise && (
        <ProcessingView
          processingPromise={processingPromise}
          onComplete={(c) => { setResults(c); setStep('results'); }}
          onError={(msg) => { alert(msg); setStep('brief'); }}
        />
      )}
      {step === 'results' && results && brief && (
        <ResultsDashboard content={results} assets={assets} brief={brief} onReset={handleReset} />
      )}
    </main>
  );
}
