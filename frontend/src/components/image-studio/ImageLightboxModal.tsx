import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GeneratedImage } from '../../types';
import { X, Download, Maximize2, Minimize2, Sparkles, Copy, Check } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

interface Props {
  image: GeneratedImage | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<Props> = ({ image, onClose }) => {
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'f' || e.key === 'F') setIsCinemaMode((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `${(image.stylePreset || 'artwork').toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!image.prompt) return;
    navigator.clipboard.writeText(image.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-3xl p-4 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Floating Controls Bar */}
      <div
        className="w-full flex items-center justify-between z-30 px-2 sm:px-4 shrink-0 transition-opacity duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-aurora-500/20 border border-aurora-500/40 flex items-center justify-center text-aurora-300 shadow-glow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-wide">
              {image.stylePreset || 'AI Generative Artwork'}
            </h3>
            <span className="text-[11px] text-aurora-400/90 font-mono">Full Resolution Cinema View</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cinema / Pure Image Toggle */}
          <button
            onClick={() => setIsCinemaMode(!isCinemaMode)}
            className="p-2 rounded-xl bg-obsidian-900/80 hover:bg-aurora-500/20 border border-slate-700/60 hover:border-aurora-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isCinemaMode ? 'Show Artwork Info' : 'Cinema Pure View (Hide Info)'}
          >
            {isCinemaMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Download High-Res */}
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-aurora-500 to-teal-500 hover:from-aurora-400 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-obsidian-900/90 hover:bg-rose-500/30 border border-slate-700/60 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 flex items-center justify-center w-full max-w-6xl my-auto py-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.imageUrl}
          alt={image.prompt}
          className={`max-w-full object-contain rounded-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300 ${
            isCinemaMode ? 'max-h-[88vh]' : 'max-h-[68vh] sm:max-h-[72vh]'
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallbackSeed = Math.floor(Math.random() * 899999) + 100000;
            const cleanAlt = (image.prompt || 'Cinematic story scene').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanAlt)}?seed=${fallbackSeed}&width=1024&height=576&nologo=true`;
            if (target.src !== fallbackUrl) {
              target.src = fallbackUrl;
            }
          }}
        />
      </div>

      {/* Artwork Info & Prompt Banner (Collapsible in Cinema Mode) */}
      {!isCinemaMode && (
        <div
          className="w-full max-w-4xl shrink-0 z-30 transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={18}
            borderWidth={1}
            blur={20}
            brightness={40}
            opacity={0.92}
            className="p-3.5 sm:p-4 border-aurora-500/30 text-xs text-stone-200 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-serif italic text-xs sm:text-sm text-stone-100 leading-relaxed line-clamp-2">
                "{image.prompt}"
              </p>
              <button
                onClick={handleCopyPrompt}
                className="p-1.5 rounded-lg bg-obsidian-900/60 hover:bg-aurora-500/20 text-slate-400 hover:text-aurora-300 border border-slate-700/50 transition-all shrink-0 cursor-pointer"
                title="Copy Prompt"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-aurora-400 pt-2.5 mt-2 border-t border-aurora-500/20">
              <span>Preset: <strong className="text-white">{image.stylePreset || 'Cinematic'}</strong></span>
              <span>Aspect: <strong className="text-white">{image.aspectRatio || '16:9'}</strong></span>
              <span>Camera: <strong className="text-white">{image.cameraAngle || 'Medium Shot'}</strong></span>
              <span>Lighting: <strong className="text-white">{image.lighting || 'Cinematic'}</strong></span>
              <span className="ml-auto text-slate-400">{new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </GlassSurface>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
