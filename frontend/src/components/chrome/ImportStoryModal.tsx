import React, { useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { parseStoryFile, ParsedStoryFile, extractStoryBibleLocally } from '../../lib/fileParser';
import { invokeEdgeFunction } from '../../lib/supabase';
import { X, UploadCloud, FileText, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const ImportStoryModal: React.FC = () => {
  const { isImportStoryModalOpen, setIsImportStoryModalOpen, setActiveTab } = useUIStore();
  const { importStoryProject } = useProjectStore();

  const [parsedFile, setParsedFile] = useState<ParsedStoryFile | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isImportStoryModalOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setErrorMessage('');
    setStatusMessage(`Reading ${file.name}...`);
    try {
      const parsed = await parseStoryFile(file);
      setParsedFile(parsed);
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setProjectTitle(nameWithoutExt);
      setProjectDescription(`Imported story manuscript: ${file.name}`);
    } catch (err: any) {
      setErrorMessage(`Failed to read file: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportAndAnalyze = async () => {
    if (!parsedFile || !projectTitle.trim()) return;

    setIsExtracting(true);
    setStatusMessage('Gemini 2.5 Flash analyzing characters, scenes, locations & timeline...');
    setErrorMessage('');

    try {
      let extractedData = null;
      try {
        const res = await invokeEdgeFunction('story-bible-extract', {
          scriptContent: parsedFile.text.slice(0, 25000), // pass first 25k chars for AI extraction
        });
        if (res?.extracted) {
          extractedData = res.extracted;
          // Filter out hardcoded mock data names if returned
          if (extractedData.characters) {
            extractedData.characters = extractedData.characters.filter(
              (c: any) => c.name !== 'Matteo Valenti' && c.name !== 'Elena Armani'
            );
          }
        }
      } catch (edgeErr) {
        console.warn('Edge function extraction fallback:', edgeErr);
      }

      const localExtraction = extractStoryBibleLocally(parsedFile.text);
      if (!extractedData || !extractedData.characters || extractedData.characters.length === 0) {
        extractedData = localExtraction;
      } else {
        // Merge local scene headings, character names, and locations if AI missed any
        if ((!extractedData.scenes || extractedData.scenes.length === 0) && localExtraction.scenes.length > 0) {
          extractedData.scenes = localExtraction.scenes;
        }
        if ((!extractedData.locations || extractedData.locations.length === 0) && localExtraction.locations.length > 0) {
          extractedData.locations = localExtraction.locations;
        }
        if (localExtraction.characters.length > extractedData.characters.length) {
          const existingNames = new Set(extractedData.characters.map((c: any) => c.name.toLowerCase()));
          localExtraction.characters.forEach((c) => {
            if (!existingNames.has(c.name.toLowerCase())) {
              extractedData.characters.push(c);
            }
          });
        }
      }

      // Execute import in store
      importStoryProject(
        projectTitle.trim(),
        projectDescription.trim(),
        parsedFile.text,
        extractedData
      );

      setIsImportStoryModalOpen(false);
      setActiveTab('story-bible');

      // Reset local state
      setParsedFile(null);
      setProjectTitle('');
      setProjectDescription('');
    } catch (err: any) {
      setErrorMessage(`Import error: ${err?.message || 'Failed to complete extraction'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => setIsImportStoryModalOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="max-w-xl w-full">
        <GlassSurface
          borderRadius={24}
          blur={16}
          distortionScale={-10}
          className="w-full p-6 shadow-2xl relative border border-aurora-500/30"
          width="100%"
          height="auto"
        >
          <div className="bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-obsidian-950/95 backdrop-blur-xl border border-aurora-500/25 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsImportStoryModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-aurora-400 transition p-1.5 rounded-xl hover:bg-aurora-500/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-aurora-500/20 pb-4">
              <div className="p-2.5 rounded-xl bg-aurora-500/15 border border-aurora-500/25">
                <UploadCloud className="w-5 h-5 text-aurora-300" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-100">Import Own Story File</h2>
                <p className="text-xs text-slate-400 font-mono">Upload PDF, DOCX, TXT, MD, or Fountain for instant AI Story Bible extraction</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!parsedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-aurora-500/30 hover:border-aurora-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-aurora-500/5 hover:bg-aurora-500/10 group"
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.fountain"
                  onChange={handleFileChange}
                  className="hidden"
                  id="story-file-upload"
                />
                <label htmlFor="story-file-upload" className="cursor-pointer flex flex-col items-center w-full">
                  <div className="w-12 h-12 rounded-2xl bg-aurora-500/15 border border-aurora-500/25 flex items-center justify-center text-aurora-400 group-hover:scale-110 transition-transform mb-3">
                    {isParsing ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-200 mb-1">
                    {isParsing ? statusMessage : 'Click to Upload or Drag & Drop File'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Supports .PDF, .DOCX, .TXT, .MD, .FOUNTAIN</span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl glass-surface border border-aurora-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-100">{parsedFile.fileName}</div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3 mt-0.5">
                        <span>Type: {parsedFile.fileType.toUpperCase()}</span>
                        <span>Words: {parsedFile.wordCount.toLocaleString()}</span>
                        <span>Read Time: ~{parsedFile.readingTimeMinutes} mins</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setParsedFile(null)}
                    className="text-xs text-aurora-400 hover:underline font-mono"
                  >
                    Change File
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title..."
                    className="w-full bg-obsidian-950/60 border border-aurora-500/20 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-aurora-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Logline</label>
                  <textarea
                    rows={2}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Short description of this story..."
                    className="w-full bg-obsidian-950/60 border border-aurora-500/20 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-aurora-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-aurora-400 mb-1">Extracted Text Sample Preview</label>
                  <div className="bg-obsidian-950/80 border border-aurora-500/15 rounded-xl p-3 text-xs text-slate-400 font-serif italic max-h-28 overflow-y-auto custom-scrollbar leading-relaxed">
                    "{parsedFile.text.slice(0, 350)}..."
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isExtracting || !projectTitle.trim()}
                    onClick={handleImportAndAnalyze}
                    className="w-full glass-btn py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-glow-sm"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-aurora-300" />
                        <span>{statusMessage}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-aurora-300" />
                        <span>Auto-Extract Story Bible & Import</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};
