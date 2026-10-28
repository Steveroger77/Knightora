import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore, Mood } from '../../stores/useUIStore';
import { useAIStore } from '../../stores/useAIStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { NeuronGauge } from './NeuronGauge';
import { Shield, Search, Maximize2, Minimize2, HelpCircle, Plus, Sun, Sunset, Cloud, Moon, ChevronDown, Trash2, UploadCloud, Sparkles, User, LogOut, UserCheck, Columns, X } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const Header: React.FC = () => {
  const { projects, activeProject, setActiveProject, deleteProject, loadSampleTutorialStory } = useProjectStore();
  const { isDistractionFree, toggleDistractionFree, setIsShortcutsOpen, setIsNewProjectModalOpen, setIsImportStoryModalOpen, setIsAIStorySummaryOpen, theme, setTheme, isSplitView, toggleSplitView } = useUIStore();
  const { setIsSearchOpen } = useAIStore();
  const { currentUser, setIsProfileModalOpen, logout } = useAuthStore();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isDistractionFree) return null;

  const handleDeleteProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) return;
    if (activeProject) {
      deleteProject(activeProject.id);
      setIsProjectDropdownOpen(false);
    }
  };

  return (
    <div className="w-full h-16 relative z-30 select-none">
      {/* Liquid Glass Header Block Background */}
      <GlassSurface height={64} width="100%" borderRadius={20} className="absolute inset-0 pointer-events-none shadow-2xl" />

      {/* Header Content Layer - Clean, single-line flex alignment */}
      <div className="relative z-10 w-full h-full px-5 flex items-center justify-between overflow-visible">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border border-white/60 flex items-center justify-center shadow-[0_0_14px_rgba(255,255,255,0.4)] text-slate-900">
              <Shield className="w-5 h-5 text-slate-950 fill-slate-900/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xs tracking-wider text-slate-100 uppercase">KNIGHTORA</span>
              <span className="text-[9px] text-aurora-400 font-medium tracking-wide">Words to Worlds</span>
            </div>
          </div>
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-aurora-500/20 to-transparent" />
          
          <div className="flex items-center gap-1.5">
            {/* Custom Project / Cipher Protocol Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <GlassSurface borderRadius={12} width={190} height="auto">
                <button
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="w-full px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer flex items-center justify-between transition-all hover:border-aurora-500/40"
                >
                  <span className="truncate font-medium">{activeProject?.title || 'Select Project'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-aurora-400 transition-transform duration-300 ml-1 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </GlassSurface>

              {isProjectDropdownOpen && (
                <div className="absolute top-full left-0 w-64 mt-2 z-50 animate-in fade-in duration-150">
                  <GlassSurface borderRadius={16} blur={12} distortionScale={-10} width="100%" height="auto">
                    <div className="bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-obsidian-950/95 backdrop-blur-xl border border-aurora-500/30 rounded-2xl p-2 shadow-2xl">
                      <div className="text-[10px] font-mono text-aurora-400 uppercase tracking-widest px-3 py-1.5 border-b border-aurora-500/15 mb-1 flex items-center justify-between">
                        <span>Projects</span>
                        <span className="text-slate-400 font-normal">{projects.length} total</span>
                      </div>
                      
                      <ul className="max-h-60 overflow-y-auto custom-scrollbar space-y-1 p-0.5">
                        {projects.map((p) => (
                          <li
                            key={p.id}
                            onClick={() => {
                              setActiveProject(p);
                              setIsProjectDropdownOpen(false);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between group/item ${
                              activeProject?.id === p.id
                                ? 'bg-aurora-500/25 text-aurora-300 font-semibold border border-aurora-500/30 shadow-glow-sm'
                                : 'text-slate-200 hover:bg-aurora-500/15 hover:text-aurora-300 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {activeProject?.id === p.id && <span className="w-1.5 h-1.5 rounded-full bg-aurora-400 shadow-glow-sm flex-shrink-0" />}
                              <span className="truncate">{p.title}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProject(p.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition opacity-60 group-hover/item:opacity-100 cursor-pointer"
                              title={`Permanently delete "${p.title}" from database`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>

                      <div className="border-t border-aurora-500/15 mt-1.5 pt-1.5 space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadSampleTutorialStory();
                            setIsProjectDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-aurora-300 hover:bg-aurora-500/20 border border-transparent hover:border-aurora-500/30 transition-all cursor-pointer font-medium"
                          title="Restore or add the sample tutorial story (The Whispering Manor)"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                          <span>Load Sample Story & Guide</span>
                        </button>

                        {activeProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(activeProject.id);
                              setIsProjectDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Current Story "{activeProject.title}"</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassSurface>
                </div>
              )}
            </div>

            {/* Compact Action Icon Buttons */}
            <GlassSurface borderRadius={12} width="auto" height="auto">
              <button onClick={() => setIsNewProjectModalOpen(true)} className="p-1.5 text-aurora-400 hover:bg-aurora-500/10 transition-all cursor-pointer" title="Create New Project">
                <Plus className="w-4 h-4" />
              </button>
            </GlassSurface>

            <GlassSurface borderRadius={12} width="auto" height="auto">
              <button onClick={() => setIsImportStoryModalOpen(true)} className="p-1.5 text-teal-400 hover:bg-teal-500/10 transition-all cursor-pointer" title="Import Story File (.pdf, .docx, .txt)">
                <UploadCloud className="w-4 h-4" />
              </button>
            </GlassSurface>

            <GlassSurface borderRadius={12} width="auto" height="auto">
              <button onClick={() => setIsAIStorySummaryOpen(true)} className="p-1.5 text-aurora-300 hover:bg-aurora-500/15 transition-all cursor-pointer shadow-glow-sm" title="AI Story Summary & Deep Analysis">
                <Sparkles className="w-4 h-4 text-aurora-300" />
              </button>
            </GlassSurface>
          </div>
        </div>

        {/* Search Query Bar */}
        <GlassSurface borderRadius={12} width={210} height="auto" className="flex-shrink">
          <button onClick={() => setIsSearchOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all w-full justify-between group">
            <span className="flex items-center gap-1.5 truncate">
              <Search className="w-3.5 h-3.5 text-aurora-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="italic font-serif truncate text-[11px]">Query universe...</span>
            </span>
            <kbd className="bg-aurora-500/15 text-aurora-400 text-[10px] px-1.5 py-0.5 rounded-md font-mono border border-aurora-500/20 flex-shrink-0">Ctrl+K</kbd>
          </button>
        </GlassSurface>

        {/* Right Utility Actions — 4 Mood Atmosphere Switcher */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <GlassSurface borderRadius={12} width="auto" height="auto">
            <div className="flex items-center p-0.5 gap-0.5">
              <button
                onClick={() => setTheme('day')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 border ${theme === 'day' ? 'bg-amber-500/25 text-amber-300 shadow-glow-sm border-amber-500/30' : 'text-slate-400 border-transparent hover:text-amber-300 hover:bg-amber-500/10'}`}
                title="Knight Day Atmosphere (Sun)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('sunset')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 border ${theme === 'sunset' ? 'bg-orange-500/25 text-orange-300 shadow-glow-sm border-orange-500/30' : 'text-slate-400 border-transparent hover:text-orange-300 hover:bg-orange-500/10'}`}
                title="Knight Sunset Atmosphere (Sunset)"
              >
                <Sunset className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('cloudy')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 border ${theme === 'cloudy' ? 'bg-teal-500/25 text-teal-300 shadow-glow-sm border-teal-500/30' : 'text-slate-400 border-transparent hover:text-teal-300 hover:bg-teal-500/10'}`}
                title="Knight Cloudy Atmosphere (Cloud)"
              >
                <Cloud className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('night')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 border ${theme === 'night' ? 'bg-aurora-500/25 text-aurora-300 shadow-glow-sm border-aurora-500/30' : 'text-slate-400 border-transparent hover:text-aurora-300 hover:bg-aurora-500/10'}`}
                title="Knight Night Atmosphere (Moon)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassSurface>
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-aurora-500/20 to-transparent" />
          <NeuronGauge />
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-aurora-500/20 to-transparent" />
          {isSplitView && (
            <button
              onClick={toggleSplitView}
              className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/35 transition-all text-xs font-bold flex items-center gap-1.5 shadow-glow-sm cursor-pointer"
              title="Exit Split Screen View (Esc)"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Exit Split</span>
            </button>
          )}
          <button onClick={() => setIsShortcutsOpen(true)} className="p-1.5 rounded-xl text-slate-400 hover:text-aurora-400 hover:bg-aurora-500/10 transition-all cursor-pointer" title="Keyboard Shortcuts (?)"><HelpCircle className="w-4 h-4" /></button>
          <button onClick={toggleDistractionFree} className="p-1.5 rounded-xl text-slate-400 hover:text-aurora-400 hover:bg-aurora-500/10 transition-all cursor-pointer" title="Distraction-Free Fullscreen Mode (Ctrl+\)">
            {isDistractionFree ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* USER AVATAR & DROPDOWN MENU (SINGLE ICON BUTTON & TRANSPARENT GLASSMORPHIC MENU) */}
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-aurora-500/20 to-transparent" />
          <div className="relative" ref={userMenuRef}>
            {/* SINGLE ICON BUTTON */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 rounded-xl bg-obsidian-900/40 hover:bg-aurora-500/20 border border-aurora-500/30 flex items-center justify-center transition-all cursor-pointer shadow-glow-sm hover:scale-105"
              title={`${currentUser?.displayName || 'Author'} (@${currentUser?.username || 'user'})`}
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-aurora-500 via-aurora-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-glow-sm">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
            </button>

            {/* TRANSPARENT GLASSMORPHIC USER DROPDOWN */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <GlassSurface
                  borderRadius={16}
                  blur={20}
                  opacity={0.7}
                  brightness={50}
                  className="p-2 shadow-[0_15px_40px_rgba(0,0,0,0.7)] border-aurora-500/30 backdrop-blur-xl bg-obsidian-950/40"
                >
                  <div className="px-3 py-2 border-b border-aurora-500/20">
                    <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                      <span>{currentUser?.displayName}</span>
                      {currentUser?.isGuest && (
                        <span className="text-[9px] font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.2 rounded uppercase">
                          Guest
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-aurora-300 font-mono truncate">@{currentUser?.username}</div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-slate-200 hover:text-white hover:bg-aurora-500/20 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-aurora-400" />
                      <span>Author Profile</span>
                    </button>

                    {currentUser?.isGuest && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full px-3 py-2 text-xs text-left text-amber-300 hover:bg-amber-500/20 rounded-xl flex items-center gap-2 transition-all cursor-pointer font-semibold"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>Convert Guest Account</span>
                      </button>
                    )}

                    <div className="border-t border-aurora-500/20 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-xs text-left text-rose-300 hover:bg-rose-500/20 rounded-xl flex items-center gap-2 transition-all cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </GlassSurface>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
