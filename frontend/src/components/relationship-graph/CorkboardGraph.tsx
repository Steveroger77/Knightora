import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { Relationship, Character } from '../../types';
import { GitBranch, User, Film, X, Sparkles, Heart, Shield, Zap, Skull, Plus, Trash2, Edit2, Check, Users, Eye, ShieldCheck } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';
import { CharacterDetailModal } from '../story-bible/CharacterDetailModal';

export const CorkboardGraph: React.FC = () => {
  const { characters, relationships, scenes, addRelationship, updateRelationship, deleteRelationship } = useProjectStore();
  const { setActiveTab, setPendingImagePrompt } = useUIStore();

  const [selectedEdge, setSelectedEdge] = useState<Relationship | null>(null);
  const [selectedNodeCharacter, setSelectedNodeCharacter] = useState<Character | null>(null);
  const [hoveredCharacterId, setHoveredCharacterId] = useState<string | null>(null);

  // Drag and Drop Node Positions State
  const [draggedPositions, setDraggedPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Add Relationship Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCharA, setNewCharA] = useState('');
  const [newCharB, setNewCharB] = useState('');
  const [newType, setNewType] = useState<any>('friend');
  const [newDescription, setNewDescription] = useState('');

  // Edit Relationship State
  const [isEditingEdge, setIsEditingEdge] = useState(false);
  const [editType, setEditType] = useState<any>('friend');
  const [editDescription, setEditDescription] = useState('');

  // Initial grid position calculation for cards
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const total = characters.length;
    if (total === 0) return pos;

    characters.forEach((c, index) => {
      if (draggedPositions[c.id]) {
        pos[c.id] = draggedPositions[c.id];
      } else {
        const cols = total > 4 ? 3 : 2;
        const col = index % cols;
        const row = Math.floor(index / cols);
        const baseX = 180 + col * 380;
        const baseY = 100 + row * 240;
        pos[c.id] = { x: baseX, y: baseY };
      }
    });
    return pos;
  }, [characters, draggedPositions]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent, charId: string) => {
    e.stopPropagation();
    setActiveDragId(charId);
    const currentPos = nodePositions[charId] || { x: 200, y: 200 };
    dragOffsetRef.current = {
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeDragId) return;
      const newX = Math.max(80, Math.min(1300, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(40, Math.min(850, e.clientY - dragOffsetRef.current.y));
      setDraggedPositions((prev) => ({
        ...prev,
        [activeDragId]: { x: newX, y: newY },
      }));
    };

    const handleMouseUp = () => {
      setActiveDragId(null);
    };

    if (activeDragId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragId]);

  // Active Connections
  const activeRelationships = useMemo(() => {
    return relationships.filter(
      (r) => nodePositions[r.characterAId] && nodePositions[r.characterBId]
    );
  }, [relationships, nodePositions]);

  // Relationships for selected character node
  const selectedCharacterRelationships = useMemo(() => {
    if (!selectedNodeCharacter) return [];
    return relationships.filter(
      (r) => r.characterAId === selectedNodeCharacter.id || r.characterBId === selectedNodeCharacter.id
    ).map((r) => {
      const otherCharId = r.characterAId === selectedNodeCharacter.id ? r.characterBId : r.characterAId;
      const otherChar = characters.find((c) => c.id === otherCharId);
      return { ...r, otherChar };
    });
  }, [selectedNodeCharacter, relationships, characters]);

  const handleCreateRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharA || !newCharB || newCharA === newCharB) return;
    const charAObj = characters.find((c) => c.id === newCharA);
    const charBObj = characters.find((c) => c.id === newCharB);
    addRelationship({
      characterAId: newCharA,
      characterBId: newCharB,
      type: newType,
      description: newDescription || `Dynamic relationship between ${charAObj?.name || 'Character A'} and ${charBObj?.name || 'Character B'}.`,
    });
    setIsAddModalOpen(false);
    setNewCharA('');
    setNewCharB('');
    setNewDescription('');
  };

  const handleSaveEdgeEdit = () => {
    if (!selectedEdge) return;
    updateRelationship(selectedEdge.id, {
      type: editType,
      description: editDescription,
    });
    setSelectedEdge({
      ...selectedEdge,
      type: editType,
      description: editDescription,
    });
    setIsEditingEdge(false);
  };

  const getCoAppearingScenes = (charAId: string, charBId: string) => {
    return scenes.filter(
      (s) => s.characterIds?.includes(charAId) && s.characterIds?.includes(charBId)
    );
  };

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sibling':
      case 'family':
        return { label: 'Family / Sibling', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'enemy':
      case 'foe':
        return { label: 'Enemy / Foil', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'lover':
      case 'romantic':
        return { label: 'Romantic', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      case 'mentor':
        return { label: 'Mentor / Student', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'Ally / Companion', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative select-none">
      {/* Top Header */}
      <GlassSurface width="100%" height={56} borderRadius={16} className="px-6 py-3 flex items-center justify-between z-10 mb-2 shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-aurora-500/15 border border-aurora-500/25">
            <GitBranch className="w-5 h-5 text-aurora-400" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-slate-100">Character Relationships & Dynamics Matrix</h2>
            <p className="text-xs text-slate-400 font-mono">Click any character card to inspect full profile & relational connections</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-300 glass-surface px-3 py-1.5 rounded-xl border border-aurora-500/20">
            {characters.length} Characters • {activeRelationships.length} Relational Links
          </span>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="wax-seal-btn px-4 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-glow-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Connection</span>
          </button>
        </div>
      </GlassSurface>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto custom-scrollbar p-6">
        <div className="w-[1450px] h-[850px] relative">
          {/* SVG Smooth Curved Connection Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1450 850">
            <defs>
              <linearGradient id="glowLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#7C6AED" stopOpacity="1" />
                <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.9" />
              </linearGradient>
              <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {activeRelationships.map((rel) => {
              const posA = nodePositions[rel.characterAId];
              const posB = nodePositions[rel.characterBId];

              if (!posA || !posB) return null;

              // Anchor coordinates centered on card midpoints
              const ax = posA.x + 130;
              const ay = posA.y + 70;
              const bx = posB.x + 130;
              const by = posB.y + 70;

              const isHighlighted =
                hoveredCharacterId === rel.characterAId ||
                hoveredCharacterId === rel.characterBId ||
                selectedEdge?.id === rel.id ||
                selectedNodeCharacter?.id === rel.characterAId ||
                selectedNodeCharacter?.id === rel.characterBId;

              // Smooth cubic bezier path
              const dx = bx - ax;
              const dy = by - ay;
              const cx1 = ax + dx * 0.4;
              const cy1 = ay + dy * 0.1;
              const cx2 = ax + dx * 0.6;
              const cy2 = by - dy * 0.1;
              const pathD = `M ${ax} ${ay} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${bx} ${by}`;

              const midX = (ax + bx) / 2;
              const midY = (ay + by) / 2;

              return (
                <g key={rel.id} className="cursor-pointer pointer-events-auto group" onClick={() => {
                  setSelectedEdge(rel);
                  setEditType(rel.type);
                  setEditDescription(rel.description);
                }}>
                  {/* Subtle Background Glow Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHighlighted ? "#38BDF8" : "rgba(124, 106, 237, 0.25)"}
                    strokeWidth={isHighlighted ? "8" : "4"}
                    opacity={isHighlighted ? "0.9" : "0.4"}
                    filter={isHighlighted ? "url(#lineGlow)" : undefined}
                    className="transition-all duration-200"
                  />
                  {/* Primary Gradient Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#glowLineGrad)"
                    strokeWidth={isHighlighted ? "3.5" : "2"}
                    strokeDasharray={isHighlighted ? "none" : "6 4"}
                    className="transition-all duration-200"
                  />
                  {/* Node Connector Pin Badge */}
                  <circle cx={midX} cy={midY} r={isHighlighted ? "9" : "7"} fill="#0F172A" stroke={isHighlighted ? "#38BDF8" : "#7C6AED"} strokeWidth="2.5" />
                  <circle cx={midX} cy={midY} r={isHighlighted ? "4" : "3"} fill={isHighlighted ? "#38BDF8" : "#2DD4BF"} />
                </g>
              );
            })}
          </svg>

          {/* Character Card Nodes (Clean Layout, Unclipped Pin Dot) */}
          {characters.map((c) => {
            const pos = nodePositions[c.id];
            if (!pos) return null;
            const isHovered = hoveredCharacterId === c.id;
            const isSelected = selectedNodeCharacter?.id === c.id;

            return (
              <div
                key={c.id}
                style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                onMouseDown={(e) => handleMouseDown(e, c.id)}
                onMouseEnter={() => setHoveredCharacterId(c.id)}
                onMouseLeave={() => setHoveredCharacterId(null)}
                onClick={() => setSelectedNodeCharacter(c)}
                className={`absolute w-64 z-10 transition-transform duration-100 cursor-grab active:cursor-grabbing ${
                  isHovered || isSelected ? 'scale-105 z-20' : ''
                }`}
              >
                <GlassSurface
                  borderRadius={20}
                  blur={16}
                  width="100%"
                  height="auto"
                  className={`p-4 relative shadow-xl transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'border-2 border-aurora-400 shadow-glow-md bg-slate-950/90'
                      : isHovered
                      ? 'border border-aurora-500/50 bg-slate-950/80'
                      : 'border border-aurora-500/25 bg-slate-950/70'
                  }`}
                >
                  {/* Clean Pin Header Indicator - Completely Unclipped Inside Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-aurora-400 to-teal-400 border border-white/60 shadow-glow-sm" />
                      <span className="text-[10px] font-mono font-bold text-aurora-300 bg-aurora-500/20 px-2 py-0.5 rounded border border-aurora-500/30">
                        {c.characterCode || 'CHAR_001'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-teal-400 glass-surface px-2 py-0.5 rounded-md border border-teal-500/20 truncate max-w-[100px]">
                      {c.occupation || 'Character'}
                    </span>
                  </div>

                  <div className="font-serif font-bold text-sm text-slate-100 truncate mb-1">{c.name}</div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic mb-3 font-serif">
                    "{c.appearance || c.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-aurora-500/15 pt-2">
                    <span>Age: {c.age || 'N/A'}</span>
                    <span className="text-aurora-400 font-semibold flex items-center gap-1 hover:underline">
                      <Eye className="w-3 h-3 text-teal-400" /> Full Profile
                    </span>
                  </div>
                </GlassSurface>
              </div>
            );
          })}
        </div>
      </div>

      {/* Character Profile & Relationships Inspector Drawer (Triggers on Clicking Any Node) */}
      {selectedNodeCharacter && (
        <div className="absolute top-20 right-8 w-[420px] max-h-[calc(100vh-7rem)] z-30 animate-in fade-in slide-in-from-right-4 duration-200 flex flex-col">
          <GlassSurface borderRadius={24} blur={24} width="100%" height="auto" className="p-6 shadow-2xl border border-aurora-500/40 bg-slate-950/95 overflow-hidden flex flex-col max-h-[calc(100vh-7rem)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-aurora-500/20 pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-aurora-500/20 border border-aurora-500/40 flex items-center justify-center text-aurora-300 font-serif font-bold text-lg shadow-glow-sm">
                  {selectedNodeCharacter.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-slate-100">{selectedNodeCharacter.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-aurora-500/20 border border-aurora-500/40 text-[10px] font-mono text-aurora-300 font-bold">
                      {selectedNodeCharacter.characterCode || 'CHAR_001'}
                    </span>
                  </div>
                  <span className="text-xs text-teal-400 font-mono uppercase">{selectedNodeCharacter.occupation} ({selectedNodeCharacter.age || 'N/A'} yrs)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPendingImagePrompt(`Cinematic portrait of ${selectedNodeCharacter.characterCode || selectedNodeCharacter.name}: ${selectedNodeCharacter.name}, ${selectedNodeCharacter.appearance || selectedNodeCharacter.description}`);
                    setActiveTab('images');
                  }}
                  className="px-2.5 py-1 text-xs bg-aurora-500/20 hover:bg-aurora-500/35 text-aurora-200 rounded-lg border border-aurora-500/30 flex items-center gap-1 font-semibold transition"
                  title="Generate Consistent Artwork in Studio"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Artwork</span>
                </button>
                <button onClick={() => setSelectedNodeCharacter(null)} className="text-slate-400 hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Inspector Body */}
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
              {/* Visual Anchor Spec Summary */}
              <div className="p-3 rounded-xl bg-aurora-500/10 border border-aurora-500/20 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-aurora-300 font-mono text-[11px] uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Locked Visual Profile Spec
                </div>
                <p className="text-xs text-slate-200 italic font-serif leading-relaxed">"{selectedNodeCharacter.appearance || selectedNodeCharacter.description}"</p>
                <div className="text-[11px] text-slate-400 font-mono grid grid-cols-2 gap-1 pt-1 border-t border-aurora-500/15">
                  <div>Height: <strong className="text-slate-200">{selectedNodeCharacter.height || '6 ft'}</strong></div>
                  <div>Build: <strong className="text-slate-200">{selectedNodeCharacter.build || 'Athletic'}</strong></div>
                  <div>Hair: <strong className="text-slate-200">{selectedNodeCharacter.hairColor || 'Dark'}</strong></div>
                  <div>Eyes: <strong className="text-slate-200">{selectedNodeCharacter.eyeColor || 'Dark'}</strong></div>
                </div>
              </div>

              {/* Character Relationships List */}
              <div>
                <h4 className="text-xs font-bold font-mono text-aurora-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-400" /> Relational Connections ({selectedCharacterRelationships.length})
                </h4>

                {selectedCharacterRelationships.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 glass-surface rounded-xl border border-aurora-500/15">
                    No active relationships mapped yet. Click "Add Connection" to link {selectedNodeCharacter.name} to other characters.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedCharacterRelationships.map((rel) => {
                      const badge = getTypeBadge(rel.type);
                      return (
                        <div key={rel.id} className="p-3 rounded-xl bg-slate-900/80 border border-aurora-500/20 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-serif text-slate-100">
                              {selectedNodeCharacter.name} & <strong className="text-aurora-300">{rel.otherChar?.name || 'Related Character'}</strong>
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-serif">"{rel.description}"</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Personality & Story Arc */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-aurora-500/15 space-y-1.5 text-xs">
                <div className="font-bold text-aurora-300 font-mono text-[11px] uppercase">Personality & Arc Trajectory</div>
                <p className="text-slate-300 leading-relaxed">{selectedNodeCharacter.personality || 'Determined and reflective.'}</p>
                <p className="text-slate-400 leading-relaxed italic">{selectedNodeCharacter.arcSummary || 'Evolves across the story narrative.'}</p>
              </div>
            </div>
          </GlassSurface>
        </div>
      )}

      {/* Side Panel: Relationship Edge Details & Edit/Delete Actions */}
      {selectedEdge && !selectedNodeCharacter && (
        <div className="absolute top-20 right-8 w-96 z-30 animate-in fade-in slide-in-from-right-4 duration-200">
          <GlassSurface borderRadius={20} blur={20} width="100%" height="auto" className="p-5 shadow-2xl border border-aurora-500/30">
            <div className="flex items-center justify-between border-b border-aurora-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-aurora-500/15 border border-aurora-500/25">
                  <GitBranch className="w-4 h-4 text-aurora-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-aurora-300 capitalize">{selectedEdge.type} Connection</h3>
                  <p className="text-[10px] font-mono text-slate-400">Relational Matrix Detail</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingEdge(!isEditingEdge)}
                  className="p-1 text-slate-400 hover:text-aurora-400 transition rounded-lg hover:bg-aurora-500/10 cursor-pointer"
                  title="Edit Relationship"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    deleteRelationship(selectedEdge.id);
                    setSelectedEdge(null);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10 cursor-pointer"
                  title="Permanently Delete Relationship"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedEdge(null)} className="text-slate-400 hover:text-aurora-400 transition p-1 rounded-lg hover:bg-aurora-500/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isEditingEdge ? (
              <div className="space-y-3 mb-4 bg-aurora-500/10 p-3 rounded-xl border border-aurora-500/20">
                <div>
                  <label className="block text-[10px] font-mono text-aurora-300 uppercase mb-1">Relationship Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                  >
                    <option value="friend">Friend / Ally</option>
                    <option value="enemy">Enemy / Foil</option>
                    <option value="rival">Rival</option>
                    <option value="family">Family / Sibling</option>
                    <option value="lover">Lover / Romantic</option>
                    <option value="mentor">Mentor / Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-aurora-300 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl p-2 text-xs text-slate-100 resize-none"
                  />
                </div>
                <button
                  onClick={handleSaveEdgeEdit}
                  className="wax-seal-btn w-full py-1.5 text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Relationship</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-200 mb-4 leading-relaxed bg-aurora-500/10 p-3 rounded-xl border border-aurora-500/15">
                "{selectedEdge.description}"
              </p>
            )}

            <div className="space-y-2.5">
              <div className="text-[11px] font-mono text-aurora-400 uppercase tracking-wider border-b border-aurora-500/15 pb-1">
                Co-Appearing Scenes
              </div>
              
              {getCoAppearingScenes(selectedEdge.characterAId, selectedEdge.characterBId).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No co-appearing script scenes found yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                  {getCoAppearingScenes(selectedEdge.characterAId, selectedEdge.characterBId).map((s) => (
                    <div key={s.id} className="p-2 rounded-lg bg-obsidian-950/60 border border-aurora-500/15 text-xs text-slate-300">
                      <div className="font-bold text-aurora-300 font-mono text-[11px]">Scene #{s.sceneNumber}: {s.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{s.summary}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      )}

      {/* Add Connection Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <GlassSurface borderRadius={20} blur={20} width="100%" height="auto" className="max-w-md w-full p-6 relative border border-aurora-500/40 shadow-2xl">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-aurora-400 transition">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-aurora-500/20 pb-3">
              <Plus className="w-5 h-5 text-aurora-400" />
              <h3 className="font-serif font-bold text-base text-slate-100">Add Relational Connection</h3>
            </div>

            <form onSubmit={handleCreateRelationship} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Character A</label>
                <select
                  value={newCharA}
                  onChange={(e) => setNewCharA(e.target.value)}
                  className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl px-3 py-2 text-xs text-slate-100"
                  required
                >
                  <option value="">Select Character A...</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.characterCode || 'CHAR'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Character B</label>
                <select
                  value={newCharB}
                  onChange={(e) => setNewCharB(e.target.value)}
                  className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl px-3 py-2 text-xs text-slate-100"
                  required
                >
                  <option value="">Select Character B...</option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.characterCode || 'CHAR'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship Dynamic</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="friend">Friend / Ally</option>
                  <option value="enemy">Enemy / Foil</option>
                  <option value="rival">Rival</option>
                  <option value="family">Family / Sibling</option>
                  <option value="lover">Lover / Romantic</option>
                  <option value="mentor">Mentor / Student</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Dynamic Lore</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe how these two characters interact and relate..."
                  className="w-full bg-obsidian-950 border border-aurora-500/30 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-aurora-500/60 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="wax-seal-btn px-4 py-2 text-xs font-bold cursor-pointer"
                >
                  Create Connection
                </button>
              </div>
            </form>
          </GlassSurface>
        </div>
      )}
    </div>
  );
};
