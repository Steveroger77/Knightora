import React from 'react';
import { useEditorStore } from '../../stores/useEditorStore';
import { Editor } from '@tiptap/react';
import { Check, X, Sparkles, Feather } from 'lucide-react';

interface Props {
  editor: Editor | null;
}

export const DiffPreviewModal: React.FC<Props> = ({ editor }) => {
  const { diffPreview, setDiffPreview } = useEditorStore();

  if (!diffPreview || !diffPreview.isOpen) return null;

  const handleAccept = () => {
    if (editor && diffPreview.modifiedText) {
      editor.commands.insertContent(diffPreview.modifiedText);
    }
    if (diffPreview.onAccept) diffPreview.onAccept();
    setDiffPreview(null);
  };

  const handleReject = () => {
    if (diffPreview.onReject) diffPreview.onReject();
    setDiffPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-obsidian-900 border border-brass-400/50 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative ink-bleed-reveal">
        <div className="flex items-center gap-2 mb-4 border-b border-brass-400/20 pb-3 text-brass-400 font-serif">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-lg font-bold">The Quill — AI Suggestion Diff Preview</h3>
          <span className="text-xs font-mono text-stone-400 ml-auto bg-obsidian-950 px-2 py-0.5 rounded border border-brass-400/20">
            Action: {diffPreview.action}
          </span>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <div className="text-xs uppercase font-semibold text-crimson-500 mb-1 tracking-wider">
              Original Text (To be replaced)
            </div>
            <div className="p-3 bg-obsidian-950 border border-crimson-600/30 rounded text-xs font-mono text-stone-400 line-through leading-relaxed">
              {diffPreview.originalText}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-semibold text-emerald-400 mb-1 tracking-wider">
              AI Proposed Replacement
            </div>
            <div className="p-3 bg-obsidian-950 border border-emerald-500/40 rounded text-xs font-mono text-stone-100 leading-relaxed">
              {diffPreview.modifiedText}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-brass-400/20">
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-obsidian-950 border border-crimson-600/40 text-crimson-500 rounded text-xs font-semibold hover:bg-crimson-600/20 flex items-center gap-1.5 transition"
          >
            <X className="w-4 h-4" /> Reject Edit
          </button>
          <button
            onClick={handleAccept}
            className="wax-seal-btn px-5 py-2 text-xs flex items-center gap-1.5 font-bold"
          >
            <Check className="w-4 h-4" /> Accept & Replace
          </button>
        </div>
      </div>
    </div>
  );
};
