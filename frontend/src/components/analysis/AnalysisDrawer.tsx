import React, { useEffect, useState } from 'react';
import { useAIStore } from '../../stores/useAIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { invokeEdgeFunction } from '../../lib/supabase';
import { X, Sparkles, Plus, FileText, StickyNote } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const AnalysisDrawer: React.FC = () => {
  const { isAnalysisOpen, activeAnalysisType, setIsAnalysisOpen } = useAIStore();
  const { activeProject, activeScript, addNote } = useProjectStore();
  const [report, setReport] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAnalysisOpen || !activeAnalysisType) return;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setReport(null);
      setIdeas([]);

      const isBrainstorm = ['Plot Twists', 'World Building', 'Alternative Endings'].includes(activeAnalysisType);
      const functionName = isBrainstorm ? 'ai-brainstorm' : 'ai-analyze';

      try {
        const res = await invokeEdgeFunction(functionName, {
          projectId: activeProject?.id,
          analysisType: activeAnalysisType,
          brainstormType: activeAnalysisType,
          scriptText: 'EXT. GRAND CANAL - VENICE - NIGHT\nFog thick as spilled milk rolls off the dark lagoon...',
        });

        setIsLoading(false);
        if (res) {
          if (res.report) setReport(res.report);
          if (res.ideas) setIdeas(res.ideas);
        }
      } catch (err) {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [isAnalysisOpen, activeAnalysisType]);

  if (!isAnalysisOpen || !activeAnalysisType) return null;

  return (
    <GlassSurface width="24rem" height="100vh" className="fixed inset-y-0 right-0 z-50 p-6 shadow-2xl flex flex-col ink-bleed-reveal !rounded-none !border-y-0 !border-r-0 border-l border-brass-400/40">
      <div className="flex flex-col h-full w-full relative">
      <div className="flex items-center justify-between border-b border-brass-400/20 pb-3 mb-4">
        <div className="flex items-center gap-2 text-brass-400 font-serif font-bold text-base">
          <Sparkles className="w-4 h-4" />
          <span>{activeAnalysisType}</span>
        </div>
        <button onClick={() => setIsAnalysisOpen(false)} className="text-stone-400 hover:text-brass-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <Sparkles className="w-6 h-6 text-brass-400 animate-spin" />
            <span className="text-xs font-mono text-stone-400">Analyzing story arc...</span>
          </div>
        ) : (
          <>
            {report && (
              <GlassSurface width="100%" height="auto" className="p-4 border-brass-400/30 text-xs text-stone-200 leading-relaxed font-sans whitespace-pre-line">
                {report}
              </GlassSurface>
            )}

            {ideas.length > 0 && (
              <div className="space-y-3">
                {ideas.map((idea, idx) => (
                  <GlassSurface key={idx} width="100%" height="auto" className="p-3.5 border-brass-400/30 space-y-2">
                    <p className="text-xs text-stone-200 leading-relaxed italic">"{idea}"</p>
                    <div className="flex justify-end gap-2 pt-1 border-t border-brass-400/15">
                      <button
                        onClick={() => {
                          addNote('project', activeProject?.id || '', idea);
                        }}
                        className="px-2.5 py-1 bg-obsidian-900 border border-brass-400/30 rounded text-[11px] text-brass-400 hover:bg-brass-400/10 flex items-center gap-1 font-mono"
                      >
                        <StickyNote className="w-3 h-3" /> Save to Notes
                      </button>
                    </div>
                  </GlassSurface>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </GlassSurface>
  );
};
