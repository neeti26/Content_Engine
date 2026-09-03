'use client';

import { useState } from 'react';
import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import HeroSection from '@/components/HeroSection';
import UploadStep from '@/components/UploadStep';
import BriefStep from '@/components/BriefStep';
import ProcessingView from '@/components/ProcessingView';
import ResultsDashboard from '@/components/ResultsDashboard';

type AppStep = 'hero' | 'upload' | 'brief' | 'processing' | 'results';

const STORAGE_KEY = 'content_engine_last_result';

export default function Home() {
  const [step, setStep] = useState<AppStep>('hero');
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [brief, setBrief] = useState<EventBrief | null>(null);
  const [results, setResults] = useState<GeneratedContent | null>(null);
  const [processingPromise, setProcessingPromise] = useState<Promise<GeneratedContent> | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStart = () => setStep('upload');
  const handleAssetsReady = (a: MediaAsset[]) => { setAssets(a); setStep('brief'); };

  const handleBriefSubmit = (eventBrief: EventBrief) => {
    setBrief(eventBrief);
    setErrorMsg(null);

    // Send only small API-compressed copies to stay under Vercel's 4.5MB body limit.
    // Full-quality base64 stays in client state for display in ResultsDashboard.
    const apiAssets = assets.map(({ base64: _display, apiBase64, thumbnailBase64: _thumb, ...rest }) => ({
      ...rest,
      base64: apiBase64 ?? _display, // fallback to display if apiBase64 missing
      mimeType: rest.mimeType,
    }));

    const promise = fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: eventBrief, assets: apiAssets }),
    }).then(async (res) => {
      // Guard: Vercel may return HTML/text errors (413, 500) before our handler runs
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`);
      }
      const data = await res.json() as { result?: GeneratedContent; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Processing failed');
      if (!data.result) throw new Error('No result returned from server');
      return data.result;
    });

    setProcessingPromise(promise);
    setStep('processing');
  };

  const handleDemoMode = () => {
    setBrief({
      eventName: 'TechSummit 2026', brandName: 'Acme Corp', eventType: 'Corporate Conference',
      instagramType: 'post' as const,
      location: 'Mumbai, India', date: '2026-04-15',
      keyHighlights: '500+ attendees, AI keynote with standing ovation, product demo, 8 partnerships formed, 94% satisfaction',
      targetAudience: 'Marketing leaders and CMOs', tone: 'professional',
    });

    const promise = fetch('/api/demo', { method: 'POST' })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`);
        }
        const data = await res.json() as { result?: GeneratedContent; error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? 'Demo failed');
        if (!data.result) throw new Error('No demo result');
        return data.result;
      });

    setProcessingPromise(promise);
    setStep('processing');
  };

  const handleComplete = (content: GeneratedContent) => {
    setResults(content);
    // Save last result so refresh doesn't wipe it
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ content, brief, savedAt: Date.now() }));
    } catch { /* storage unavailable */ }
    setStep('results');
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setStep('brief');
  };

  const handleReset = () => {
    setStep('hero');
    setAssets([]);
    setBrief(null);
    setResults(null);
    setProcessingPromise(null);
    setErrorMsg(null);
  };

  return (
    <main className="min-h-screen bg-gray-950">
      {step === 'hero' && (
        <HeroSection onStart={handleStart} onDemo={handleDemoMode} />
      )}
      {step === 'upload' && (
        <UploadStep onNext={handleAssetsReady} onBack={() => setStep('hero')} />
      )}
      {step === 'brief' && (
        <BriefStep
          assetCount={assets.length}
          onSubmit={handleBriefSubmit}
          onBack={() => setStep('upload')}
          errorMsg={errorMsg}
          onClearError={() => setErrorMsg(null)}
        />
      )}
      {step === 'processing' && processingPromise && (
        <ProcessingView
          processingPromise={processingPromise}
          onComplete={handleComplete}
          onError={handleError}
        />
      )}
      {step === 'results' && results && brief && (
        <ResultsDashboard content={results} assets={assets} brief={brief} onReset={handleReset} />
      )}
    </main>
  );
}
