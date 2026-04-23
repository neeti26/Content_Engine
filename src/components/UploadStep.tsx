'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { MediaAsset } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Props { onNext: (assets: MediaAsset[]) => void; onBack: () => void; }
const MAX = 20; const MAX_MB = 10;

export default function UploadStep({ onNext, onBack }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File): Promise<MediaAsset> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({ id: uuidv4(), name: file.name, type: 'image', base64: dataUrl.split(',')[1], mimeType: file.type, size: file.size });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }), []);

  const onDrop = useCallback(async (accepted: File[]) => {
    setError(null);
    const remaining = MAX - assets.length;
    const toProcess = accepted.slice(0, remaining);
    if (accepted.length > remaining) setError(`Max ${MAX} photos — only ${remaining} more allowed`);
    const valid = toProcess.filter(f => f.size <= MAX_MB * 1024 * 1024);
    if (valid.length < toProcess.length) setError(`${toProcess.length - valid.length} file(s) over ${MAX_MB}MB skipped`);
    const processed = await Promise.all(valid.map(processFile));
    setAssets(prev => [...prev, ...processed]);
  }, [assets.length, processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }, disabled: assets.length >= MAX,
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #09090f 0%, #0f0f1a 100%)' }}>
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-bold text-white text-sm">Upload Event Photos</h2>
          <p className="text-white/30 text-xs">Step 1 of 2</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-indigo-500" />
          <div className="w-6 h-1.5 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-1">Upload your event photos</h1>
          <p className="text-white/40 text-sm mb-8">AI will score every image and pick the best one for each platform automatically.</p>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-14 text-center cursor-pointer transition-all ${isDragActive ? 'border-indigo-500 bg-indigo-500/8' : 'border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/4'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? 'bg-indigo-500/20' : 'glass'}`}>
                <Upload className={`w-7 h-7 ${isDragActive ? 'text-indigo-400' : 'text-white/30'}`} />
              </div>
              {isDragActive
                ? <p className="text-indigo-400 font-bold text-lg">Drop photos here</p>
                : <>
                    <p className="text-white font-bold text-lg">Drag & drop event photos</p>
                    <p className="text-white/30 text-sm">or click to browse · JPG, PNG, WebP · max {MAX_MB}MB · up to {MAX} photos</p>
                  </>
              }
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-amber-400 bg-amber-400/8 border border-amber-400/20 rounded-2xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          {assets.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-sm">{assets.length} photo{assets.length !== 1 ? 's' : ''} ready</span>
                <button onClick={() => setAssets([])} className="text-white/30 hover:text-red-400 text-xs transition-colors">Clear all</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                <AnimatePresence>
                  {assets.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group aspect-square rounded-xl overflow-hidden bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`data:${a.mimeType};base64,${a.base64}`} alt={a.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all" />
                      <button onClick={() => setAssets(p => p.filter(x => x.id !== a.id))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          <div className="mt-10 flex justify-end">
            <motion.button whileHover={{ scale: assets.length > 0 ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}
              onClick={() => assets.length > 0 && onNext(assets)} disabled={assets.length === 0}
              className={`flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all ${assets.length > 0 ? 'text-white glow-indigo' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
              style={assets.length > 0 ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' } : {}}>
              {assets.length > 0 ? <><CheckCircle className="w-5 h-5" />Continue with {assets.length} photo{assets.length !== 1 ? 's' : ''}<ArrowRight className="w-5 h-5" /></> : 'Upload at least 1 photo'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
