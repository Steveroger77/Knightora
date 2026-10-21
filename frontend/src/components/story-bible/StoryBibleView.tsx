import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { CharacterDetailModal } from './CharacterDetailModal';
import { Character, Location, Prop, Scene } from '../../types';
import { Users, MapPin, Package, Film, BookOpen, Eye, Search, Sparkles, Trash2, Plus, X } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const StoryBibleView: React.FC = () => {
  const characters = useProjectStore((s) => s.characters);
  const locations = useProjectStore((s) => s.locations);
  const props = useProjectStore((s) => s.props);
  const scenes = useProjectStore((s) => s.scenes);
  const addCharacter = useProjectStore((s) => s.addCharacter);
  const addLocation = useProjectStore((s) => s.addLocation);
  const addProp = useProjectStore((s) => s.addProp);
  const addScene = useProjectStore((s) => s.addScene);
  const deleteLocation = useProjectStore((s) => s.deleteLocation);
  const deleteProp = useProjectStore((s) => s.deleteProp);
  const deleteScene = useProjectStore((s) => s.deleteScene);

  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setPendingImagePrompt = useUIStore((s) => s.setPendingImagePrompt);

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');

  // Map active tab or default to 'story-bible'
  const currentTab = ['story-bible', 'characters', 'locations', 'props', 'scenes'].includes(activeTab)
    ? activeTab
    : 'story-bible';

  const filterText = searchFilter.toLowerCase();

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(filterText) || (c.description && c.description.toLowerCase().includes(filterText))
  );

  const filteredLocations = locations.filter((l) =>
    l.name.toLowerCase().includes(filterText) || (l.description && l.description.toLowerCase().includes(filterText))
  );

  const filteredProps = props.filter((p) =>
    p.name.toLowerCase().includes(filterText) || (p.description && p.description.toLowerCase().includes(filterText))
  );

  const filteredScenes = scenes.filter((s) =>
    s.title.toLowerCase().includes(filterText) || (s.summary && s.summary.toLowerCase().includes(filterText))
  );

  const handleGenerateCharacterActionImage = (c: Character, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingImagePrompt(`Cinematic portrait artwork of ${c.characterCode || c.name}: ${c.name}, ${c.appearance || c.description}`);
    setActiveTab('images');
  };

  const handleGenerateLocationArtwork = (l: Location, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingImagePrompt(`Cinematic environment architectural artwork of ${l.name}: ${l.description}. Atmosphere: ${l.atmosphere}. Weather: ${l.weather}.`);
    setActiveTab('images');
  };

  const handleGeneratePropArtwork = (p: Prop, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingImagePrompt(`Detailed studio prop concept art of ${p.name}: ${p.description}. Owner: ${p.owner}. Status: ${p.status}.`);
    setActiveTab('images');
  };

  const handleGenerateSceneArtwork = (s: Scene, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingImagePrompt(`Cinematic storyboard artwork for Scene #${s.sceneNumber} ${s.title}: ${s.summary}. Mood: ${s.mood}. Dialogue: "${s.dialogueExcerpt}".`);
    setActiveTab('images');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header Controls - Fixed Height Liquid Glass Block */}
      <GlassSurface width="100%" height={52} borderRadius={16} className="px-5 py-2 flex items-center justify-between z-10 select-none mb-3 shadow-xl flex-shrink-0 h-[52px] min-h-[52px] max-h-[52px] overflow-hidden">
        <div className="flex items-center gap-3 flex-nowrap min-w-0">
          <div className="flex items-center gap-2 text-aurora-400 font-bold flex-shrink-0">
            {currentTab === 'characters' && <Users className="w-4.5 h-4.5 text-aurora-400" />}
            {currentTab === 'locations' && <MapPin className="w-4.5 h-4.5 text-teal-400" />}
            {currentTab === 'props' && <Package className="w-4.5 h-4.5 text-aurora-400" />}
            {currentTab === 'scenes' && <Film className="w-4.5 h-4.5 text-teal-400" />}
            {currentTab === 'story-bible' && <BookOpen className="w-4.5 h-4.5 text-aurora-400" />}

            <h2 className="font-serif font-bold text-base text-slate-100 whitespace-nowrap">
              {currentTab === 'story-bible' ? 'Story Bible Feed' : `${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Library`}
            </h2>
          </div>

          <div className="relative ml-2 w-44 lg:w-52 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`Search ${currentTab}...`}
              className="w-full glass-surface border border-aurora-500/20 rounded-full pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-aurora-500/50"
            />
          </div>
        </div>

        {/* Dedicated Tab Bar Navigation & Add Button - Glassmorphic Pills */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="glass-surface border border-aurora-500/20 rounded-xl p-0.5 flex items-center gap-1">
            {[
              { id: 'story-bible', label: 'Feed', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'characters', label: `Characters (${characters.length})`, icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'locations', label: `Locations (${locations.length})`, icon: <MapPin className="w-3.5 h-3.5" /> },
              { id: 'props', label: `Props (${props.length})`, icon: <Package className="w-3.5 h-3.5" /> },
              { id: 'scenes', label: `Scenes (${scenes.length})`, icon: <Film className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-aurora-500/20 text-aurora-300 font-semibold border border-aurora-500/35 shadow-glow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="wax-seal-btn px-3 py-1 text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Add New Entity to Story Bible"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </GlassSurface>

      {/* Dynamic Dedicated Tab Views */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
        {/* STORY BIBLE LIVE FEED TAB */}
        <div className={currentTab === 'story-bible' ? 'block' : 'hidden'}>
          <div className="max-w-4xl mx-auto space-y-6">
            <GlassSurface width="100%" height="auto" className="p-5 shadow-xl flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-aurora-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-aurora-400" /> Realtime Story Bible Auto-Extraction Feed
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gemini 2.5 Flash continuously extracts and syncs new story elements from your script updates.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 glass-surface px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" /> Synchronized
              </span>
            </GlassSurface>

            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-mono text-slate-400 border-b border-aurora-500/15 pb-1.5">
                Extracted Universe Elements ({characters.length + locations.length + props.length})
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((c) => (
                  <GlassSurface key={c.id} width="100%" height="auto" className="cursor-pointer hover:border-aurora-500/50 transition-all">
                    <div onClick={() => setSelectedCharacter(c)} className="p-4 w-full h-full">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-slate-100">
                        <span className="flex items-center gap-1.5">
                          {c.name}
                          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">{c.characterCode || 'CHAR'}</span>
                        </span>
                        <span className="text-[10px] text-aurora-400 font-mono">Character</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.appearance || c.description}</p>
                    </div>
                  </GlassSurface>
                ))}

                {locations.map((l) => (
                  <GlassSurface key={l.id} width="100%" height="auto">
                    <div className="p-4 w-full h-full">
                      <div className="flex items-center justify-between text-xs font-serif font-bold text-slate-100">
                        <span>{l.name}</span>
                        <span className="text-[10px] text-teal-400 font-mono">Location</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{l.atmosphere}</p>
                    </div>
                  </GlassSurface>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DEDICATED CHARACTERS TAB */}
        <div className={currentTab === 'characters' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'hidden'}>
          {filteredCharacters.map((c) => (
            <GlassSurface key={c.id} width="100%" height="100%" className="shadow-lg cursor-pointer transition-all group hover:-translate-y-1">
              <div onClick={() => setSelectedCharacter(c)} className="p-5 flex flex-col h-full w-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-slate-100 group-hover:text-aurora-300 transition">{c.name}</span>
                    <span className="text-[10px] font-mono font-bold text-aurora-300 bg-aurora-500/20 px-2 py-0.5 rounded border border-aurora-500/30">
                      {c.characterCode || 'CHAR_001'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-teal-400 glass-surface px-2 py-0.5 rounded-lg border border-teal-500/20">{c.occupation}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-slate-300 leading-relaxed font-serif italic line-clamp-2 font-medium">"{c.appearance || c.description}"</div>
                  <div className="text-slate-400 text-[11px] font-mono flex flex-wrap gap-x-2">
                    <span>Height: <strong className="text-slate-200">{c.height || '6 ft'}</strong></span>
                    <span>Build: <strong className="text-slate-200">{c.build || 'Athletic'}</strong></span>
                    <span>Eyes: <strong className="text-slate-200">{c.eyeColor || 'Dark'}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-aurora-500/15 flex items-center justify-between mt-auto">
                  <button
                    onClick={(e) => handleGenerateCharacterActionImage(c, e)}
                    className="px-2.5 py-1 text-[11px] bg-aurora-500/20 hover:bg-aurora-500/35 text-aurora-200 rounded-lg border border-aurora-500/30 flex items-center gap-1 font-semibold transition"
                    title="Generate Consistent Action Artwork in Studio"
                  >
                    <Sparkles className="w-3 h-3 text-aurora-400" />
                    <span>Generate Artwork</span>
                  </button>

                  <span className="text-[11px] text-aurora-400 flex items-center gap-1 font-mono group-hover:underline">
                    <Eye className="w-3 h-3" /> Profile Spec
                  </span>
                </div>
              </div>
            </GlassSurface>
          ))}
        </div>

        {/* DEDICATED LOCATIONS TAB */}
        <div className={currentTab === 'locations' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'hidden'}>
          {filteredLocations.map((l) => (
            <GlassSurface key={l.id} width="100%" height="100%" className="shadow-lg">
              <div className="p-5 space-y-3 h-full flex flex-col w-full">
                <div className="flex items-center justify-between border-b border-aurora-500/20 pb-2">
                  <span className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    {l.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-teal-400">{l.timeOfDay}</span>
                    <button
                      onClick={() => deleteLocation(l.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Permanently Delete Location from DB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed flex-1">{l.description}</p>
                <div className="glass-surface p-3 rounded-xl border border-aurora-500/15 text-xs text-slate-400 space-y-1">
                  <div><strong className="text-aurora-400">Atmosphere:</strong> {l.atmosphere}</div>
                  <div><strong className="text-aurora-400">Weather:</strong> {l.weather}</div>
                  <div><strong className="text-aurora-400">History:</strong> {l.history}</div>
                </div>

                <div className="pt-2 border-t border-aurora-500/15 flex items-center justify-between mt-auto">
                  <button
                    onClick={(e) => handleGenerateLocationArtwork(l, e)}
                    className="px-3 py-1.5 text-xs bg-teal-500/20 hover:bg-teal-500/35 text-teal-200 rounded-xl border border-teal-500/30 flex items-center gap-1.5 font-semibold transition cursor-pointer shadow-sm"
                    title="Generate Location Architectural Environment Artwork"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    <span>Generate Location Artwork</span>
                  </button>
                </div>
              </div>
            </GlassSurface>
          ))}
        </div>

        {/* DEDICATED PROPS TAB */}
        <div className={currentTab === 'props' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'hidden'}>
          {filteredProps.map((p) => (
            <GlassSurface key={p.id} width="100%" height="100%" className="shadow-lg">
              <div className="p-5 space-y-3 h-full flex flex-col w-full">
                <div className="flex items-center justify-between border-b border-aurora-500/20 pb-2">
                  <span className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-aurora-400" />
                    {p.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-400">{p.status}</span>
                    <button
                      onClick={() => deleteProp(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Permanently Delete Prop from DB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed flex-1">{p.description}</p>
                <div className="glass-surface p-3 rounded-xl border border-aurora-500/15 text-xs text-slate-400 space-y-1">
                  <div><strong className="text-aurora-400">Owner:</strong> {p.owner}</div>
                  <div><strong className="text-aurora-400">History:</strong> {p.history}</div>
                </div>

                <div className="pt-2 border-t border-aurora-500/15 flex items-center justify-between mt-auto">
                  <button
                    onClick={(e) => handleGeneratePropArtwork(p, e)}
                    className="px-3 py-1.5 text-xs bg-aurora-500/20 hover:bg-aurora-500/35 text-aurora-200 rounded-xl border border-aurora-500/30 flex items-center gap-1.5 font-semibold transition cursor-pointer shadow-sm"
                    title="Generate Prop Concept Artwork"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-aurora-400" />
                    <span>Generate Prop Artwork</span>
                  </button>
                </div>
              </div>
            </GlassSurface>
          ))}
        </div>

        {/* DEDICATED SCENES TAB */}
        <div className={currentTab === 'scenes' ? 'grid grid-cols-1 md:grid-cols-2 gap-5' : 'hidden'}>
          {filteredScenes.map((s) => (
            <GlassSurface key={s.id} width="100%" height="100%" className="shadow-lg">
              <div className="p-5 space-y-3 h-full flex flex-col w-full">
                <div className="flex items-center justify-between border-b border-aurora-500/20 pb-2">
                  <span className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
                    <Film className="w-4 h-4 text-teal-400" />
                    #{s.sceneNumber} {s.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{s.mood}</span>
                    <button
                      onClick={() => deleteScene(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Permanently Delete Scene from DB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{s.summary}</p>
                <div className="p-3 glass-surface rounded-xl border border-aurora-500/15 text-xs italic text-slate-300 font-serif">
                  "{s.dialogueExcerpt}"
                </div>

                <div className="pt-2 border-t border-aurora-500/15 flex items-center justify-between mt-auto">
                  <button
                    onClick={(e) => handleGenerateSceneArtwork(s, e)}
                    className="px-3 py-1.5 text-xs bg-aurora-500/25 hover:bg-aurora-500/40 text-aurora-200 rounded-xl border border-aurora-500/35 flex items-center gap-1.5 font-semibold transition cursor-pointer shadow-glow-sm"
                    title="Generate Scene Storyboard Artwork"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-aurora-300 animate-pulse" />
                    <span>Generate Scene Artwork</span>
                  </button>
                </div>
              </div>
            </GlassSurface>
          ))}
        </div>
      </div>

      {/* Character Detail Modal */}
      <CharacterDetailModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />

      {/* Create Entity Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <GlassSurface borderRadius={20} blur={20} width="100%" height="auto" className="max-w-md w-full p-6 relative border border-aurora-500/40 shadow-2xl">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-aurora-400 transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-aurora-500/20 pb-3">
              <Plus className="w-5 h-5 text-aurora-400" />
              <h3 className="font-serif font-bold text-base text-slate-100">Add New Story Item</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!createName.trim()) return;
                if (currentTab === 'characters') {
                  addCharacter({ name: createName.trim(), description: createDescription.trim() });
                } else if (currentTab === 'locations') {
                  addLocation({ name: createName.trim(), description: createDescription.trim() });
                } else if (currentTab === 'props') {
                  addProp({ name: createName.trim(), description: createDescription.trim() });
                } else {
                  addScene({ title: createName.trim(), summary: createDescription.trim() });
                }
                setIsCreateModalOpen(false);
                setCreateName('');
                setCreateDescription('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {currentTab === 'scenes' ? 'Scene Title' : 'Name'}
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={`Enter ${currentTab === 'scenes' ? 'scene title' : currentTab.slice(0, -1)} name...`}
                  className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-aurora-500/60"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Summary</label>
                <textarea
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-aurora-500/60 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="wax-seal-btn px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </GlassSurface>
        </div>
      )}
    </div>
  );
};
