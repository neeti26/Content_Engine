'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Film, Image, Zap, Trash2 } from 'lucide-react';
import { Generation } from '@/lib/supabase';

interface Props {
  onClose: () => void;
  onSelect: (gen: Generation) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function HistoryPanel({ onClose, onSelect }: Props) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [deleting, setDeleting]       = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/generations')
      .then(r => r.json())
      .then(d => setGenerations(d.generations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await fetch(`/api/generations/${id}`, { method: 'DELETE' });
      setGenerations(prev => prev.filter(g => g.id !== id));
    } catch {}
    setDeleting(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-end"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="h-full w-full max-w-md flex flex-col border-l"
          style={{ background: 'rgba(9,9,15,0.97)', borderColor: 'rgba(167,139,250,0.15)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <h2 className="font-black text-white text-lg">Generation History</h2>
              <p className="text-white/30 text-xs mt-0.5">{generations.length} event{generations.length !== 1 ? 's' : ''} generated</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : generations.length === 0 ? (
              <div className="text-center py-20">
                <Clock className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No generations yet</p>
                <p className="text-white/20 text-xs mt-1">Your past events will appear here</p>
              </div>
            ) : (
              generations.map(gen => (
                <motion.button
                  key={gen.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelect(gen)}
                  className="w-full text-left p-4 rounded-2xl border transition-all group relative"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{gen.event_name}</p>
                      <p className="text-violet-300/60 text-xs mt-0.5 truncate">{gen.brand_name}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {gen.location && (
                          <span className="flex items-center gap-1 text-white/30 text-xs">
                            <MapPin className="w-3 h-3" />{gen.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          {gen.instagram_type === 'reel' ? <Film className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                          {gen.instagram_type === 'reel' ? 'Reel' : 'Post'}
                        </span>
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          <Zap className="w-3 h-3" />{gen.asset_count} file{gen.asset_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-white/25 text-xs">{timeAgo(gen.created_at)}</span>
                      <button
                        onClick={(e) => handleDelete(gen.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-1"
                      >
                        {deleting === gen.id
                          ? <div className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
