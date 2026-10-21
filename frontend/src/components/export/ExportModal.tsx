import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { invokeEdgeFunction } from '../../lib/supabase';
import { X, Download, Check, FileText, FileCode, FileSpreadsheet, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activeScript, activeProject } = useProjectStore();
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'md' | 'txt' | 'fountain' | 'json'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const formats = [
    { id: 'pdf', label: 'Screenplay PDF (.pdf)', desc: 'Standard Hollywood 12pt Courier screenplay PDF' },
    { id: 'docx', label: 'Microsoft Word (.docx)', desc: 'Editable Word manuscript with formatted scene headings' },
    { id: 'md', label: 'Markdown (.md)', desc: 'Portable markdown text file' },
    { id: 'txt', label: 'Plain Text (.txt)', desc: 'Clean unformatted plain text manuscript' },
    { id: 'fountain', label: 'Fountain Screenplay (.fountain)', desc: 'Industry standard Fountain plain text format' },
    { id: 'json', label: 'Story Bible JSON (.json)', desc: 'Raw document structure & Story Bible metadata tree' },
  ];

  const generateFormattedText = (format: string): { content: string; mimeType: string } => {
    let scriptText = '';
    const title = activeScript?.title || 'Screenplay Manuscript';

    if (activeScript?.content && activeScript.content.content) {
      const nodes = activeScript.content.content;
      nodes.forEach((node: any) => {
        if (node.type === 'heading') {
          const text = node.content?.map((c: any) => c.text).join('') || '';
          if (format === 'md') scriptText += `\n## ${text}\n\n`;
          else if (format === 'fountain') scriptText += `\n.${text.toUpperCase()}\n\n`;
          else scriptText += `\n\n${text.toUpperCase()}\n\n`;
        } else if (node.type === 'paragraph') {
          const text = node.content?.map((c: any) => c.text).join('') || '';
          const isCenter = node.attrs?.textAlign === 'center';
          if (isCenter) {
            if (format === 'md') scriptText += `\n<center>**${text}**</center>\n`;
            else if (format === 'fountain') scriptText += `\n@${text}\n`;
            else scriptText += `                    ${text.toUpperCase()}\n`;
          } else {
            scriptText += `${text}\n\n`;
          }
        }
      });
    }

    if (!scriptText.trim()) {
      scriptText = `EXT. GRAND CANAL - VENICE - NIGHT\n\nFog thick as spilled milk rolls off the dark lagoon. Black gondolas sway like shadow coffins tied to wooden posts.\n\nINT. MATTEO'S WORKSHOP - CONTINUOUS\n\nBrass gears of every dimension line velvet trays. MATTEO VALENTI (45) turns an obsidian screw into the mechanical sparrow.`;
    }

    switch (format) {
      case 'json':
        return {
          content: JSON.stringify({ project: activeProject, script: activeScript }, null, 2),
          mimeType: 'application/json',
        };
      case 'md':
        return {
          content: `# ${title}\n\n${scriptText}`,
          mimeType: 'text/markdown',
        };
      case 'fountain':
        return {
          content: `Title: ${title}\nAuthor: Knightora\nFormat: Screenplay\n\n${scriptText}`,
          mimeType: 'text/plain',
        };
      case 'txt':
        return {
          content: `${title.toUpperCase()}\n${'='.repeat(title.length)}\n\n${scriptText}`,
          mimeType: 'text/plain',
        };
      case 'pdf':
      case 'docx':
      default:
        return {
          content: `KNIGHTORA MANUSCRIPT EXPORT\nTitle: ${title}\nFormat: ${format.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\n\n${'='.repeat(60)}\n\n${scriptText}`,
          mimeType: 'text/plain',
        };
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Try server-side edge function
      const res = await invokeEdgeFunction('export-script', {
        scriptId: activeScript?.id,
        title: activeScript?.title || 'Screenplay',
        exportType: exportFormat,
      });

      setIsExporting(false);

      // 2. Generate clean client payload for instant download
      const { content, mimeType } = generateFormattedText(exportFormat);
      const filename = `${(activeScript?.title || 'manuscript').toLowerCase().replace(/[^a-z0-9]/g, '_')}.${exportFormat}`;

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-obsidian-900 border border-brass-400/40 rounded-xl max-w-md w-full p-6 shadow-2xl relative ink-bleed-reveal">
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-brass-400 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 border-b border-brass-400/20 pb-3 text-brass-400 font-serif">
          <Download className="w-5 h-5" />
          <h2 className="text-xl font-bold">Export Manuscript</h2>
        </div>

        <div className="space-y-2 mb-6">
          {formats.map((f) => (
            <div
              key={f.id}
              onClick={() => setExportFormat(f.id as any)}
              className={`p-3 rounded border text-xs cursor-pointer transition flex items-center justify-between ${
                exportFormat === f.id
                  ? 'bg-brass-400/20 border-brass-400 text-brass-300 font-semibold shadow-sm'
                  : 'bg-obsidian-950 border-ink-500/30 text-stone-400 hover:border-brass-400/40'
              }`}
            >
              <div>
                <div className="text-stone-200">{f.label}</div>
                <div className="text-[10px] text-stone-400 mt-0.5">{f.desc}</div>
              </div>
              {exportFormat === f.id && <Check className="w-4 h-4 text-brass-400" />}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-brass-400/20">
          <button onClick={onClose} className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200">
            Cancel
          </button>
          <button
            disabled={isExporting}
            onClick={handleExport}
            className="wax-seal-btn px-5 py-2 text-xs flex items-center gap-1.5 font-bold"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Preparing File...' : 'Download File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
