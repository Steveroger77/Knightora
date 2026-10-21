import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useEditorStore } from '../../stores/useEditorStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { TheQuillContextMenu } from '../quill/TheQuillContextMenu';
import { DiffPreviewModal } from './DiffPreviewModal';
import { FormatToolbar } from './FormatToolbar';
import { Save, History, Columns, Maximize2, Minimize2, Download, BookOpen, Edit3 } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const FontFamilyExtension = Extension.create({
  name: 'fontFamily',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily?.replace(/['"]/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },
});

export const ScreenplayEditor: React.FC = () => {
  const { activeScript, updateScriptContent } = useProjectStore();
  const { editorMode, fontFamily, setEditorMode, isSaving, setIsSaving, lastSavedAt, setLastSavedAt, setSelectedText, setIsVersionHistoryOpen } = useEditorStore();
  const { isSplitView, toggleSplitView, maximizedPanel, toggleMaximizedPanel, isDistractionFree, setDistractionFree, toggleDistractionFree, setActiveTab } = useUIStore();
  const autoSaveTimeoutRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      CharacterCount,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontFamilyExtension,
      Color,
    ],
    content: activeScript?.content || '',
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const readingTime = Math.ceil(wordCount / 200);
      updateScriptContent(json, wordCount, readingTime);
      setIsSaving(true);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(() => { setIsSaving(false); setLastSavedAt(new Date()); }, 2000);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) { setSelectedText('', null); return; }
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text && text.trim().length > 0) {
        const domSel = window.getSelection();
        if (domSel && domSel.rangeCount > 0) {
          const rect = domSel.getRangeAt(0).getBoundingClientRect();
          setSelectedText(text, { top: rect.top, left: rect.left + rect.width / 2 });
        }
      } else { setSelectedText('', null); }
    },
  });

  useEffect(() => {
    if (editor && activeScript?.content) {
      const currentJson = JSON.stringify(editor.getJSON());
      const targetJson = JSON.stringify(activeScript.content);
      if (currentJson !== targetJson) {
        editor.commands.setContent(activeScript.content);
      }
    }
  }, [editor, activeScript?.id, activeScript?.content]);

  if (!editor) return null;
  const wordCount = editor.storage?.characterCount?.words?.() || 0;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));

  const handleDownloadScript = () => {
    const text = editor.getText();
    const title = activeScript?.title || 'Untitled';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEnterReadMode = () => {
    setEditorMode('prose');
    setDistractionFree(true);
  };

  const handleExitReadMode = () => {
    setActiveTab('script');
    setDistractionFree(false);
  };

  // Full-Screen Edge-to-Edge Ambient Read Mode (Zero Dark Shade Glitch, Uniform Blur View)
  if (isDistractionFree) {
    return (
      <div className="fixed inset-0 z-[100] w-screen h-screen overflow-y-auto prose-mode backdrop-blur-2xl bg-black/15 animate-in fade-in duration-200 custom-scrollbar">
        {/* Floating Top Left Minimize Control */}
        <div className="fixed top-6 left-6 z-50">
          <GlassSurface borderRadius={16} width="auto" height="auto" className="shadow-2xl border border-aurora-500/30">
            <button
              onClick={handleExitReadMode}
              className="px-4 py-2 text-xs font-bold text-aurora-300 hover:text-white hover:bg-aurora-500/20 transition-all flex items-center gap-2 cursor-pointer shadow-glow-sm"
              title="Minimize to Default Write Mode"
            >
              <Minimize2 className="w-4 h-4 text-aurora-400" />
              <span>Exit Read Mode</span>
            </button>
          </GlassSurface>
        </div>

        {/* Centered Continuously-Scrolling Story Page Manuscript (Single Document Scroll, 100% Full Story Enclosed) */}
        <div className="w-full min-h-screen px-4 pt-24 pb-48 flex justify-center relative z-10">
          <div className="w-full max-w-[800px] h-auto bg-slate-900/60 border border-aurora-500/30 backdrop-blur-2xl rounded-3xl p-8 md:p-14 shadow-2xl relative mb-32">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-widest mb-8 pb-3 border-b border-aurora-500/15 select-none">
              <span className="flex items-center gap-2 text-aurora-300 font-bold">
                <BookOpen className="w-4 h-4 text-teal-400" /> {activeScript?.title || 'Story Reader'}
              </span>
              <span>Ambient Story Reader</span>
            </div>
            <div style={{ fontFamily: `'${fontFamily}', 'Courier Prime', monospace, serif` }} className="w-full h-auto leading-relaxed break-words">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <TheQuillContextMenu editor={editor} />
        <DiffPreviewModal editor={editor} />
      </div>
    );
  }

  // Default Write Mode
  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${editorMode === 'screenplay' ? 'screenplay-mode' : 'prose-mode'}`}>
      {/* Top Toolbar Container with padded wrapper so right rounded corners are unclipped */}
      <div className="px-4 pt-4 pb-1 w-full">
        <GlassSurface width="100%" height={52} borderRadius={16} className="px-5 py-2.5 flex items-center justify-between z-10 select-none shadow-xl">
          <div className="flex items-center gap-4">
            <span className="font-serif font-bold text-sm text-aurora-300 truncate max-w-xs">{activeScript?.title || 'Untitled Manuscript'}</span>
            <div className="glass-surface rounded-lg p-0.5 flex items-center">
              <button
                onClick={() => setEditorMode('screenplay')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${editorMode === 'screenplay' ? 'bg-aurora-500/20 text-aurora-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Screenplay</span>
              </button>
              <button
                onClick={handleEnterReadMode}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${editorMode === 'prose' ? 'bg-aurora-500/20 text-aurora-300 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Full-Screen Distraction-Free Reader Mode"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>Read</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
            <button onClick={toggleSplitView} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${isSplitView ? 'bg-aurora-500/15 text-aurora-300 border-aurora-500/30 shadow-glow-sm' : 'glass-surface text-slate-400 hover:text-aurora-400 hover:bg-aurora-500/10'}`}>
              <Columns className="w-3.5 h-3.5" /><span>{isSplitView ? 'Exit Split' : 'Split View'}</span>
            </button>
            <button onClick={() => isSplitView ? toggleMaximizedPanel('left') : toggleDistractionFree()} className="p-1.5 rounded-lg glass-surface text-slate-400 hover:text-aurora-400 hover:bg-aurora-500/10 transition-all">
              {(isSplitView && maximizedPanel === 'left') || (!isSplitView && isDistractionFree) ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <div className="h-4 w-px bg-aurora-500/20" />
            <div className="flex items-center gap-1.5">
              <Save className={`w-3.5 h-3.5 ${isSaving ? 'text-aurora-400 animate-pulse' : 'text-emerald-400'}`} />
              <span className="font-mono text-[11px]">{isSaving ? 'Saving...' : 'Saved'}</span>
            </div>

            <div className="h-4 w-px bg-aurora-500/20" />

            {/* Liquid Glass Block for History */}
            <GlassSurface borderRadius={12} width="auto" height="auto">
              <button onClick={() => setIsVersionHistoryOpen(true)} className="px-2.5 py-1 text-aurora-400 hover:bg-aurora-500/10 transition-all flex items-center gap-1.5 cursor-pointer" title="Version History">
                <History className="w-3.5 h-3.5 text-aurora-400" />
                <span className="font-mono text-[11px] text-slate-200">History</span>
              </button>
            </GlassSurface>

            {/* Liquid Glass Block for Download */}
            <GlassSurface borderRadius={12} width="auto" height="auto">
              <button onClick={handleDownloadScript} className="px-2.5 py-1 text-teal-400 hover:bg-teal-500/10 transition-all flex items-center gap-1.5 cursor-pointer" title="Download Script (.txt)">
                <Download className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-mono text-[11px] text-slate-200">Download</span>
              </button>
            </GlassSurface>

            <div className="h-4 w-px bg-aurora-500/20" />
            <span className="font-mono text-[11px]">{wordCount.toLocaleString()} words</span>

            {/* Liquid Glass Block for Page Count Badge (p.1) */}
            <GlassSurface borderRadius={12} width="auto" height="auto">
              <span className="px-2.5 py-1 text-aurora-400 font-mono text-[11px] font-bold block">
                p.{estimatedPages}
              </span>
            </GlassSurface>
          </div>
        </GlassSurface>
      </div>

      <FormatToolbar editor={editor} />

      <div className="flex-1 overflow-y-auto px-4 py-8 flex justify-center custom-scrollbar">
        <GlassSurface className="w-full max-w-[740px] parchment-page p-10 md:p-14 relative min-h-[1050px] mb-12" width="100%" height="auto">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-widest mb-6 pb-2 border-b border-aurora-500/10 select-none">
            <span>Knightora · {editorMode === 'prose' ? 'Prose' : 'Screenplay'}</span>
          </div>
          <div style={{ fontFamily: `'${fontFamily}', Courier Prime, monospace, serif` }}>
            <EditorContent editor={editor} />
          </div>
        </GlassSurface>
      </div>

      <TheQuillContextMenu editor={editor} />
      <DiffPreviewModal editor={editor} />
    </div>
  );
};
