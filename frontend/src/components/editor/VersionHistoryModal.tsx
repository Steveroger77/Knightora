import React, { useState } from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { X, History, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const VersionHistoryModal: React.FC = () => {
  const { isVersionHistoryOpen, setIsVersionHistoryOpen } = useEditorStore();
  const { activeScript, updateScriptContent } = useProjectStore();
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(0);
  const [restoredMessage, setRestoredMessage] = useState(false);

  if (!isVersionHistoryOpen) return null;

  const mockVersions = [
    {
      label: 'Autosave Snapshot (Current Version)',
      timestamp: 'Just now',
      wordCount: activeScript?.wordCount || 1450,
      preview: 'INT. VALENTI CLOCKWORK WORKSHOP - NIGHT\n\nBrass gears line velvet trays. MATTEO VALENTI turns an obsidian screw into the chest cavity of a mechanical sparrow.',
    },
    {
      label: 'After Scene 2 Dialogue Polish',
      timestamp: '15 minutes ago',
      wordCount: Math.max(100, (activeScript?.wordCount || 1450) - 40),
      preview: 'INT. VALENTI CLOCKWORK WORKSHOP - NIGHT\n\nMATTEO:\nIf the Doge discovers the astrolabe, Venice will burn before morning.\n\nELENA:\nThen let it burn. We leave by midnight gondola.',
    },
    {
      label: 'AI Story Bible Auto-Extraction Checkpoint',
      timestamp: '1 hour ago',
      wordCount: Math.max(100, (activeScript?.wordCount || 1450) - 170),
      preview: 'EXT. GRAND CANAL - VENICE - NIGHT\n\nFog thick as spilled milk rolls off the dark lagoon. Black gondolas sway like shadow coffins tied to wooden posts.',
    },
    {
      label: 'Initial Manuscript Draft',
      timestamp: '2 hours ago',
      wordCount: Math.max(100, (activeScript?.wordCount || 1450) - 500),
      preview: 'FADE IN:\n\nEXT. VENICE - DAY\n\nSunlight shines over the Grand Canal. Matteo Valenti walks into his clock shop.',
    },
  ];

  const currentSnapshot = mockVersions[selectedSnapshotIndex];

  const handleRestore = () => {
    setRestoredMessage(true);
    setTimeout(() => {
      setRestoredMessage(false);
      setIsVersionHistoryOpen(false);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => setIsVersionHistoryOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full">
        <GlassSurface
          borderRadius={24}
          blur={16}
          distortionScale={-10}
          className="w-full p-6 shadow-2xl relative border border-aurora-500/30"
          width="100%"
          height="auto"
        >
          <div className="bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-obsidian-950/95 backdrop-blur-xl border border-aurora-500/25 rounded-2xl p-6 shadow-2xl flex flex-col h-[520px]">
            <button
              onClick={() => setIsVersionHistoryOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-aurora-400 transition p-1.5 rounded-xl hover:bg-aurora-500/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-aurora-500/20 pb-3">
              <div className="p-2.5 rounded-xl bg-aurora-500/15 border border-aurora-500/25">
                <History className="w-5 h-5 text-aurora-300" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-100">Manuscript Version History</h2>
                <p className="text-xs text-slate-400 font-mono">Automated snapshots & story checkpoints for {activeScript?.title || 'Current Manuscript'}</p>
              </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden my-2">
              {/* Version Snapshots Sidebar */}
              <div className="w-1/3 border-r border-aurora-500/20 pr-3 overflow-y-auto custom-scrollbar space-y-2">
                {mockVersions.map((v, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedSnapshotIndex(idx)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedSnapshotIndex === idx
                        ? 'bg-aurora-500/25 border-aurora-500/40 text-aurora-300 font-semibold shadow-glow-sm'
                        : 'glass-surface border-aurora-500/15 text-slate-300 hover:border-aurora-500/30'
                    }`}
                  >
                    <div className="text-slate-100 font-medium truncate">{v.label}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-aurora-400" />{v.timestamp}</span>
                      <span className="text-teal-400">{v.wordCount} words</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Snapshot Content Preview */}
              <div className="flex-1 glass-surface p-4 rounded-xl border border-aurora-500/20 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-aurora-300 border-b border-aurora-500/20 pb-2 mb-3 flex items-center justify-between">
                    <span>Snapshot Preview: {currentSnapshot.label}</span>
                    <span className="text-teal-400 font-normal">{currentSnapshot.timestamp}</span>
                  </div>
                  <div className="font-serif text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {currentSnapshot.preview}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-aurora-500/20 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                {restoredMessage ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold animate-pulse">
                    <CheckCircle2 className="w-4 h-4" /> Snapshot restored to manuscript!
                  </span>
                ) : (
                  <span>Click 'Restore Snapshot' to roll back to this version.</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsVersionHistoryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="glass-btn px-5 py-2 text-xs flex items-center gap-1.5 font-bold cursor-pointer shadow-glow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Snapshot
                </button>
              </div>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};
