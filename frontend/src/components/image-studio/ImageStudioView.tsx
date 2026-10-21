import React, { useState, useEffect, useMemo } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useAIStore } from '../../stores/useAIStore';
import { useUIStore } from '../../stores/useUIStore';
import { AIProviderService } from '../../lib/aiProviderService';
import { ImageLightboxModal } from './ImageLightboxModal';
import { GeneratedImage, Character } from '../../types';
import {
  Image as ImageIcon, Sparkles, Download, Zap, Maximize2, Minimize2, X, Eye, Loader2, Trash2,
  Users, MapPin, Film, Layers, ShieldCheck, Lock, CheckCircle2
} from 'lucide-react';
import { GlassSelect } from '../ui/GlassSelect';
import { GlassSurface } from '../ui/GlassSurface';

export const ImageStudioView: React.FC = () => {
  const { activeProject, characters, locations, scenes, generatedImages, addGeneratedImage, deleteGeneratedImage } = useProjectStore();
  const { addNeuronCost } = useAIStore();
  const { pendingImagePrompt, setPendingImagePrompt, isSplitView, toggleSplitView, maximizedPanel, toggleMaximizedPanel, isDistractionFree, toggleDistractionFree } = useUIStore();

  const [promptText, setPromptText] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'Character' | 'Location' | 'Scene'>('all');

  const [stylePreset, setStylePreset] = useState('Cinematic');
  const [cameraAngle, setCameraAngle] = useState('Wide Shot');
  const [lens, setLens] = useState('35mm');
  const [lighting, setLighting] = useState('Neon');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [steps, setSteps] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatusText, setGenerationStatusText] = useState('');
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (pendingImagePrompt) {
      setPromptText(pendingImagePrompt);
      setPendingImagePrompt('');
    }
  }, [pendingImagePrompt]);

  let width = 1024, height = 576;
  if (aspectRatio === '1:1') { width = 768; height = 768; }
  else if (aspectRatio === '9:16') { width = 576; height = 1024; }
  else if (aspectRatio === '2.39:1') { width = 1024; height = 432; }
  const tiles = Math.ceil(width / 512) * Math.ceil(height / 512);
  const estimatedNeurons = Math.round((tiles * 4.8) + (steps * 9.6));

  const styles = ['Cinematic', 'Realistic', 'Storyboard', 'Concept Art', 'Noir', 'Cyberpunk', 'Fantasy', 'Watercolor', 'Oil Painting', 'Sketch', 'Comic', 'Anime', 'Vintage'];

  // Automatic Character Recognition Engine
  const autoDetectedCharacters = useMemo(() => {
    if (!promptText.trim()) return [];
    const lowerP = promptText.toLowerCase();
    return characters.filter((c) => {
      const firstName = c.name.split(' ')[0].toLowerCase();
      const fullName = c.name.toLowerCase();
      return (
        fullName.length > 2 && (lowerP.includes(fullName) || lowerP.includes(firstName))
      );
    });
  }, [promptText, characters]);

  const selectedCharacter = useMemo(() => {
    if (selectedCharacterId) return characters.find((c) => c.id === selectedCharacterId);
    if (autoDetectedCharacters.length === 1) return autoDetectedCharacters[0];
    return null;
  }, [characters, selectedCharacterId, autoDetectedCharacters]);

  const selectedLocation = useMemo(() => locations.find((l) => l.id === selectedLocationId), [locations, selectedLocationId]);
  const selectedScene = useMemo(() => scenes.find((s) => s.id === selectedSceneId), [scenes, selectedSceneId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationStatusText('Initializing FLUX.1 with Character Consistency Engine...');

    const p1 = setTimeout(() => { setGenerationProgress(30); setGenerationStatusText('Building visual prompt for FLUX engine...'); }, 1500);
    const p2 = setTimeout(() => { setGenerationProgress(50); setGenerationStatusText('Locking character visual seeds & latents...'); }, 4000);
    const p3 = setTimeout(() => { setGenerationProgress(70); setGenerationStatusText('Rendering high-fidelity artwork details...'); }, 8000);
    const p4 = setTimeout(() => { setGenerationProgress(85); setGenerationStatusText('Finalizing image...'); }, 15000);

    // Compute character consistency seed integer if single character is targeted
    const charSeed = selectedCharacter
      ? Math.abs(selectedCharacter.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 1009) % 1000000
      : null;

    // Build multi-character or single character visual consistency string
    let charNameStr = selectedCharacter?.name || '';
    let charAppStr = selectedCharacter?.appearance || selectedCharacter?.description || '';

    if (!selectedCharacter && autoDetectedCharacters.length > 1) {
      charNameStr = autoDetectedCharacters.map((c) => c.name).join(', ');
      charAppStr = autoDetectedCharacters
        .map((c) => `${c.name} ${c.appearance || c.description || ''}`)
        .join(', ');
    }

    // Determine auto-category
    let determinedCategory: 'Character' | 'Location' | 'Scene' | 'General' = 'General';
    if (selectedCharacterId || autoDetectedCharacters.length > 0) determinedCategory = 'Character';
    else if (selectedLocationId) determinedCategory = 'Location';
    else if (selectedSceneId) determinedCategory = 'Scene';
    else {
      const lowerP = promptText.toLowerCase();
      if (lowerP.includes('portrait') || lowerP.includes('character') || lowerP.includes('person') || lowerP.includes('face')) {
        determinedCategory = 'Character';
      } else if (lowerP.includes('room') || lowerP.includes('building') || lowerP.includes('landscape') || lowerP.includes('interior') || lowerP.includes('exterior') || lowerP.includes('city')) {
        determinedCategory = 'Location';
      } else if (lowerP.includes('scene') || lowerP.includes('action') || lowerP.includes('shot')) {
        determinedCategory = 'Scene';
      }
    }

    const primaryCharId = selectedCharacter?.id || (autoDetectedCharacters[0]?.id || null);

    try {
      // Build a clean text prompt — no brackets, no CHAR codes, just natural language
      const parts: string[] = [];
      if (promptText.trim()) parts.push(promptText.trim());
      if (charNameStr) parts.push(`featuring ${charNameStr}`);
      if (charAppStr) parts.push(charAppStr);
      if (selectedLocation?.name) parts.push(`set in ${selectedLocation.name}`);
      if (selectedLocation?.atmosphere) parts.push(selectedLocation.atmosphere);
      const fullPrompt = parts.join(', ');

      const generated = await AIProviderService.generateImage({
        featureId: 'artworkStudio',
        prompt: fullPrompt,
        stylePreset,
        aspectRatio,
        characterSeed: charSeed,
        characterName: charNameStr,
        characterAppearance: charAppStr,
      });

      clearTimeout(p1); clearTimeout(p2); clearTimeout(p3); clearTimeout(p4);
      setGenerationProgress(100);
      setGenerationStatusText('Complete');
      setTimeout(() => { setIsGenerating(false); setGenerationProgress(0); }, 400);

      if (generated?.imageUrl) {
        const newImg: GeneratedImage = {
          id: crypto.randomUUID(),
          projectId: activeProject?.id || '',
          sceneId: selectedSceneId || null,
          characterId: primaryCharId || null,
          locationId: selectedLocationId || null,
          category: determinedCategory,
          imageUrl: generated.imageUrl,
          prompt: promptText || fullPrompt || 'Generated Artwork',
          stylePreset,
          cameraAngle,
          lens,
          lighting,
          aspectRatio,
          steps,
          createdAt: new Date().toISOString(),
        };

        addGeneratedImage(newImg);
        addNeuronCost(estimatedNeurons);
      }
    } catch (err) {
      console.error('[Artwork Studio] Image generation error:', err);
      clearTimeout(p1); clearTimeout(p2); clearTimeout(p3); clearTimeout(p4);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleDownload = async (url: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      let downloadUrl = url;
      if (!url.startsWith('data:')) {
        const response = await fetch(url);
        const blob = await response.blob();
        downloadUrl = window.URL.createObjectURL(blob);
      }
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (!url.startsWith('data:')) window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const filteredImages = useMemo(() => {
    if (activeCategoryTab === 'all') return generatedImages;
    return generatedImages.filter(
      (img) =>
        img.category === activeCategoryTab ||
        (activeCategoryTab === 'Character' && img.characterId) ||
        (activeCategoryTab === 'Location' && img.locationId) ||
        (activeCategoryTab === 'Scene' && img.sceneId)
    );
  }, [generatedImages, activeCategoryTab]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <GlassSurface width="100%" height={56} borderRadius={16} className="px-6 py-3 flex items-center justify-between z-10 mb-4 select-none shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-500/20 to-teal-500/20 flex items-center justify-center border border-aurora-500/20">
            <ImageIcon className="w-4 h-4 text-aurora-400" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-sm text-aurora-300 flex items-center gap-2">
              Artwork Studio
              <span className="text-[10px] font-mono text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded border border-teal-500/25">
                Model: {AIProviderService.getEffectiveModelConfig('artworkStudio').modelId}
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-400" /> Permanent Character Identity Locking Active
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="glass-surface border border-aurora-500/20 rounded-xl p-1 flex items-center gap-1">
          {[
            { id: 'all', label: `All (${generatedImages.length})`, icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'Character', label: `Characters (${generatedImages.filter(i => i.category === 'Character' || i.characterId).length})`, icon: <Users className="w-3.5 h-3.5 text-aurora-400" /> },
            { id: 'Location', label: `Locations (${generatedImages.filter(i => i.category === 'Location' || i.locationId).length})`, icon: <MapPin className="w-3.5 h-3.5 text-teal-400" /> },
            { id: 'Scene', label: `Scenes (${generatedImages.filter(i => i.category === 'Scene' || i.sceneId).length})`, icon: <Film className="w-3.5 h-3.5 text-aurora-400" /> },
          ].map((tab) => {
            const isActive = activeCategoryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id as any)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-aurora-500/25 text-aurora-200 border border-aurora-500/40 shadow-glow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-obsidian-950/60 px-2.5 py-1 rounded-md border border-aurora-500/15">
            <Zap className="w-3.5 h-3.5 text-teal-400" />~{estimatedNeurons} neurons
          </div>
          <button onClick={() => isSplitView ? toggleMaximizedPanel('right') : toggleDistractionFree()} className="p-1.5 rounded-lg glass-surface text-slate-400 hover:text-aurora-400 hover:bg-aurora-500/10 transition-all">
            {(isSplitView && maximizedPanel === 'right') || (!isSplitView && isDistractionFree) ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {isSplitView && <button onClick={toggleSplitView} className="p-1.5 rounded-lg glass-surface text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </GlassSurface>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Generation Sidebar */}
        <GlassSurface width="18rem" height="100%" className="z-10 p-4 overflow-y-auto space-y-4 custom-scrollbar flex-shrink-0 mr-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Image Prompt</label>
            <textarea
              rows={4}
              placeholder="Describe scene, character action, or location atmosphere..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-obsidian-950/60 border border-aurora-500/20 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-aurora-500/50 focus:shadow-glow-sm resize-none transition-all"
            />
          </div>

          {/* Automatic Character Recognition Alert Box */}
          {autoDetectedCharacters.length > 0 && !selectedCharacterId && (
            <div className="p-2.5 rounded-xl bg-aurora-500/15 border border-aurora-500/30 text-xs text-aurora-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase text-aurora-300">
                <Lock className="w-3 h-3 text-teal-400" />
                {autoDetectedCharacters.length === 1
                  ? 'Auto-Recognized Character Identity'
                  : 'Multi-Character Scene Lock'}
              </div>
              <div className="flex flex-wrap gap-1">
                {autoDetectedCharacters.map((c) => (
                  <span key={c.id} className="px-2 py-0.5 rounded-md bg-aurora-500/25 border border-aurora-500/40 text-[10px] font-mono text-white flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-teal-300" />
                    {c.characterCode || 'CHAR'}: {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Character & Location Lockers */}
          <div className="space-y-3 p-3 bg-aurora-500/10 border border-aurora-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-aurora-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-400" /> Character & Location Anchors
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-semibold flex items-center gap-1">
                <Users className="w-3 h-3 text-aurora-400" /> Target Character
              </label>
              <GlassSelect
                value={selectedCharacterId}
                onChange={setSelectedCharacterId}
                options={[
                  { label: autoDetectedCharacters.length > 0 ? `Auto (${autoDetectedCharacters.map(c => c.name).join(', ')})` : 'None (Scene Only)', value: '' },
                  ...characters.map((c) => ({ label: `👤 ${c.characterCode || 'CHAR'} - ${c.name}`, value: c.id }))
                ]}
                className="w-full text-xs"
              />
              {selectedCharacter && (
                <div className="mt-1.5 p-2 rounded bg-obsidian-950/70 border border-aurora-500/20 text-[10px] text-slate-300 space-y-0.5 font-mono">
                  <div className="font-bold text-aurora-300">{selectedCharacter.characterCode || 'CHAR'}: {selectedCharacter.name}</div>
                  <div className="text-teal-400 truncate">Appearance: {selectedCharacter.appearance || selectedCharacter.description}</div>
                  <div className="text-slate-400">Hair: {selectedCharacter.hairColor || 'Dark'} | Eyes: {selectedCharacter.eyeColor || 'Dark'}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" /> Target Location
              </label>
              <GlassSelect
                value={selectedLocationId}
                onChange={setSelectedLocationId}
                options={[
                  { label: 'None', value: '' },
                  ...locations.map((l) => ({ label: `📍 ${l.name}`, value: l.id }))
                ]}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-semibold flex items-center gap-1">
                <Film className="w-3 h-3 text-aurora-400" /> Scene Context
              </label>
              <GlassSelect
                value={selectedSceneId}
                onChange={setSelectedSceneId}
                options={[
                  { label: 'None', value: '' },
                  ...scenes.map((s) => ({ label: `🎬 #${s.sceneNumber} ${s.title}`, value: s.id }))
                ]}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2 tracking-wider">Aesthetic Style</label>
            <div className="flex flex-wrap gap-1.5">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStylePreset(s)}
                  className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all border ${
                    stylePreset === s
                      ? 'bg-aurora-500/20 border-aurora-500/40 text-aurora-300 shadow-glow-sm font-semibold'
                      : 'glass-surface text-slate-400 hover:text-slate-200 hover:border-aurora-500/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Camera', value: cameraAngle, setter: setCameraAngle, opts: ['Wide Shot', 'Close-Up', 'Over-the-Shoulder', "Bird's Eye", 'Dutch Angle'] },
              { label: 'Lens', value: lens, setter: setLens, opts: ['35mm', '50mm', 'Anamorphic', 'Fisheye', 'Macro'] },
              { label: 'Lighting', value: lighting, setter: setLighting, opts: ['Golden Hour', 'Candlelit', 'Moonlit', 'Neon', 'Overcast'] },
              { label: 'Ratio', value: aspectRatio, setter: setAspectRatio, opts: ['16:9', '1:1', '9:16', '2.39:1'] },
            ].map(({ label, value, setter, opts }) => (
              <div key={label}>
                <label className="block text-[11px] text-slate-400 mb-1 font-semibold">{label}</label>
                <GlassSelect
                  value={value}
                  onChange={setter}
                  options={opts.map((o) => ({ label: o, value: o }))}
                  className="w-full text-xs"
                />
              </div>
            ))}
          </div>

          <button
            disabled={isGenerating}
            onClick={handleGenerate}
            className="glass-btn w-full py-3 text-sm flex items-center justify-center gap-2 mt-4 font-bold cursor-pointer shadow-lg"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? 'Generating Artwork...' : 'Generate Artwork'}
          </button>
        </GlassSurface>

        {/* Right Artwork Gallery */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isGenerating && (
              <GlassSurface width="100%" height="auto" className="p-6 flex flex-col items-center justify-center min-h-[250px] border-aurora-500/30 shadow-glow-sm ink-bleed-reveal">
                <Loader2 className="w-8 h-8 text-aurora-400 animate-spin mb-4" />
                <div className="font-semibold text-sm text-slate-200 mb-1">{generationStatusText}</div>
                <div className="text-xs font-mono text-aurora-400/70 mb-4">{generationProgress}%</div>
                <div className="w-full bg-obsidian-950/80 rounded-full h-1.5 overflow-hidden border border-aurora-500/20">
                  <div className="bg-gradient-to-r from-aurora-600 to-teal-400 h-full rounded-full transition-all duration-300" style={{ width: `${generationProgress}%` }} />
                </div>
              </GlassSurface>
            )}

            {filteredImages.length === 0 && !isGenerating ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <ImageIcon className="w-12 h-12 text-aurora-500/30" />
                <p className="text-sm font-semibold text-slate-300">No artwork found for this filter tab.</p>
                <p className="text-xs text-slate-500">Generate a new character, location, or scene artwork to automatically populate this section.</p>
              </div>
            ) : (
              filteredImages.map((img) => {
                const charEntity = characters.find((c) => c.id === img.characterId);
                const locEntity = locations.find((l) => l.id === img.locationId);
                const sceneEntity = scenes.find((s) => s.id === img.sceneId);

                return (
                  <GlassSurface key={img.id} width="100%" height="auto" className="overflow-hidden group cursor-pointer relative hover:shadow-glow-md">
                    <div onClick={() => setSelectedLightboxImage(img)} className="w-full h-full relative">
                      <img
                        src={img.imageUrl}
                        alt={img.prompt}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-800/50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const fallbackSeed = Math.floor(Math.random() * 899999) + 100000;
                          const cleanAlt = (img.prompt || 'Cinematic story scene').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
                          const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanAlt)}?seed=${fallbackSeed}&width=1024&height=576&nologo=true`;
                          if (target.src !== fallbackUrl) {
                            target.src = fallbackUrl;
                          }
                        }}
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedLightboxImage(img); }} className="bg-obsidian-950/80 backdrop-blur-md border border-aurora-500/30 p-2 rounded-lg text-aurora-300 hover:text-white hover:bg-aurora-500/20 transition-all" title="View Fullscreen"><Eye className="w-4 h-4" /></button>
                        <button onClick={(e) => handleDownload(img.imageUrl, img.stylePreset || 'art', e)} className="bg-obsidian-950/80 backdrop-blur-md border border-teal-500/30 p-2 rounded-lg text-teal-300 hover:text-white hover:bg-teal-500/20 transition-all" title="Download Image"><Download className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteGeneratedImage(img.id); }} className="bg-obsidian-950/80 backdrop-blur-md border border-rose-500/30 p-2 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/30 transition-all" title="Delete Image"><Trash2 className="w-4 h-4" /></button>
                      </div>

                      <div className="p-4 space-y-2 relative z-10 bg-gradient-to-t from-obsidian-950/90 to-transparent">
                        <div className="flex items-center justify-between text-[11px] font-mono font-semibold">
                          <span className="text-aurora-400 bg-aurora-500/10 px-2 py-0.5 rounded border border-aurora-500/20">{img.stylePreset || 'FLUX'}</span>
                          <span className="text-teal-400">{img.aspectRatio}</span>
                        </div>

                        {/* Automatic Category & Entity Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {(img.category === 'Character' || charEntity) && (
                            <span className="text-[10px] font-semibold bg-aurora-500/20 text-aurora-300 border border-aurora-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <Users className="w-3 h-3" /> {charEntity ? `${charEntity.characterCode || 'CHAR'}: ${charEntity.name}` : 'Character'}
                            </span>
                          )}
                          {(img.category === 'Location' || locEntity) && (
                            <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <MapPin className="w-3 h-3" /> {locEntity ? locEntity.name : 'Location'}
                            </span>
                          )}
                          {(img.category === 'Scene' || sceneEntity) && (
                            <span className="text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <Film className="w-3 h-3" /> {sceneEntity ? `#${sceneEntity.sceneNumber} ${sceneEntity.title}` : 'Scene'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 italic font-serif leading-snug">"{img.prompt}"</p>
                      </div>
                    </div>
                  </GlassSurface>
                );
              })
            )}
          </div>
        </div>
      </div>
      <ImageLightboxModal image={selectedLightboxImage} onClose={() => setSelectedLightboxImage(null)} />
    </div>
  );
};
