import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { StickyNote, Plus, Pin, Trash2, Sparkles } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const NotesWidget: React.FC = () => {
  const { notes, activeProject, addNote } = useProjectStore();
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    addNote('project', activeProject?.id || '', newNoteContent.trim());
    setNewNoteContent('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <GlassSurface width="100%" height={56} borderRadius={16} className="px-6 py-3 flex items-center justify-between z-10 mb-4 shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-aurora-500/15 border border-aurora-500/25">
            <StickyNote className="w-5 h-5 text-aurora-400" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-slate-100">Pinned Story Notes</h2>
            <p className="text-xs text-slate-400 font-mono">Realtime story ideas, lore reminders & research notes</p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-300 glass-surface px-3 py-1.5 rounded-xl border border-aurora-500/20">
          {notes.length} Pinned Notes
        </span>
      </GlassSurface>

      <div className="p-6 max-w-3xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        {/* Rounded Edges Light Liquid Glass Type Input Bar */}
        <form onSubmit={handleAdd} className="mb-6">
          <div className="flex items-center gap-3 glass-surface bg-aurora-500/10 backdrop-blur-2xl p-2 rounded-full border border-aurora-500/35 shadow-2xl focus-within:border-aurora-500/60 focus-within:shadow-glow-sm transition-all">
            <div className="pl-3 text-aurora-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Type and pin a quick story idea, character insight, or lore reminder..."
              className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 px-2 py-2"
            />
            <button
              type="submit"
              className="wax-seal-btn px-6 py-2 rounded-full text-xs flex items-center gap-1.5 font-bold cursor-pointer shadow-glow-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Pin Note</span>
            </button>
          </div>
        </form>

        {/* Notes Grid - Light Liquid Glass Cards */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-1 custom-scrollbar">
          {notes.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <StickyNote className="w-10 h-10 text-aurora-500/30 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No story notes pinned yet.</p>
              <p className="text-[11px] text-slate-500">Use the rounded type bar above to pin your first story note.</p>
            </div>
          ) : (
            notes.map((note) => (
              <GlassSurface
                key={note.id}
                width="100%"
                height="auto"
                className="border border-aurora-500/25 p-4 shadow-xl relative group hover:border-aurora-500/50 transition-all rounded-[20px] glass-surface bg-aurora-500/10 backdrop-blur-xl"
              >
                {/* Pushpin Motif */}
                <div className="absolute top-3 left-4 w-5 h-5 rounded-full bg-gradient-to-br from-aurora-400 to-teal-400 border border-slate-900 flex items-center justify-center shadow-md z-10">
                  <Pin className="w-3 h-3 text-slate-950" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-aurora-300 mb-2 pt-1 pl-6 border-b border-aurora-500/15 pb-1.5">
                  <span className="uppercase font-bold tracking-wider">{note.attachedToType} Note</span>
                  <span className="text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed italic font-serif pl-1">"{note.content}"</p>
              </GlassSurface>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
