import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import {
  X, Keyboard, BookOpen, Sparkles, FileText, Users, MapPin, Package, Film,
  Clock, GitBranch, Image as ImageIcon, ShieldAlert, StickyNote, Cpu, MessageSquare, Search
} from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useUIStore();
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'features'>('shortcuts');
  const [featureSearch, setFeatureSearch] = useState('');

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + \\', desc: 'Toggle Distraction-Free Full-Screen Writing Mode', category: 'Interface' },
    { key: 'Cmd/Ctrl + K', desc: 'Open Natural Language Universe Story Search', category: 'Navigation' },
    { key: 'Cmd/Ctrl + N', desc: 'Create New Screenplay / Story Project', category: 'File' },
    { key: 'Cmd/Ctrl + I', desc: 'Import Manuscript, Screenplay, or PDF File', category: 'File' },
    { key: 'Cmd/Ctrl + E', desc: 'Open Export Script & PDF Formatting Menu', category: 'File' },
    { key: 'Cmd/Ctrl + H', desc: 'Open Script Version History & Auto-Snapshots', category: 'Editing' },
    { key: 'Cmd/Ctrl + S', desc: 'Trigger Instant Autosave & Story Bible Sync', category: 'File' },
    { key: 'Tab', desc: 'Cycle Screenplay Element (Heading → Action → Character → Dialogue)', category: 'Editor' },
    { key: 'Enter', desc: 'Smart Line Transition (Character Name → Dialogue Block)', category: 'Editor' },
    { key: 'Text Selection', desc: 'Trigger "The Quill" Contextual AI Writing Assistant', category: 'AI Tools' },
    { key: 'Esc', desc: 'Close any open profile, detail drawer, or modal window', category: 'Interface' },
    { key: 'Cmd/Ctrl + /', desc: 'Show Studio Keyboard Shortcuts & Features Guide', category: 'Help' },
  ];

  const features = [
    {
      icon: <FileText className="w-4 h-4 text-aurora-400" />,
      name: 'Screenplay Editor',
      tagline: 'Professional Industry-Standard Scriptwriting',
      desc: 'Write screenplay manuscripts with auto-formatting for Scene Headings, Action, Character, Dialogue, and Parentheticals.',
      howToUse: 'Type in the editor. Press Tab to switch elements, or select any text block to trigger "The Quill" AI assistant for instant rewrites.',
    },
    {
      icon: <BookOpen className="w-4 h-4 text-teal-400" />,
      name: 'Story Bible Feed',
      tagline: 'Centralized Project Lore & Universe Database',
      desc: 'Real-time feed aggregating characters, locations, props, and scene metadata extracted directly from your manuscript.',
      howToUse: 'Click Story Bible in the sidebar to review all lore entities, search by keywords, or add custom background lore.',
    },
    {
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      name: 'Character Profiles & Consistency',
      tagline: 'Locked Visual Identity & Arc Management',
      desc: 'Stores detailed character specs including Code (CHAR_001), age, height, build, hair, eyes, attire, and personality trajectory.',
      howToUse: 'Click any character card to open their profile. Use "Generate Artwork" to render consistent visual images in different actions.',
    },
    {
      icon: <MapPin className="w-4 h-4 text-rose-400" />,
      name: 'Locations & Setting Specs',
      tagline: 'Filming Ambiance & Atmospheric Details',
      desc: 'Manages physical settings, visual lighting specs, time of day, and environmental descriptions across all scenes.',
      howToUse: 'Select Locations tab to view, edit, or generate concept art for any setting in your screenplay.',
    },
    {
      icon: <Package className="w-4 h-4 text-amber-400" />,
      name: 'Prop Catalog & Artifacts',
      tagline: 'Key Objects, Weapons & Story MacGuffins',
      desc: 'Tracks significant props, vehicles, weapons, and items carried by characters throughout the narrative.',
      howToUse: 'Browse Props to inspect item origins, associated scenes, and generate high resolution prop artwork.',
    },
    {
      icon: <Film className="w-4 h-4 text-purple-400" />,
      name: 'Scene Index & Breakdown',
      tagline: 'Chronological Script Scene Navigator',
      desc: 'Lists every scene with scene numbers, summary beats, participating character IDs, and location tagging.',
      howToUse: 'Use Scene Index to filter scenes by character presence or click "AI Analyze Scene" to enrich scene descriptions.',
    },
    {
      icon: <Clock className="w-4 h-4 text-blue-400" />,
      name: 'Timeline Scrubber',
      tagline: 'Visual Chronological Story Reel',
      desc: 'Interactive film reel scrubbing through scene progression, pacing intensity, and time-of-day transitions.',
      howToUse: 'Drag the timeline scrubber to jump directly to specific script moments and inspect character scene overlaps.',
    },
    {
      icon: <GitBranch className="w-4 h-4 text-teal-300" />,
      name: 'Relationship Graph',
      tagline: 'Interactive Character Dynamics Matrix',
      desc: 'Visual corkboard node graph mapping character links (Family, Enemy, Ally, Romantic) with smooth connecting curves.',
      howToUse: 'Drag character nodes to arrange your universe grid. Click any card to inspect full profile & relational connections.',
    },
    {
      icon: <ImageIcon className="w-4 h-4 text-pink-400" />,
      name: 'Artwork Studio',
      tagline: 'AI Image Generator with Character Locking',
      desc: 'Renders photorealistic concept art, character portraits, and scene frames powered by FLUX, Imagen 4, and SD 3.5.',
      howToUse: 'Type a visual prompt or select a character/location. Click "Generate Artwork" to render locked consistent visuals.',
    },
    {
      icon: <ShieldAlert className="w-4 h-4 text-rose-300" />,
      name: 'Consistency Audit Engine',
      tagline: 'Automated Story Logic & Continuity Scanner',
      desc: 'Scans your script for physical contradictions, broken timelines, outfit mismatches, and dead character reappearances.',
      howToUse: 'Click Consistency Audit to review flagged items and click "Auto-Resolve Flag" to apply instant AI fixes.',
    },
    {
      icon: <StickyNote className="w-4 h-4 text-amber-300" />,
      name: 'Pinned Story Notes',
      tagline: 'Realtime Pushpin Idea Board',
      desc: 'Quick pinboard for capturing instant lore thoughts, research reminders, and quick story ideas.',
      howToUse: 'Use the rounded type bar at the top to type a quick note and click "Pin Note" to save it to your board.',
    },
    {
      icon: <Cpu className="w-4 h-4 text-aurora-300" />,
      name: 'API Hub Control Center',
      tagline: 'Dynamic AI Provider & Model Management',
      desc: 'Centralized hub to connect custom API keys (OpenAI, Google, Anthropic, DeepSeek, FLUX) and assign models to features.',
      howToUse: 'Select API Hub from sidebar. Paste your API key on any model card and click "Test & Save" to enable User API mode.',
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      name: 'Skipper AI Sidekick',
      tagline: 'Interactive Narrative Assistant',
      desc: 'AI co-writer available in the right sidebar for brainstorming plot twists, writing dialogue, and analyzing scenes.',
      howToUse: 'Open the right sidebar and chat directly with Skipper. Ask questions about your story or request prose suggestions.',
    },
  ];

  const filteredFeatures = features.filter(
    (f) =>
      f.name.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.desc.toLowerCase().includes(featureSearch.toLowerCase()) ||
      f.tagline.toLowerCase().includes(featureSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => setIsShortcutsOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
        <GlassSurface
          borderRadius={24}
          blur={16}
          className="w-full p-6 shadow-2xl relative border border-aurora-500/35 bg-slate-950/95 text-slate-100 overflow-hidden flex flex-col max-h-[85vh]"
          width="100%"
          height="auto"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-aurora-300 transition p-1.5 rounded-xl hover:bg-aurora-500/10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-4 border-b border-aurora-500/20 pb-3 flex-shrink-0">
            <div className="p-2.5 rounded-xl bg-aurora-500/15 border border-aurora-500/25">
              <Keyboard className="w-6 h-6 text-aurora-400" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-100">Knightora Studio Guide</h2>
              <p className="text-xs text-slate-400 font-mono">Keyboard shortcuts & comprehensive feature walkthrough</p>
            </div>
          </div>

          {/* Toggle Tabs (Shortcuts vs Features) */}
          <div className="flex items-center gap-2 mb-4 glass-surface bg-aurora-500/10 p-1 rounded-xl border border-aurora-500/20 flex-shrink-0">
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`flex-1 py-1.5 px-3 text-xs rounded-lg font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'shortcuts'
                  ? 'bg-aurora-500/30 text-aurora-200 border border-aurora-500/40 shadow-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Keyboard Shortcuts ({shortcuts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('features')}
              className={`flex-1 py-1.5 px-3 text-xs rounded-lg font-mono font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-teal-500/30 text-teal-200 border border-teal-500/40 shadow-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Features Guide ({features.length})</span>
            </button>
          </div>

          {/* TAB 1: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {shortcuts.map((s, idx) => (
                <GlassSurface key={idx} borderRadius={14} width="100%" height="auto" className="border-aurora-500/20 bg-aurora-500/10">
                  <div className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-aurora-300 bg-aurora-500/20 px-2 py-0.5 rounded border border-aurora-500/30">{s.category}</span>
                      <span className="text-slate-200 font-medium">{s.desc}</span>
                    </div>
                    <kbd className="bg-aurora-500/20 border border-aurora-500/40 text-aurora-300 font-mono px-3 py-1 rounded-lg text-[11px] shadow-sm whitespace-nowrap font-bold">
                      {s.key}
                    </kbd>
                  </div>
                </GlassSurface>
              ))}
            </div>
          )}

          {/* TAB 2: STUDIO FEATURES GUIDE */}
          {activeTab === 'features' && (
            <div className="flex-1 flex flex-col overflow-hidden space-y-3">
              {/* Feature Search Input */}
              <div className="flex items-center gap-2 glass-surface bg-aurora-500/10 p-2 px-3 rounded-full border border-aurora-500/30 flex-shrink-0">
                <Search className="w-3.5 h-3.5 text-aurora-400" />
                <input
                  type="text"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="Search features (e.g. Screenplay, Characters, API Hub...)"
                  className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Features List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {filteredFeatures.map((f, idx) => (
                  <GlassSurface key={idx} borderRadius={16} width="100%" height="auto" className="p-4 border-aurora-500/20 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-lg space-y-2">
                    <div className="flex items-center justify-between border-b border-aurora-500/15 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-aurora-500/15 border border-aurora-500/25">
                          {f.icon}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-sm text-slate-100">{f.name}</h3>
                          <p className="text-[10px] font-mono text-aurora-300">{f.tagline}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{f.desc}</p>

                    <div className="p-2 rounded-xl bg-slate-900/60 border border-aurora-500/15 text-[11px] text-slate-300 font-mono">
                      <strong className="text-teal-300 uppercase">How to use:</strong> {f.howToUse}
                    </div>
                  </GlassSurface>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-4 pt-3 border-t border-aurora-500/15 text-center text-xs text-slate-400 italic flex-shrink-0">
            Press <kbd className="text-aurora-300 bg-aurora-500/15 px-2 py-0.5 rounded border border-aurora-500/30 font-mono not-italic font-bold">Esc</kbd> or click outside to return to studio desk.
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};
