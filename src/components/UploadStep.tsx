'use client';

import { useState, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, ArrowRight, ArrowLeft, AlertCircle, Film } from 'lucide-react';
import { MediaAsset } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Props { onNext: (assets: MediaAsset[]) => void; onBack: () => void; }

const MAX = 20;
const MAX_IMAGE_MB = 15;
const MAX_VIDEO_MB = 100;

// Compress image for API transmission — small enough to stay under Vercel's 4.5MB limit.
// Original full-quality base64 stays in client state for display only.
function compressForAPI(
  base64: string,
  mimeType: string,
  maxDimension = 800,
  quality = 0.72
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
        else { width = Math.round((width * maxDimension) / height); height = maxDimension; }
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      const outMime = 'image/jpeg';
      const dataUrl = canvas.toDataURL(outMime, quality);
      resolve({ base64: dataUrl.split(',')[1], mimeType: outMime });
    };
    img.onerror = reject;
    img.src = `data:${mimeType};base64,${base64}`;
  });
}
// Compress image to display quality (stored in client state for preview)
function compressImage(file: Blob, maxDimension = 1920, quality = 0.85): Promise<{ base64: string; mimeType: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
          else { width = Math.round((width * maxDimension) / height); height = maxDimension; }
        }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType: outputMime, size: Math.round(base64.length * 0.75) });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract first frame from video as JPEG thumbnail for scoring + preview
function extractVideoThumbnail(file: File): Promise<{ thumbnailBase64: string; thumbnailMime: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;
    video.onloadeddata = () => {
      video.currentTime = 1; // seek to 1s for a more representative frame
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      // Cap thumbnail at 960px for Gemini inline data limit
      const maxDim = 960;
      let w = video.videoWidth, h = video.videoHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
        else { w = Math.round((w * maxDim) / h); h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(video, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve({ thumbnailBase64: dataUrl.split(',')[1], thumbnailMime: 'image/jpeg' });
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load video')); };
  });
}

// Read video as base64 (for Gemini inline data — capped at 15MB after base64)
function readVideoAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── HEIC / HEIF ─────────────────────────────────────────────────────────────
// iPhone photos are HEIC and Chrome cannot decode them. Convert them in the
// browser instead of silently dropping the file.
const HEIC_EXT = /\.(heic|heif)$/i;

function isHeic(file: File): boolean {
  return HEIC_EXT.test(file.name) || /image\/hei[cf]/i.test(file.type);
}

async function convertHeic(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default;
  const converted = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  });
  const result = Array.isArray(converted) ? converted[0] : converted;
  return result as Blob;
}

export default function UploadStep({ onNext, onBack }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const processFile = useCallback(async (file: File): Promise<MediaAsset> => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(file.name);

    if (isVideo) {
      const thumbnailResult = await extractVideoThumbnail(file);
      // For videos: don't send full video to API — use thumbnail for scoring
      return {
        id: uuidv4(),
        name: file.name,
        type: 'video',
        base64: thumbnailResult.thumbnailBase64, // display uses thumbnail too
        apiBase64: thumbnailResult.thumbnailBase64,
        mimeType: 'image/jpeg',
        size: file.size,
        thumbnailBase64: thumbnailResult.thumbnailBase64,
      };
    } else {
      // HEIC/HEIF photos have to be converted before the browser can read them
      let source: Blob = file;
      if (isHeic(file)) {
        source = await convertHeic(file);
      }
      const { base64, mimeType, size } = await compressImage(source);
      // Produce a smaller copy for the API payload (~800px, q0.72 → ~30-80KB)
      const api = await compressForAPI(base64, mimeType);
      return { id: uuidv4(), name: file.name, type: 'image', base64, mimeType, size, apiBase64: api.base64 };
    }
  }, []);

  const onDrop = useCallback(async (accepted: File[], rejections: FileRejection[]) => {
    setError(null);
    const remaining = MAX - assets.length;
    const toProcess = accepted.slice(0, remaining);
    if (accepted.length > remaining) setError(`Max ${MAX} files — only ${remaining} more allowed`);

    // Files the dropzone refused — say so, never drop them silently
    if (rejections.length > 0) {
      const names = rejections.map(r => r.file.name).slice(0, 3).join(', ');
      setError(
        `${rejections.length} file(s) skipped (${names}${rejections.length > 3 ? '…' : ''}) — only JPG, PNG, WebP, HEIC photos and MP4/MOV videos are supported.`
      );
    }

    const valid: File[] = [];
    const failed: string[] = [];
    for (const f of toProcess) {
      const isVideo = f.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(f.name);
      const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (f.size > maxMb * 1024 * 1024) {
        setError(`"${f.name}" exceeds ${maxMb}MB limit and was skipped`);
      } else {
        valid.push(f);
      }
    }

    setCompressing(true);
    const processed: MediaAsset[] = [];
    for (const f of valid) {
      try {
        processed.push(await processFile(f));
      } catch (err) {
        failed.push(f.name);
        console.error('[Upload] Could not process', f.name, err);
      }
    }
    setAssets(prev => [...prev, ...processed]);
    if (failed.length > 0) {
      setError(
        `Could not read ${failed.length} file(s): ${failed.slice(0, 3).join(', ')}${failed.length > 3 ? '…' : ''}. Try exporting them as JPG.`
      );
    }
    setCompressing(false);
  }, [assets.length, processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Real-world camera files: the extensions are listed as well, because
    // Windows often reports no MIME type at all and the file would otherwise
    // be dropped without a word.
    accept: {
      'image/jpeg':  ['.jpg', '.jpeg'],
      'image/png':   ['.png'],
      'image/webp':  ['.webp'],
      'image/avif':  ['.avif'],
      'image/heic':  ['.heic', '.heif'],
      'image/heif':  ['.heic', '.heif'],
      'image/bmp':   ['.bmp'],
      'image/*':     [],
      'video/mp4':        ['.mp4', '.m4v'],
      'video/quicktime':  ['.mov', '.qt'],
      'video/webm':       ['.webm'],
      'video/x-matroska': ['.mkv'],
      'video/avi':        ['.avi'],
      'video/*':          [],
    },
    disabled: assets.length >= MAX,
  });

  const imageCount = assets.filter(a => a.type === 'image').length;
  const videoCount = assets.filter(a => a.type === 'video').length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #09090f 0%, #0f0f1a 100%)' }}>
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-bold text-white text-sm">Upload Media</h2>
          <p className="text-white/30 text-xs">Step 1 of 2 · Photos &amp; Videos</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-indigo-500" />
          <div className="w-6 h-1.5 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-1">Upload your event media</h1>
          <p className="text-white/40 text-sm mb-8">
            Add photos and/or a video clip. AI scores every image and uses your video context for Reel scripts.
          </p>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-indigo-500 bg-indigo-500/8' : 'border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/4'}
              ${compressing ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isDragActive ? 'bg-indigo-500/20' : 'glass'}`}>
                {compressing
                  ? <div className="w-7 h-7 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                  : <Upload className={`w-7 h-7 ${isDragActive ? 'text-indigo-400' : 'text-white/30'}`} />
                }
              </div>
              {compressing
                ? <p className="text-indigo-400 font-bold text-lg">Processing media...</p>
                : isDragActive
                ? <p className="text-indigo-400 font-bold text-lg">Drop here</p>
                : (
                  <>
                    <p className="text-white font-bold text-lg">Drag &amp; drop photos or videos</p>
                    <div className="flex items-center gap-4 text-white/30 text-sm">
                      <span>📸 JPG, PNG, WebP · max {MAX_IMAGE_MB}MB</span>
                      <span className="text-white/15">|</span>
                      <span>🎬 MP4, MOV, WebM · max {MAX_VIDEO_MB}MB</span>
                    </div>
                    <p className="text-white/20 text-xs">Up to {MAX} files total · images auto-compressed</p>
                  </>
                )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-amber-400 bg-amber-400/8 border border-amber-400/20 rounded-2xl px-4 py-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* File grid */}
          {assets.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-sm">{assets.length} file{assets.length !== 1 ? 's' : ''} ready</span>
                  {imageCount > 0 && <span className="text-white/30 text-xs">{imageCount} photo{imageCount !== 1 ? 's' : ''}</span>}
                  {videoCount > 0 && <span className="text-violet-400 text-xs font-semibold">{videoCount} video{videoCount !== 1 ? 's' : ''}</span>}
                </div>
                <button onClick={() => setAssets([])} className="text-white/30 hover:text-red-400 text-xs transition-colors">Clear all</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                <AnimatePresence>
                  {assets.map((a) => {
                    const thumbSrc = a.type === 'video'
                      ? (a.thumbnailBase64 ? `data:image/jpeg;base64,${a.thumbnailBase64}` : null)
                      : `data:${a.mimeType};base64,${a.base64}`;
                    return (
                      <motion.div key={a.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-white/5">
                        {thumbSrc
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={thumbSrc} alt={a.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center bg-violet-900/30"><Film className="w-6 h-6 text-violet-400" /></div>
                        }
                        {/* Video badge */}
                        {a.type === 'video' && (
                          <div className="absolute bottom-1 left-1 bg-black/70 rounded px-1 py-0.5 flex items-center gap-0.5">
                            <Film className="w-2.5 h-2.5 text-violet-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all" />
                        <button onClick={() => setAssets(p => p.filter(x => x.id !== a.id))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          <div className="mt-10 flex justify-end">
            <motion.button
              whileHover={{ scale: assets.length > 0 && !compressing ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => assets.length > 0 && !compressing && onNext(assets)}
              disabled={assets.length === 0 || compressing}
              className={`flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all
                ${assets.length > 0 && !compressing ? 'text-white glow-indigo' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
              style={assets.length > 0 && !compressing ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5)' } : {}}
            >
              {compressing
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                : assets.length > 0
                ? <><CheckCircle className="w-5 h-5" />Continue with {assets.length} file{assets.length !== 1 ? 's' : ''}<ArrowRight className="w-5 h-5" /></>
                : 'Upload at least 1 photo or video'
              }
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
