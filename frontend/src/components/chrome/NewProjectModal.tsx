import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { X, Feather, Sparkles } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const NewProjectModal: React.FC = () => {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen } = useUIStore();
  const { createProject } = useProjectStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isNewProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createProject(title.trim(), description.trim());
    setIsNewProjectModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <GlassSurface width="100%" height="auto" className="max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={() => setIsNewProjectModalOpen(false)}
          className="absolute top-4 right-4 text-stone-400 hover:text-brass-400 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-brass-400 border-b border-brass-400/20 pb-3">
          <Feather className="w-5 h-5" />
          <h2 className="text-xl font-serif font-bold">Bind a New Manuscript</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brass-400 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Alchemist of Venice"
              className="w-full bg-obsidian-950/40 backdrop-blur-md border border-brass-400/30 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-brass-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brass-400 mb-1">
              Logline / Universe Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief overview of your story, setting, or central thematic conflict..."
              className="w-full bg-obsidian-950/40 backdrop-blur-md border border-brass-400/30 rounded px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-brass-400 resize-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-brass-400/20">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 rounded text-xs font-semibold text-stone-400 hover:text-stone-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wax-seal-btn px-5 py-2 text-xs flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bind Manuscript</span>
            </button>
          </div>
        </form>
      </GlassSurface>
    </div>
  );
};
