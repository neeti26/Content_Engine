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

  const handleStart = () => setStep('upload');

  const handleAssetsReady = (uploadedAssets: MediaAsset[]) => {
    setAssets(uploadedAssets);
    setStep('brief');
  };

  const handleBriefSubmit = async (eventBrief: EventBrief) => {
    setBrief(eventBrief);
    setStep('processing');

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: eventBrief, assets }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to start processing');
      }

      const { jobId: id } = await res.json() as { jobId: string };
      setJobId(id);
    } catch (err) {
      console.error(err);
      alert('Failed to start processing. Please check your API key and try again.');
      setStep('brief');
    }
  };

  const handleProcessingComplete = (content: GeneratedContent) => {
    setResults(content);
    setStep('results');
  };

  const handleReset = () => {
    setStep('hero');
    setAssets([]);
    setBrief(null);
    setJobId(null);
    setResults(null);
  };

  return (
    <main className="min-h-screen">
      {step === 'hero' && <HeroSection onStart={handleStart} />}
      {step === 'upload' && (
        <UploadStep onNext={handleAssetsReady} onBack={() => setStep('hero')} />
      )}
      {step === 'brief' && (
        <BriefStep
          assetCount={assets.length}
          onSubmit={handleBriefSubmit}
          onBack={() => setStep('upload')}
        />
      )}
      {step === 'processing' && jobId && (
        <ProcessingView
          jobId={jobId}
          onComplete={handleProcessingComplete}
          onError={() => setStep('brief')}
        />
      )}
      {step === 'results' && results && brief && (
        <ResultsDashboard
          content={results}
          assets={assets}
          brief={brief}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
