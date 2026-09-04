'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { EventBrief, MediaAsset, GeneratedContent } from '@/types';
import { BrandKit } from '@/lib/supabase';
import HeroSection from '@/components/HeroSection';
import UploadStep from '@/components/UploadStep';
import BriefStep from '@/components/BriefStep';
import ProcessingView from '@/components/ProcessingView';
import ResultsDashboard from '@/components/ResultsDashboard';
import HistoryPanel from '@/components/HistoryPanel';
import OnboardingModal from '@/components/OnboardingModal';
import Logo from '@/components/Logo';
import { History, LogOut, User } from 'lucide-react';

type AppStep = 'hero' | 'upload' | 'brief' | 'processing' | 'results';

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser();

  const [step, setStep]                         = useState<AppStep>('hero');
  const [assets, setAssets]                     = useState<MediaAsset[]>([]);
  const [brief, setBrief]                       = useState<EventBrief | null>(null);
  const [results, setResults]                   = useState<GeneratedContent | null>(null);
  const [processingPromise, setProcessingPromise] = useState<Promise<GeneratedContent> | null>(null);
  const [errorMsg, setErrorMsg]                 = useState<string | null>(null);
  const [showHistory, setShowHistory]           = useState(false);
  const [showOnboarding, setShowOnboarding]     = useState(false);
  const [brandKit, setBrandKit]                 = useState<BrandKit | null>(null);

  // Load brand kit + check if first-time user
  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/brand-kit')
      .then(r => r.json())
      .then(d => {
        if (d.brandKit) {
          setBrandKit(d.brandKit);
        } else {
          // First-time user — show onboarding after a short delay
          setTimeout(() => setShowOnboarding(true), 800);
        }
      })
      .catch(() => {});
  }, [isSignedIn]);

  const handleStart = () => setStep('upload');
  const handleAssetsReady = (a: MediaAsset[]) => { setAssets(a); setStep('brief'); };

  const handleBriefSubmit = (eventBrief: EventBrief) => {
    setBrief(eventBrief);
    setErrorMsg(null);

    const apiAssets = assets.map(({ base64: _display, apiBase64, thumbnailBase64: _thumb, ...rest }) => ({
      ...rest,
      base64: apiBase64 ?? _display,
      mimeType: rest.mimeType,
    }));

    const promise = fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: eventBrief, assets: apiAssets }),
    }).then(async (res) => {
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

  const handleComplete = useCallback(async (content: GeneratedContent) => {
    setResults(content);
    setStep('results');

    // Save to Supabase if user is signed in
    if (isSignedIn && brief) {
      try {
        await fetch('/api/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brief, content, assetCount: assets.length }),
        });
      } catch (e) {
        console.warn('[History] Failed to save generation:', e);
      }
    }
  }, [isSignedIn, brief, assets.length]);

  const handleError = (msg: string) => { setErrorMsg(msg); setStep('brief'); };

  const handleReset = () => {
    setStep('hero');
    setAssets([]);
    setBrief(null);
    setResults(null);
    setProcessingPromise(null);
    setErrorMsg(null);
  };

  const handleBrandKitSave = async (kit: Partial<BrandKit>) => {
    try {
      const res = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kit),
      });
      const data = await res.json() as { brandKit: BrandKit };
      setBrandKit(data.brandKit);
      setShowOnboarding(false);
    } catch (e) {
      console.error('[BrandKit] Save failed:', e);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090f' }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Floating user bar — shown when signed in and not on hero */}
      {isSignedIn && step !== 'hero' && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-black/60 backdrop-blur border border-white/10 px-3 py-2 rounded-xl transition-all"
          >
            <History className="w-3.5 h-3.5" />
            History
          </button>
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur border border-white/10 px-3 py-2 rounded-xl">
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-white/60 max-w-[120px] truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            <SignOutButton>
              <button className="text-white/30 hover:text-red-400 transition-colors ml-1">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </SignOutButton>
          </div>
        </div>
      )}

      {step === 'hero' && (
        <HeroSection
          onStart={handleStart}
          onDemo={handleDemoMode}
          isSignedIn={!!isSignedIn}
          userEmail={user?.primaryEmailAddress?.emailAddress}
          onShowHistory={() => setShowHistory(true)}
          onSignOut={() => {}}
        />
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
          brandKit={brandKit}
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

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          onClose={() => setShowHistory(false)}
          onSelect={(gen) => {
            setBrief({
              eventName:      gen.event_name,
              brandName:      gen.brand_name,
              eventType:      gen.event_type ?? '',
              location:       gen.location   ?? '',
              date:           gen.date       ?? '',
              keyHighlights:  gen.key_highlights ?? '',
              targetAudience: '',
              tone:           'professional',
              instagramType:  (gen.instagram_type as 'post' | 'reel') ?? 'post',
            });
            setResults(gen.content as unknown as GeneratedContent);
            setAssets([]);
            setShowHistory(false);
            setStep('results');
          }}
        />
      )}

      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingModal
          onSave={handleBrandKitSave}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </main>
  );
}
