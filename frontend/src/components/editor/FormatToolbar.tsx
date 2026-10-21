import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Eraser,
  Undo, Redo, Quote, Minus, Search, Replace, Type
} from 'lucide-react';
import { GlassSelect } from '../ui/GlassSelect';
import { useEditorStore } from '../../stores/useEditorStore';

interface Props {
  editor: Editor | null;
}

const activeClass = 'bg-aurora-500/20 text-aurora-300 border-aurora-500/35 shadow-glow-sm';
const inactiveClass = 'hover:bg-aurora-500/10 text-slate-400 hover:text-aurora-400 border-transparent';

export const FormatToolbar: React.FC<Props> = ({ editor }) => {
  const { fontFamily, setFontFamily } = useEditorStore();
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  if (!editor) return null;

  const Btn: React.FC<{ isActive?: boolean; onClick: () => void; title: string; children: React.ReactNode }> = ({
    isActive = false,
    onClick,
    title,
    children,
  }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-1.5 rounded-lg transition-all border text-xs flex items-center justify-center cursor-pointer ${
        isActive ? activeClass : inactiveClass
      }`}
      title={title}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="h-4 w-px bg-aurora-500/20 mx-1" />;

  const applyScreenplayElement = (element: string) => {
    if (!editor) return;
    editor.chain().focus();
    switch (element) {
      case 'heading':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'character':
        editor.chain().focus().setParagraph().setTextAlign('center').toggleBold().run();
        break;
      case 'dialogue':
        editor.chain().focus().setParagraph().setTextAlign('center').run();
        break;
      case 'parenthetical':
        editor.chain().focus().setParagraph().setTextAlign('center').toggleItalic().run();
        break;
      case 'transition':
        editor.chain().focus().setParagraph().setTextAlign('right').toggleBold().run();
        break;
      default:
        editor.chain().focus().setParagraph().setTextAlign('left').run();
        break;
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const content = editor.getHTML();
    const regex = new RegExp(findText, 'gi');
    const updated = content.replace(regex, replaceText);
    editor.commands.setContent(updated);
  };

  return (
    <div className="flex flex-col gap-2 z-30 select-none px-4 pt-1 pb-1 w-full relative">
      {/* Primary MS Word + Screenplay Format Bar */}
      <div className="flex flex-wrap items-center gap-1.5 glass-surface px-3.5 py-1.5 rounded-2xl shadow-lg border border-aurora-500/20 relative z-30">
        {/* Undo / Redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
          <Undo className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
          <Redo className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Popular Inbuilt Screenplay & Manuscript Fonts Dropdown */}
        <div className="w-36 flex-shrink-0 relative z-40">
          <GlassSelect
            value={fontFamily}
            onChange={(val) => {
              setFontFamily(val);
              if (editor) {
                const { from, to } = editor.state.selection;
                if (from !== to) {
                  editor.chain().focus().setMark('textStyle', { fontFamily: val }).run();
                } else {
                  editor.chain().focus().selectAll().setMark('textStyle', { fontFamily: val }).run();
                }
              }
            }}
            placeholder="Font"
            options={[
              { label: 'Courier Prime', value: 'Courier Prime' },
              { label: 'Courier New', value: 'Courier New' },
              { label: 'Cinzel', value: 'Cinzel' },
              { label: 'Playfair Display', value: 'Playfair Display' },
              { label: 'Lora', value: 'Lora' },
              { label: 'Merriweather', value: 'Merriweather' },
              { label: 'Inter', value: 'Inter' },
              { label: 'Outfit', value: 'Outfit' },
              { label: 'Space Mono', value: 'Space Mono' },
              { label: 'Fira Code', value: 'Fira Code' },
            ]}
          />
        </div>

        <Divider />

        {/* Screenplay Element Presets Dropdown */}
        <div className="w-40 flex-shrink-0 relative z-40">
          <GlassSelect
            value=""
            onChange={(val) => applyScreenplayElement(val)}
            placeholder="Style Element"
            options={[
              { label: 'Scene Heading (INT/EXT)', value: 'heading' },
              { label: 'Action Paragraph', value: 'action' },
              { label: 'Character Name', value: 'character' },
              { label: 'Dialogue Block', value: 'dialogue' },
              { label: 'Parenthetical', value: 'parenthetical' },
              { label: 'Transition (FADE IN)', value: 'transition' },
            ]}
          />
        </div>

        <Divider />

        {/* Text Formatting Controls */}
        <Btn isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </Btn>
        <Btn isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </Btn>
        <Btn isActive={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </Btn>
        <Btn isActive={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough className="w-3.5 h-3.5" />
        </Btn>

        {/* Highlight Colors */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {[
            { name: 'Purple', color: 'rgba(124, 106, 237, 0.4)' },
            { name: 'Teal', color: 'rgba(20, 184, 166, 0.4)' },
            { name: 'Amber', color: 'rgba(245, 158, 11, 0.4)' },
            { name: 'Rose', color: 'rgba(244, 63, 94, 0.4)' },
          ].map((c) => (
            <button
              key={c.name}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHighlight({ color: c.color }).run();
              }}
              className="w-4 h-4 rounded-full border border-aurora-500/30 hover:scale-125 transition-transform cursor-pointer"
              style={{ backgroundColor: c.color }}
              title={`Highlight ${c.name}`}
            />
          ))}
        </div>

        <Divider />

        {/* Headings */}
        <Btn isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1 (H1)">
          <Heading1 className="w-3.5 h-3.5" />
        </Btn>
        <Btn isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2 (H2)">
          <Heading2 className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Lists & Alignment */}
        <Btn isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
          <List className="w-3.5 h-3.5" />
        </Btn>
        <Btn isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
          <ListOrdered className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        <Btn isActive={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">
          <AlignLeft className="w-3.5 h-3.5" />
        </Btn>
        <Btn isActive={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center">
          <AlignCenter className="w-3.5 h-3.5" />
        </Btn>
        <Btn isActive={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">
          <AlignRight className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Insert Elements */}
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote Block">
          <Quote className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Scene Separator Line">
          <Minus className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Find & Replace Toggle */}
        <Btn isActive={showFindReplace} onClick={() => setShowFindReplace(!showFindReplace)} title="Find & Replace">
          <Search className="w-3.5 h-3.5 text-aurora-300" />
        </Btn>

        {/* Clear Formatting */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().unsetAllMarks().clearNodes().run();
          }}
          className="p-1.5 rounded-lg hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-all border border-transparent cursor-pointer flex-shrink-0"
          title="Clear All Formatting"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Find & Replace Bar */}
      {showFindReplace && (
        <div className="glass-surface px-4 py-2 rounded-xl flex items-center gap-3 border border-aurora-500/30 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-3.5 h-3.5 text-aurora-400" />
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find text in manuscript..."
              className="bg-obsidian-950/70 border border-aurora-500/20 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-aurora-500/50 w-full"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Replace className="w-3.5 h-3.5 text-teal-400" />
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="bg-obsidian-950/70 border border-aurora-500/20 rounded-lg px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-aurora-500/50 w-full"
            />
          </div>
          <button
            onClick={handleReplaceAll}
            className="glass-btn px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Replace All
          </button>
        </div>
      )}
    </div>
  );
};
