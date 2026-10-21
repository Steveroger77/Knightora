import React, { useState } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useAIStore } from '../../stores/useAIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { invokeEdgeFunction } from '../../lib/supabase';
import { Editor } from '@tiptap/react';
import {
  Feather,
  Sparkles,
  RefreshCw,
  Zap,
  Maximize2,
  Minimize2,
  MessageSquare,
  Flame,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { AIAction } from '../../types';

interface Props {
  editor: Editor | null;
}

export const TheQuillContextMenu: React.FC<Props> = ({ editor }) => {
  const { isQuillOpen, selectedText, selectionCoords, setIsQuillOpen, setDiffPreview } = useEditorStore();
  const { setAiLoading } = useAIStore();
  const { activeScript } = useProjectStore();
  const { openSplitViewWithImagePrompt } = useUIStore();

  const [selectedTone, setSelectedTone] = useState<string>('Tense');
  const [isTonePickerOpen, setIsTonePickerOpen] = useState(false);

  if (!isQuillOpen || !selectedText || !selectionCoords) return null;

  const handleAction = async (action: AIAction, customTone?: string) => {
    setAiLoading(true, `The Quill is applying ${action}...`);
    setIsQuillOpen(false);

    try {
      const result = await invokeEdgeFunction('ai-text-action', {
        scriptId: activeScript?.id,
        selectedText,
        action,
        tone: customTone || selectedTone,
      });

      setAiLoading(false);

      if (result && result.modifiedText) {
        setDiffPreview({
          isOpen: true,
          action,
          originalText: selectedText,
          modifiedText: result.modifiedText,
          onAccept: () => {},
          onReject: () => {},
        });
      }
    } catch (err) {
      setAiLoading(false);
    }
  };

  const handleGenerateImageFromSelection = async () => {
    setIsQuillOpen(false);
    setAiLoading(true, 'AI is analyzing selected text & building detailed visual scene artwork prompt...');

    try {
      const result = await invokeEdgeFunction('ai-text-action', {
        scriptId: activeScript?.id,
        selectedText,
        action: 'Make More Cinematic',
        tone: selectedTone,
      });

      setAiLoading(false);

      const enhancedPrompt = result?.modifiedText
        ? `Cinematic detailed scene artwork: ${result.modifiedText}. High detail, dramatic atmospheric lighting, photorealistic depth.`
        : `Cinematic detailed scene artwork: ${selectedText}. High detail, dramatic lighting, detailed background.`;

      openSplitViewWithImagePrompt(enhancedPrompt);
    } catch {
      setAiLoading(false);
      openSplitViewWithImagePrompt(`Cinematic detailed scene artwork: ${selectedText}`);
    }
  };

  const tones = ['Comedic', 'Dark', 'Hopeful', 'Tense', 'Melancholic', 'Whimsical'];

  return (
    <div
      style={{
        position: 'fixed',
        top: Math.max(80, selectionCoords.top - 60),
        left: Math.max(100, selectionCoords.left - 180),
      }}
      className="z-[100] glass-surface rounded-2xl shadow-2xl p-2.5 flex flex-wrap items-center gap-2 ink-bleed-reveal max-w-xl border border-aurora-500/35 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className="flex items-center gap-1 px-2 border-r border-aurora-500/20 text-aurora-300 font-serif text-xs font-bold">
        <Feather className="w-4 h-4 text-aurora-400" />
        <span>The Quill</span>
      </div>

      {/* Primary Generate Scene Artwork Action */}
      <button
        onClick={handleGenerateImageFromSelection}
        className="px-3 py-1.5 bg-gradient-to-r from-aurora-600 to-teal-500 hover:from-aurora-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-glow-sm transition cursor-pointer"
        title="AI automatically analyzes selection & generates detailed scene artwork"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Generate Scene Artwork</span>
      </button>

      <button
        onClick={() => handleAction('Rewrite')}
        className="px-2.5 py-1 bg-slate-900/60 hover:bg-aurora-500/20 hover:text-aurora-300 border border-aurora-500/20 rounded-lg text-xs text-slate-200 transition flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3 text-aurora-400" /> Rewrite
      </button>

      <button
        onClick={() => handleAction('Continue')}
        className="px-2.5 py-1 bg-slate-900/60 hover:bg-aurora-500/20 hover:text-aurora-300 border border-aurora-500/20 rounded-lg text-xs text-slate-200 transition flex items-center gap-1"
      >
        <Zap className="w-3 h-3 text-aurora-400" /> Continue
      </button>

      <button
        onClick={() => handleAction('Expand')}
        className="px-2.5 py-1 bg-slate-900/60 hover:bg-aurora-500/20 hover:text-aurora-300 border border-aurora-500/20 rounded-lg text-xs text-slate-200 transition flex items-center gap-1"
      >
        <Maximize2 className="w-3 h-3 text-aurora-400" /> Expand
      </button>

      <button
        onClick={() => handleAction('Shorten')}
        className="px-2.5 py-1 bg-slate-900/60 hover:bg-aurora-500/20 hover:text-aurora-300 border border-aurora-500/20 rounded-lg text-xs text-slate-200 transition flex items-center gap-1"
      >
        <Minimize2 className="w-3 h-3 text-aurora-400" /> Shorten
      </button>

      <button
        onClick={() => handleAction('Improve Dialogue')}
        className="px-2.5 py-1 bg-slate-900/60 hover:bg-aurora-500/20 hover:text-aurora-300 border border-aurora-500/20 rounded-lg text-xs text-slate-200 transition flex items-center gap-1"
      >
        <MessageSquare className="w-3 h-3 text-aurora-400" /> Dialogue
      </button>

      <button
        onClick={() => handleAction('Make More Cinematic')}
        className="px-2.5 py-1 bg-slate-900/60 hover:bg-aurora-500/20 hover:text-aurora-300 border border-aurora-500/20 rounded-lg text-xs text-slate-200 transition flex items-center gap-1"
      >
        <Flame className="w-3 h-3 text-aurora-400" /> Cinematic
      </button>

      {/* Tone Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsTonePickerOpen(!isTonePickerOpen)}
          className="px-2.5 py-1 bg-slate-900/60 hover:bg-aurora-500/20 border border-aurora-500/30 rounded-lg text-xs text-aurora-300 font-semibold transition flex items-center gap-1"
        >
          <Palette className="w-3 h-3" /> Tone: {selectedTone}
        </button>

        {isTonePickerOpen && (
          <div className="absolute top-full left-0 mt-1 glass-surface rounded-xl p-1.5 shadow-xl z-50 flex flex-col gap-1 w-32 bg-slate-950/95 border border-aurora-500/30">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTone(t);
                  setIsTonePickerOpen(false);
                  handleAction('Change Tone', t);
                }}
                className="text-left text-xs px-2 py-1 rounded text-slate-300 hover:bg-aurora-500/20 hover:text-aurora-300"
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
