import React, { useState, useEffect } from 'react';
import { Character } from '../../types';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { X, Edit2, Check, Sparkles, Image as ImageIcon, Trash2, ShieldCheck, Film } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

interface Props {
  character: Character | null;
  onClose: () => void;
}

export const CharacterDetailModal: React.FC<Props> = ({ character, onClose }) => {
  const { updateCharacter, deleteCharacter, generatedImages } = useProjectStore();
  const { setActiveTab, setPendingImagePrompt } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedChar, setEditedChar] = useState<Partial<Character>>(character || {});

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!character) return null;

  const charImages = generatedImages.filter((img) => img.characterId === character.id);

  const handleSave = () => {
    updateCharacter(character.id, editedChar);
    setIsEditing(false);
  };

  const handleGenerateInStudio = () => {
    setPendingImagePrompt(`Cinematic artwork of ${character.characterCode || character.name}: ${character.name}, ${character.appearance || character.description}`);
    setActiveTab('images');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian-950/80 backdrop-blur-md pt-20 pb-8 px-4 sm:px-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl h-full max-h-[calc(100vh-7.5rem)] flex flex-col my-auto"
      >
        <GlassSurface
          width="100%"
          height="100%"
          className="border border-aurora-500/30 shadow-2xl relative flex flex-col h-full overflow-hidden rounded-[24px] bg-slate-950/90"
        >
          {/* Top Fixed Header */}
          <div className="px-6 py-4 border-b border-aurora-500/20 flex items-center justify-between bg-slate-950/80 backdrop-blur-md flex-shrink-0 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-aurora-500/20 border border-aurora-500/40 flex items-center justify-center text-aurora-300 font-serif font-bold text-xl shadow-glow-sm flex-shrink-0">
                {character.name[0]}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 truncate">{character.name}</h2>
                  <span className="px-2 py-0.5 rounded bg-aurora-500/20 border border-aurora-500/40 text-[10px] font-mono text-aurora-300 font-bold flex-shrink-0">
                    {character.characterCode || 'CHAR_001'}
                  </span>
                </div>
                <span className="text-xs text-teal-400 font-mono uppercase tracking-wider truncate block">
                  {character.occupation || 'Dramatis Personae'} ({character.age || 'N/A'} yrs) • {character.gender || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <button
                onClick={handleGenerateInStudio}
                className="px-3 py-1.5 text-xs bg-aurora-500/25 hover:bg-aurora-500/40 text-aurora-200 border border-aurora-500/40 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-semibold shadow-glow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Generate Artwork</span>
              </button>

              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="px-3 py-1.5 text-xs bg-slate-900/80 hover:bg-aurora-500/20 text-slate-200 border border-aurora-500/30 rounded-xl transition cursor-pointer flex items-center gap-1 font-semibold"
              >
                {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Save' : 'Edit'}</span>
              </button>

              <button
                onClick={() => {
                  deleteCharacter(character.id);
                  onClose();
                }}
                className="px-2.5 py-1.5 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl hover:bg-rose-500/35 transition cursor-pointer flex items-center gap-1 font-semibold"
                title="Delete Character"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-900/60 hover:bg-aurora-500/20 border border-aurora-500/20 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title="Close Profile (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {/* Visual Identity Anchor Spec Notice */}
            <div className="p-3 rounded-xl bg-aurora-500/10 border border-aurora-500/20 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-aurora-300">Permanent Visual Identity Locked</span>
                  <p className="text-[11px] text-slate-400">All artwork generated for {character.name} maintains exact facial features, hair, eyes, and physical proportions across scenes.</p>
                </div>
              </div>
            </div>

            {/* Character Artwork Gallery Filmstrip */}
            <div>
              <h3 className="text-xs font-semibold text-aurora-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Identity & Scene Artwork Gallery ({charImages.length})
              </h3>
              {charImages.length === 0 ? (
                <div className="glass-surface p-4 rounded-xl border border-aurora-500/15 text-xs text-slate-400 italic text-center">
                  No artwork generated for {character.name} yet. Click "Generate Artwork" above to create consistent FLUX portraits.
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {charImages.map((img) => (
                    <div key={img.id} className="w-36 flex-shrink-0 glass-surface border border-aurora-500/30 rounded-xl overflow-hidden group">
                      <img src={img.imageUrl} alt={character.name} className="w-full h-36 object-cover" />
                      <div className="p-1.5 text-[10px] font-mono text-slate-400 truncate">{img.stylePreset || 'Portrait'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scene Appearances List */}
            {character.sceneAppearances && character.sceneAppearances.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-aurora-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-teal-400" /> Story Scene Participation ({character.sceneAppearances.length} Scenes)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {character.sceneAppearances.map((sceneTitle, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-aurora-500/15 border border-aurora-500/30 text-slate-200 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3 text-teal-400" /> {sceneTitle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-surface p-4 rounded-xl border border-aurora-500/15 space-y-2">
                <label className="text-xs font-semibold text-aurora-300 uppercase tracking-wider">Physical Appearance Spec</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editedChar.appearance || ''}
                    onChange={(e) => setEditedChar({ ...editedChar, appearance: e.target.value })}
                    className="w-full bg-slate-900 border border-aurora-500/20 rounded p-2 text-xs text-slate-200"
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed italic">{character.appearance || 'No physical appearance details noted.'}</p>
                )}
              </div>

              <div className="glass-surface p-4 rounded-xl border border-aurora-500/15 space-y-2">
                <label className="text-xs font-semibold text-aurora-300 uppercase tracking-wider">Facial Features & Attire</label>
                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div>Height / Build: <span className="text-teal-300">{character.height || '6 ft'} ({character.build || 'Athletic'})</span></div>
                  <div>Hair / Eyes: <span className="text-teal-300">{character.hairStyle || 'Short'} ({character.hairColor || 'Dark'}) / {character.eyeColor || 'Dark'}</span></div>
                  <div>Clothing: <span className="text-teal-300">{character.clothing || character.appearance || 'Signature attire'}</span></div>
                  <div>Distinctive Marks: <span className="text-teal-300">{character.distinctiveMarks || 'None noted'}</span></div>
                </div>
              </div>

              <div className="glass-surface p-4 rounded-xl border border-aurora-500/15 space-y-2">
                <label className="text-xs font-semibold text-aurora-300 uppercase tracking-wider">Personality & Trait Dynamics</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editedChar.personality || ''}
                    onChange={(e) => setEditedChar({ ...editedChar, personality: e.target.value })}
                    className="w-full bg-slate-900 border border-aurora-500/20 rounded p-2 text-xs text-slate-200"
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed">{character.personality || 'No personality details noted.'}</p>
                )}
              </div>

              <div className="glass-surface p-4 rounded-xl border border-aurora-500/15 space-y-2">
                <label className="text-xs font-semibold text-aurora-300 uppercase tracking-wider">Arc Trajectory Summary</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editedChar.arcSummary || ''}
                    onChange={(e) => setEditedChar({ ...editedChar, arcSummary: e.target.value })}
                    className="w-full bg-slate-900 border border-aurora-500/20 rounded p-2 text-xs text-slate-200"
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed">{character.arcSummary || 'No arc trajectory noted.'}</p>
                )}
              </div>
            </div>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};
