import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useAIStore } from '../../stores/useAIStore';
import {
  ChevronRight, ChevronLeft, ShieldAlert, Sparkles, Wand2, BookOpen,
  User, MapPin, CheckCircle, XCircle, Lightbulb, BarChart2
} from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const RightRail: React.FC = () => {
  const { isRightRailOpen, toggleRightRail, isDistractionFree, isSplitView, activeEntityDetail, setActiveEntityDetail } = useUIStore();
  const { characters, locations, consistencyFlags, resolveFlag, ignoreFlag } = useProjectStore();
  const { setIsAnalysisOpen } = useAIStore();
  const [activeRightTab, setActiveRightTab] = useState<'feed' | 'consistency' | 'tools'>('feed');

  if (isDistractionFree || isSplitView) return null;

  const selectedCharacter = activeEntityDetail?.type === 'character' ? characters.find((c) => c.id === activeEntityDetail.id) : null;
  const selectedLocation = activeEntityDetail?.type === 'location' ? locations.find((l) => l.id === activeEntityDetail.id) : null;
  const openFlags = consistencyFlags.filter((f) => f.status === 'open');

  return (
    <GlassSurface
      width={isRightRailOpen ? 320 : 64}
      height="100%"
      borderRadius={20}
      className="flex flex-col h-full z-20 transition-all duration-300 ease-expo-out shadow-2xl transform-gpu will-change-[width]"
    >
      <div className="flex flex-col h-full w-full">
        {/* Toggle button — inside the liquid glass block */}
        <div className={`p-2.5 flex w-full ${isRightRailOpen ? 'justify-start' : 'justify-center'}`}>
          <GlassSurface borderRadius={12} width="auto" height="auto">
            <button
              onClick={toggleRightRail}
              className="p-1.5 text-aurora-400 hover:bg-aurora-500/10 transition-all"
            >
              {isRightRailOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </GlassSurface>
        </div>

      {!isRightRailOpen ? (
        <div className="flex flex-col items-center py-4 gap-5 text-slate-400">
          <button onClick={() => { toggleRightRail(); setActiveRightTab('feed'); }} title="Story Bible Feed" className="hover:text-aurora-400 transition-all p-2 rounded-xl hover:bg-aurora-500/10"><BookOpen className="w-4 h-4" /></button>
          <button onClick={() => { toggleRightRail(); setActiveRightTab('consistency'); }} title="Consistency Flags" className="transition-all p-2 rounded-xl hover:bg-aurora-500/10"><ShieldAlert className={`w-4 h-4 ${openFlags.length > 0 ? 'text-rose-500' : 'hover:text-aurora-400'}`} /></button>
          <button onClick={() => { toggleRightRail(); setActiveRightTab('tools'); }} title="AI Analysis Tools" className="hover:text-aurora-400 transition-all p-2 rounded-xl hover:bg-aurora-500/10"><Wand2 className="w-4 h-4 text-aurora-300" /></button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-aurora-500/10 bg-obsidian-950/40 p-1.5 gap-1">
            {(['feed', 'consistency', 'tools'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveRightTab(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl text-center transition-all ${
                  activeRightTab === tab ? 'bg-aurora-500/20 text-aurora-300 border border-aurora-500/30 shadow-glow-sm' : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}>
                {tab === 'feed' ? 'Story Bible' : tab === 'consistency' ? (
                  <span className="flex items-center justify-center gap-1">Audit{openFlags.length > 0 && <span className="bg-rose-500/20 text-rose-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono border border-rose-500/30">{openFlags.length}</span>}</span>
                ) : (
                  <span className="flex items-center justify-center gap-1"><Wand2 className="w-3.5 h-3.5 text-aurora-300" /> AI Tools</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar w-full">
            {(selectedCharacter || selectedLocation) && (
              <GlassSurface borderRadius={16} width="100%" height="auto" className="p-3 relative w-full">
                <button onClick={() => setActiveEntityDetail(null)} className="absolute top-2 right-2 text-slate-400 hover:text-aurora-400 text-xs transition-all">Clear</button>
                {selectedCharacter && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-aurora-400"><User className="w-4 h-4" /><span className="font-bold text-sm">{selectedCharacter.name}</span></div>
                    <div className="text-[10px] text-aurora-300 font-mono uppercase mb-2">{selectedCharacter.occupation}</div>
                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">"{selectedCharacter.appearance}"</p>
                  </div>
                )}
                {selectedLocation && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-aurora-400"><MapPin className="w-4 h-4" /><span className="font-bold text-sm">{selectedLocation.name}</span></div>
                    <p className="text-xs text-slate-300 leading-relaxed">"{selectedLocation.description}"</p>
                  </div>
                )}
              </GlassSurface>
            )}

            {activeRightTab === 'consistency' && openFlags.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm italic font-serif">
                <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-3" />
                No open consistency flags.
              </div>
            )}

            {activeRightTab === 'consistency' && openFlags.map((flag) => (
              <GlassSurface key={flag.id} borderRadius={16} width="100%" height="auto" className="p-3 flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider"><span>{flag.type} Conflict</span><span className="text-[10px] font-mono text-slate-500">{new Date(flag.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <p className="text-xs text-slate-300 leading-relaxed">{flag.description}</p>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => ignoreFlag(flag.id)} className="px-2.5 py-1 bg-obsidian-800/40 border border-slate-500/20 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-all"><XCircle className="w-3 h-3" /> Ignore</button>
                  <button onClick={() => resolveFlag(flag.id)} className="px-2.5 py-1 bg-aurora-500/15 border border-aurora-500/30 rounded-lg text-[11px] text-aurora-300 hover:bg-aurora-500/25 flex items-center gap-1 font-semibold transition-all"><CheckCircle className="w-3 h-3" /> Resolve</button>
                </div>
              </GlassSurface>
            ))}

            {activeRightTab === 'feed' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-aurora-400 font-serif font-semibold border-b border-aurora-500/10 pb-1.5">
                  <span>Auto-Extracted Entities</span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-glow" />Live</span>
                </div>
                <div className="space-y-2">
                  {characters.map((c) => (
                    <GlassSurface key={c.id} borderRadius={16} width="100%" height="auto">
                      <div onClick={() => setActiveEntityDetail({ type: 'character', id: c.id })} className="p-2.5 cursor-pointer w-full">
                        <div className="flex items-center justify-between"><span className="font-serif text-xs font-bold text-slate-200">{c.name}</span><span className="text-[10px] text-aurora-400 font-mono">Character</span></div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.description}</p>
                      </div>
                    </GlassSurface>
                  ))}
                  {locations.map((l) => (
                    <GlassSurface key={l.id} borderRadius={16} width="100%" height="auto">
                      <div onClick={() => setActiveEntityDetail({ type: 'location', id: l.id })} className="p-2.5 cursor-pointer w-full">
                        <div className="flex items-center justify-between"><span className="font-serif text-xs font-bold text-slate-200">{l.name}</span><span className="text-[10px] text-teal-400 font-mono">Location</span></div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{l.atmosphere}</p>
                      </div>
                    </GlassSurface>
                  ))}
                </div>
              </div>
            )}

            {activeRightTab === 'consistency' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-rose-400 font-serif font-semibold border-b border-rose-500/15 pb-1.5"><span>Consistency Warnings</span><span className="text-[10px] text-slate-500 font-mono">{openFlags.length} Open</span></div>
                {openFlags.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 italic">No continuity contradictions detected.</div>
                ) : openFlags.map((flag) => (
                  <GlassSurface key={flag.id} borderRadius={16} className="border-rose-500/20 p-3 space-y-2 w-full" width="100%" height="auto">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider"><span>{flag.type} Conflict</span><span className="text-[10px] font-mono text-slate-500">{new Date(flag.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <p className="text-xs text-slate-300 leading-relaxed">{flag.description}</p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => ignoreFlag(flag.id)} className="px-2.5 py-1 bg-obsidian-800/40 border border-slate-500/20 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-all"><XCircle className="w-3 h-3" /> Ignore</button>
                      <button onClick={() => resolveFlag(flag.id)} className="px-2.5 py-1 bg-aurora-500/15 border border-aurora-500/30 rounded-lg text-[11px] text-aurora-300 hover:bg-aurora-500/25 flex items-center gap-1 font-semibold transition-all"><CheckCircle className="w-3 h-3" /> Resolve</button>
                    </div>
                  </GlassSurface>
                ))}
              </div>
            )}

            {activeRightTab === 'tools' && (
              <div className="space-y-3">
                <div className="text-xs text-aurora-400 font-serif font-semibold border-b border-aurora-500/10 pb-1.5">Script Analysis & Brainstorming</div>
                <div className="space-y-2">
                  {[{ label: 'Pacing & Tension Curve', icon: <BarChart2 className="w-3.5 h-3.5 text-aurora-400" />, type: 'Pacing' },
                    { label: 'Dialogue Quality Audit', icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" />, type: 'Dialogue Quality' },
                    { label: 'Brainstorm Plot Twists', icon: <Lightbulb className="w-3.5 h-3.5 text-aurora-400" />, type: 'Plot Twists' },
                    { label: 'World-Building Expansion', icon: <BookOpen className="w-3.5 h-3.5 text-teal-400" />, type: 'World Building' },
                  ].map((tool) => (
                    <GlassSurface key={tool.type} borderRadius={16} width="100%" height="auto">
                      <button onClick={() => setIsAnalysisOpen(true, tool.type as any)} className="w-full text-left p-3 flex items-center justify-between text-xs font-medium text-slate-200 cursor-pointer">
                        <span className="flex items-center gap-2">{tool.icon}{tool.label}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-aurora-400" />
                      </button>
                    </GlassSurface>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </GlassSurface>
  );
};
