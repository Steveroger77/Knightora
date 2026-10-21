import React from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { ActiveTab } from '../../types';
import {
  FileText, BookOpen, Users, MapPin, Package, Film, GitBranch, Clock,
  Image as ImageIcon, ShieldAlert, StickyNote, ChevronLeft, ChevronRight, Cpu
} from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

const LeftRailComponent: React.FC = () => {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const isLeftRailOpen = useUIStore((s) => s.isLeftRailOpen);
  const toggleLeftRail = useUIStore((s) => s.toggleLeftRail);
  const isDistractionFree = useUIStore((s) => s.isDistractionFree);
  const isSplitView = useUIStore((s) => s.isSplitView);

  const charCount = useProjectStore((s) => s.characters.length);
  const locCount = useProjectStore((s) => s.locations.length);
  const propCount = useProjectStore((s) => s.props.length);
  const sceneCount = useProjectStore((s) => s.scenes.length);
  const openFlagsCount = useProjectStore((s) => s.consistencyFlags.filter((f) => f.status === 'open').length);

  if (isDistractionFree) return null;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'script', label: 'Screenplay Editor', icon: <FileText className="w-4 h-4" /> },
    { id: 'story-bible', label: 'Story Bible Feed', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'characters', label: 'Characters', icon: <Users className="w-4 h-4" />, badge: charCount },
    { id: 'locations', label: 'Locations', icon: <MapPin className="w-4 h-4" />, badge: locCount },
    { id: 'props', label: 'Props', icon: <Package className="w-4 h-4" />, badge: propCount },
    { id: 'scenes', label: 'Scene Index', icon: <Film className="w-4 h-4" />, badge: sceneCount },
    { id: 'timeline', label: 'Timeline Scrubber', icon: <Clock className="w-4 h-4" /> },
    { id: 'relationships', label: 'Relationship Graph', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'images', label: 'Artwork Studio', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'consistency', label: 'Consistency Audit', icon: <ShieldAlert className="w-4 h-4" />, badge: openFlagsCount },
    { id: 'notes', label: 'Notes & Pins', icon: <StickyNote className="w-4 h-4" /> },
    { id: 'api-hub', label: 'API Hub', icon: <Cpu className="w-4 h-4 text-aurora-400" /> },
  ];

  return (
    <GlassSurface
      width={isLeftRailOpen ? 256 : 64}
      height="100%"
      borderRadius={20}
      className="flex flex-col h-full z-20 transition-all duration-300 ease-expo-out shadow-2xl transform-gpu will-change-[width]"
    >
      <div className="flex flex-col h-full w-full">
        <div className={`p-2.5 flex w-full ${isLeftRailOpen ? 'justify-end' : 'justify-center'}`}>
          <GlassSurface borderRadius={12} width="auto" height="auto">
            <button onClick={toggleLeftRail} className="p-1.5 text-aurora-400 hover:bg-aurora-500/10 transition-all cursor-pointer">
              {isLeftRailOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </GlassSurface>
        </div>
        
        <div className="flex-1 py-4 space-y-0.5 overflow-y-auto px-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative mb-0.5">
                {isActive && (
                  <div className="absolute inset-0 bg-aurora-500/10 rounded-xl pointer-events-none" />
                )}
                <button onClick={() => setActiveTab(item.id)}
                  className={`relative z-10 w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                    isActive ? 'text-aurora-300 border border-aurora-500/25 shadow-glow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-700/40 border border-transparent'
                  }`} title={item.label}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`transition-all ${isActive ? 'text-aurora-400 drop-shadow-[0_0_6px_rgba(124,106,237,0.4)]' : 'text-slate-400 group-hover:text-aurora-400'}`}>{item.icon}</span>
                    {isLeftRailOpen && <span className="truncate font-sans">{item.label}</span>}
                  </div>
                  {isLeftRailOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${
                      item.id === 'consistency' && item.badge > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-aurora-500/10 text-aurora-400 border border-aurora-500/20'
                    }`}>{item.badge}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="sprocket-divider mx-3 my-1" />

        {isLeftRailOpen && (
          <div className="p-3 bg-obsidian-950/40 border-t border-aurora-500/8 text-[11px] font-mono text-slate-400">
            <div className="flex items-center justify-between">
              <span className="text-aurora-400">RAG Engine:</span>
              <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />Active</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">Story Bible Synced</div>
          </div>
        )}
      </div>
    </GlassSurface>
  );
};

export const LeftRail = React.memo(LeftRailComponent);
