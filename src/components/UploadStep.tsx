'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { MediaAsset } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onNext: (assets: MediaAsset[]) => void;
  onBack: () => void;
}

const MAX_FILES = 20;
const MAX_SIZE_MB = 10;

export default function UploadStep({ onNext, onBack }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File): Promise<MediaAsset> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          // Extract base64 from data URL
          const base64 = dataUrl.split(',')[1];
          resolve({
            id: uuidv4(),
            name: file.name,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            base64,
            mimeType: file.type,
            size: file.size,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }),
    []
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const remaining = MAX_FILES - assets.length;
      const toProcess = acceptedFiles.slice(0, remaining);

      if (acceptedFiles.length > remaining) {
        setError(`Only ${remaining} more files can be added (max ${MAX_FILES})`);
      }

      const oversized = toProcess.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
      if (oversized.length > 0) {
        setError(`${oversized.length} file(s) exceed ${MAX_SIZE_MB}MB limit and were skipped`);
      }

      const validFiles = toProcess.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024);
      const processed = await Promise.all(validFiles.map(processFile));
      setAssets((prev) => [...prev, ...processed]);
    },
    [assets.length, processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/heic': [],
    },
    maxFiles: MAX_FILES,
    disabled: assets.length >= MAX_FILES,
  });

  const removeAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold text-white">Upload Event Media</h2>
          <p className="text-gray-500 text-sm">Step 1 of 2</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500" />
          <div className="w-8 h-1 rounded-full bg-gray-700" />
          <div className="w-2 h-2 rounded-full bg-gray-700" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-white mb-2">Upload your event photos</h1>
          <p className="text-gray-400 mb-8">
            Upload up to {MAX_FILES} images. AI will score and select the best ones for each platform.
          </p>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-brand-500 bg-brand-500/10'
                : assets.length >= MAX_FILES
                ? 'border-gray-700 bg-gray-800/30 cursor-not-allowed opacity-50'
                : 'border-gray-700 hover:border-brand-500/50 hover:bg-brand-500/5'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragActive ? 'bg-brand-500/20' : 'bg-gray-800'}`}>
                <Upload className={`w-8 h-8 ${isDragActive ? 'text-brand-400' : 'text-gray-500'}`} />
              </div>
              {isDragActive ? (
                <p className="text-brand-400 font-semibold text-lg">Drop your photos here</p>
              ) : (
                <>
                  <p className="text-white font-semibold text-lg">
                    Drag & drop event photos here
                  </p>
                  <p className="text-gray-500 text-sm">
                    or click to browse · JPG, PNG, WebP · Max {MAX_SIZE_MB}MB each · Up to {MAX_FILES} files
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Asset grid */}
          {assets.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  {assets.length} photo{assets.length !== 1 ? 's' : ''} ready
                </h3>
                <button
                  onClick={() => setAssets([])}
                  className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                <AnimatePresence>
                  {assets.map((asset) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group aspect-square rounded-xl overflow-hidden bg-gray-800"
                    >
                      {asset.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`data:${asset.mimeType};base64,${asset.base64}`}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                      <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate bg-black/60 rounded px-1 py-0.5">
                          {asset.name}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Next button */}
          <div className="mt-10 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => assets.length > 0 && onNext(assets)}
              disabled={assets.length === 0}
              className={`flex items-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all ${
                assets.length > 0
                  ? 'bg-brand-600 hover:bg-brand-500 text-white glow'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {assets.length > 0 ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Continue with {assets.length} photo{assets.length !== 1 ? 's' : ''}
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                'Upload at least 1 photo to continue'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
