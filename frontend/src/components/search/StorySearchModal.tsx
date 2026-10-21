import React, { useState } from 'react';
import { useAIStore } from '../../stores/useAIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { invokeEdgeFunction } from '../../lib/supabase';
import { X, Search, Sparkles, BookOpen, User, MapPin, Film } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const StorySearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useAIStore();
  const { activeProject, characters, locations, scenes } = useProjectStore();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isSearchOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await invokeEdgeFunction('story-search', {
        projectId: activeProject?.id,
        query,
        contextEntities: { characters, locations, scenes }
      });
      setIsSearching(false);
      if (res && res.answer) {
        setAnswer(res.answer);
        setCitations(res.citations || []);
      }
    } catch (err) {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <GlassSurface width="100%" height="auto" className="max-w-2xl w-full p-6 shadow-2xl relative ink-bleed-reveal">
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-4 right-4 text-stone-400 hover:text-brass-400 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-brass-400 font-serif border-b border-brass-400/20 pb-3">
          <Search className="w-5 h-5" />
          <h2 className="text-xl font-bold">Query Fictional Universe</h2>
          <span className="text-xs font-mono text-stone-400 ml-auto">Gemini 2.5 Flash RAG</span>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your story (e.g. 'What is Matteo's motivation with the sparrow?')"
              className="flex-1 bg-obsidian-950/40 backdrop-blur-md border border-brass-400/30 rounded px-4 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-brass-400 font-serif"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="wax-seal-btn px-5 py-2.5 text-xs flex items-center gap-1.5 font-bold"
            >
              <Sparkles className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
              <span>Query</span>
            </button>
          </div>
        </form>

        {answer && (
          <div className="space-y-4 pt-2 border-t border-brass-400/20">
            <div className="bg-obsidian-950/40 backdrop-blur-md p-4 rounded border border-brass-400/30 text-xs text-stone-200 leading-relaxed font-serif">
              <div className="text-brass-400 font-bold mb-1 text-[11px] font-mono uppercase tracking-wider">Answer</div>
              {answer}
            </div>

            {citations.length > 0 && (
              <div>
                <div className="text-[11px] font-mono text-stone-400 mb-1.5 uppercase tracking-wider">Source References</div>
                <div className="flex flex-wrap gap-2">
                  {citations.map((c, idx) => (
                    <span key={idx} className="bg-obsidian-950 border border-brass-400/30 text-brass-400 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 font-mono">
                      <BookOpen className="w-3 h-3" />
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </GlassSurface>
    </div>
  );
};
