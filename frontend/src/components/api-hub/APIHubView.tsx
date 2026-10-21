import React, { useState, useMemo } from 'react';
import { useAPIHubStore, ALL_TEXT_MODELS, ALL_IMAGE_MODELS } from '../../stores/useAPIHubStore';
import { AIModel, AIProviderId, AIFeatureId } from '../../types';
import { GlassSurface } from '../ui/GlassSurface';
import { GlassSelect } from '../ui/GlassSelect';
import {
  Cpu, Sparkles, Key, ShieldCheck, Zap, RefreshCw, CheckCircle2, AlertCircle, Eye, EyeOff,
  Flame, Image as ImageIcon, MessageSquare, Layers, Lock, Sliders, Activity, Server, Radio,
  ArrowRight, RefreshCw as RotateCcw, Check, X, ShieldAlert, ChevronRight, CheckCircle, Search,
  Target, Award
} from 'lucide-react';

export const APIHubView: React.FC = () => {
  const {
    operatingMode,
    providerConfigs,
    featureAssignments,
    fallbackChain,
    metrics,
    setOperatingMode,
    setProviderApiKey,
    testProviderConnection,
    setProviderActiveModel,
    setFeatureAssignment,
    resetAllToDefaults,
  } = useAPIHubStore();

  const [activeSectionTab, setActiveSectionTab] = useState<'popular' | 'text' | 'image' | 'features' | 'keys' | 'fallback'>('popular');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyInputValues, setKeyInputValues] = useState<Record<string, string>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, boolean>>({});
  const [activatedSuccessMsg, setActivatedSuccessMsg] = useState<string | null>(null);

  const toggleShowKey = (providerId: string) => {
    setShowKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleKeyInputChange = (providerId: string, val: string) => {
    setKeyInputValues((prev) => ({ ...prev, [providerId]: val }));
  };

  const handleSaveAndTestKey = async (providerId: string) => {
    const key = keyInputValues[providerId] || providerConfigs[providerId]?.apiKey || '';
    setProviderApiKey(providerId, key);
    setTestingStatus((prev) => ({ ...prev, [providerId]: true }));
    const success = await testProviderConnection(providerId);
    setTestingStatus((prev) => ({ ...prev, [providerId]: false }));

    if (success) {
      setOperatingMode('custom');
      setActivatedSuccessMsg(`${providerId.toUpperCase()} API key verified & activated successfully!`);
      setTimeout(() => setActivatedSuccessMsg(null), 3000);
    }
  };

  const handleActivateModel = (model: AIModel) => {
    setProviderActiveModel(model.providerId, model.id);
    if (model.category === 'image') {
      setFeatureAssignment('artworkStudio', model.providerId, model.id, model.name);
    } else {
      setFeatureAssignment('storyGenerator', model.providerId, model.id, model.name);
      setFeatureAssignment('chatbot', model.providerId, model.id, model.name);
    }
    setActivatedSuccessMsg(`Activated ${model.name} (${model.providerName}) as active ${model.category} model!`);
    setTimeout(() => setActivatedSuccessMsg(null), 3500);
  };

  // Filter models based on search query & provider filter
  const filterModelList = (models: AIModel[]) => {
    let filtered = models;
    if (providerFilter !== 'all') {
      filtered = filtered.filter((m) => m.providerId === providerFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.providerName.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.version.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const textModelsList = useMemo(() => filterModelList(ALL_TEXT_MODELS), [providerFilter, searchQuery]);
  const imageModelsList = useMemo(() => filterModelList(ALL_IMAGE_MODELS), [providerFilter, searchQuery]);

  const popularTextModels = useMemo(
    () => filterModelList(ALL_TEXT_MODELS.filter((m) => m.isPopular)),
    [providerFilter, searchQuery]
  );
  const popularImageModels = useMemo(
    () => filterModelList(ALL_IMAGE_MODELS.filter((m) => m.isPopular)),
    [providerFilter, searchQuery]
  );

  const activeTextModelName = featureAssignments.storyGenerator?.modelName || 'Gemini 2.5 Flash';
  const activeImageModelName = featureAssignments.artworkStudio?.modelName || 'FLUX Schnell';

  const featureList: { id: AIFeatureId; name: string; desc: string; category: 'text' | 'image' }[] = [
    { id: 'storyGenerator', name: 'Story Generator', desc: 'Powers manuscript expansion, plot generation & scene drafting.', category: 'text' },
    { id: 'chatbot', name: 'AI Chatbot (Skipper)', desc: 'Powers the interactive Skipper assistant sidebar.', category: 'text' },
    { id: 'characterGenerator', name: 'Character Generator', desc: 'Powers character profile visual specs & arc generation.', category: 'text' },
    { id: 'sceneGenerator', name: 'Scene Generator', desc: 'Powers automatic scene breakdown & breakdown extraction.', category: 'text' },
    { id: 'promptGenerator', name: 'Prompt Generator', desc: 'Powers AI prompt enhancement for visual studio rendering.', category: 'text' },
    { id: 'dialogueGenerator', name: 'Dialogue Generator', desc: 'Powers character dialogue rewrite & polish tools.', category: 'text' },
    { id: 'continuityChecker', name: 'Continuity Checker', desc: 'Powers deep story logic, timeline & consistency audits.', category: 'text' },
    { id: 'storyboardAssistant', name: 'Storyboard Assistant', desc: 'Powers visual scene frame description generation.', category: 'text' },
    { id: 'artworkStudio', name: 'Artwork Studio', desc: 'Powers FLUX & photorealistic artwork generation.', category: 'image' },
    { id: 'imageUpscaler', name: 'Image Upscaler', desc: 'Powers high resolution image enhancement & detail upscale.', category: 'image' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <GlassSurface width="100%" height={56} borderRadius={16} className="px-6 py-3 flex items-center justify-between z-10 mb-4 shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aurora-500/20 to-teal-500/20 flex items-center justify-center border border-aurora-500/30">
            <Cpu className="w-5 h-5 text-aurora-400" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
              API Hub <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-bold uppercase">Control Center</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Centralized AI provider, model selection & key entry matrix</p>
          </div>
        </div>

        {/* Operating Mode Banner Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass-surface bg-aurora-500/10 px-3 py-1.5 rounded-xl border border-aurora-500/20">
            <span className="text-xs font-mono text-slate-300">Mode:</span>
            <button
              onClick={() => setOperatingMode('default')}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                operatingMode === 'default'
                  ? 'bg-aurora-500/30 text-aurora-200 border border-aurora-500/50 shadow-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Default (Built-In)
            </button>
            <button
              onClick={() => setOperatingMode('custom')}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                operatingMode === 'custom'
                  ? 'bg-teal-500/30 text-teal-200 border border-teal-500/50 shadow-glow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              User Custom API
            </button>
          </div>

          <button
            onClick={resetAllToDefaults}
            className="px-3 py-1.5 text-xs glass-surface bg-aurora-500/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-aurora-500/20 hover:border-rose-500/30 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-mono"
            title="Reset All Configurations to Built-In Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </GlassSurface>

      {/* Toast Notification Alert */}
      {activatedSuccessMsg && (
        <div className="mx-6 mb-3 p-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
          <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{activatedSuccessMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 pt-1 space-y-4 custom-scrollbar">
        {/* Mode Status Callout Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all backdrop-blur-2xl ${
          operatingMode === 'default'
            ? 'glass-surface bg-aurora-500/10 border-aurora-500/30 text-aurora-200 shadow-xl'
            : 'glass-surface bg-teal-500/10 border-teal-500/35 text-teal-200 shadow-xl'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              operatingMode === 'default' ? 'bg-aurora-500/20 border-aurora-500/40 text-aurora-300' : 'bg-teal-500/20 border-teal-500/40 text-teal-300'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm">
                {operatingMode === 'default'
                  ? "You're currently using the application's default AI models."
                  : "User Custom API Mode Active"}
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {operatingMode === 'default'
                  ? 'All features run on built-in models. Enter any provider API key below to enable User API mode.'
                  : 'Your custom provider keys & selected models are actively routing requests across all story features.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-sm" />
            <span className="text-emerald-400 font-bold">100% Fail-Safe Active</span>
          </div>
        </div>

        {/* Metrics Health Summary Cards (Light Liquid Glass - Fixed Active Text Model) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassSurface width="100%" height="auto" className="p-3.5 border-aurora-500/25 glass-surface bg-aurora-500/10 backdrop-blur-xl space-y-1 shadow-lg">
            <div className="text-[10px] font-mono text-aurora-300 uppercase tracking-wider font-bold">Active Text Model</div>
            <div className="text-xs font-bold text-slate-100 truncate">{activeTextModelName}</div>
            <div className="text-[10px] text-teal-300 font-mono">Primary Story & Chat</div>
          </GlassSurface>

          <GlassSurface width="100%" height="auto" className="p-3.5 border-aurora-500/25 glass-surface bg-aurora-500/10 backdrop-blur-xl space-y-1 shadow-lg">
            <div className="text-[10px] font-mono text-teal-300 uppercase tracking-wider font-bold">Active Image Model</div>
            <div className="text-xs font-bold text-slate-100 truncate">{activeImageModelName}</div>
            <div className="text-[10px] text-aurora-300 font-mono">Artwork Studio Engine</div>
          </GlassSurface>

          <GlassSurface width="100%" height="auto" className="p-3.5 border-aurora-500/25 glass-surface bg-aurora-500/10 backdrop-blur-xl space-y-1 shadow-lg">
            <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-bold">Daily Requests</div>
            <div className="text-xs font-bold text-slate-100 font-mono">{metrics.dailyRequests} Requests</div>
            <div className="text-[10px] text-slate-400 font-mono">{metrics.avgLatencyMs}ms Avg Latency</div>
          </GlassSurface>

          <GlassSurface width="100%" height="auto" className="p-3.5 border-aurora-500/25 glass-surface bg-aurora-500/10 backdrop-blur-xl space-y-1 shadow-lg">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Connection Health</div>
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Healthy
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Failover Ready</div>
          </GlassSurface>
        </div>

        {/* Search Bar & Filter Navigation (Clean, Emojiless, Rounded Pill Search Bar) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          {/* Rounded Search Bar */}
          <div className="w-full sm:w-80 flex items-center gap-2.5 glass-surface bg-aurora-500/10 backdrop-blur-2xl p-2 px-4 rounded-full border border-aurora-500/35 shadow-xl focus-within:border-aurora-500/60 focus-within:shadow-glow-sm transition-all">
            <Search className="w-4 h-4 text-aurora-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI models, providers, versions..."
              className="w-full bg-transparent border-none text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-200 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Section Tab Bar (Clean Icons, Zero Emojis) */}
          <div className="glass-surface bg-aurora-500/10 border border-aurora-500/25 rounded-2xl p-1 flex items-center gap-1 flex-wrap shadow-lg">
            {[
              { id: 'popular', label: 'Popular Models', icon: <Flame className="w-3.5 h-3.5 text-amber-400" />, count: popularTextModels.length + popularImageModels.length },
              { id: 'text', label: 'Text & Reasoning', icon: <MessageSquare className="w-3.5 h-3.5 text-aurora-400" />, count: textModelsList.length },
              { id: 'image', label: 'Image Models', icon: <ImageIcon className="w-3.5 h-3.5 text-teal-400" />, count: imageModelsList.length },
              { id: 'features', label: 'Feature Assignments', icon: <Target className="w-3.5 h-3.5 text-indigo-400" />, count: featureList.length },
              { id: 'keys', label: 'API Keys', icon: <Lock className="w-3.5 h-3.5 text-purple-400" />, count: Object.keys(providerConfigs).length },
              { id: 'fallback', label: 'Failover Chain', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />, count: fallbackChain.length },
            ].map((tab) => {
              const isActive = activeSectionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSectionTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-aurora-500/30 text-aurora-100 border border-aurora-500/50 shadow-glow-sm font-semibold'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-aurora-500/15'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/60 text-slate-300 border border-aurora-500/20">{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Section Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
          {/* TAB 1: POPULAR MODELS */}
          {activeSectionTab === 'popular' && (
            <div className="space-y-6">
              {/* Popular Text Models */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-aurora-300 mb-3 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Popular Text & Reasoning Models ({popularTextModels.length})
                </h3>
                {popularTextModels.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 glass-surface rounded-xl border border-aurora-500/20">No matching popular text models found for "{searchQuery}".</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularTextModels.map((m) => {
                      const cfg = providerConfigs[m.providerId];
                      const keyVal = keyInputValues[m.providerId] ?? (cfg?.apiKey || '');
                      const isVisible = showKeys[m.providerId] || false;
                      const isTesting = testingStatus[m.providerId] || false;
                      const isActive = activeTextModelName === m.name;

                      return (
                        <GlassSurface key={m.id} width="100%" height="auto" className={`p-4 border transition-all space-y-3 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-xl rounded-2xl ${
                          isActive ? 'border-2 border-aurora-400 shadow-glow-sm' : 'border-aurora-500/25 hover:border-aurora-500/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded border border-teal-500/25">{m.providerName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{m.speed}</span>
                          </div>

                          <div>
                            <div className="font-serif font-bold text-sm text-slate-100 flex items-center justify-between">
                              <span>{m.name}</span>
                              {isActive && <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">Active</span>}
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">{m.description}</p>
                          </div>

                          {/* Inline API Key Entry */}
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-[10px] font-mono text-aurora-300 uppercase font-semibold">Paste {m.providerName} API Key</label>
                            <div className="flex items-center gap-1.5 glass-surface bg-aurora-500/10 border border-aurora-500/25 rounded-xl px-2.5 py-1">
                              <Key className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <input
                                type={isVisible ? 'text' : 'password'}
                                value={keyVal}
                                onChange={(e) => handleKeyInputChange(m.providerId, e.target.value)}
                                placeholder={`Enter API key...`}
                                className="w-full bg-transparent text-[11px] font-mono text-slate-100 focus:outline-none"
                              />
                              <button onClick={() => toggleShowKey(m.providerId)} className="text-slate-400 hover:text-slate-200 p-0.5">
                                {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-aurora-500/15">
                            <button
                              disabled={isTesting}
                              onClick={() => handleSaveAndTestKey(m.providerId)}
                              className="flex-1 py-1.5 text-[11px] bg-aurora-500/20 hover:bg-aurora-500/35 text-aurora-200 rounded-xl border border-aurora-500/30 transition cursor-pointer font-semibold flex items-center justify-center gap-1"
                            >
                              <Zap className={`w-3 h-3 ${isTesting ? 'animate-spin text-amber-400' : 'text-aurora-400'}`} />
                              <span>{isTesting ? 'Testing...' : 'Test & Save Key'}</span>
                            </button>

                            <button
                              onClick={() => handleActivateModel(m)}
                              className={`flex-1 py-1.5 text-[11px] rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                                isActive
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-glow-sm'
                                  : 'wax-seal-btn text-slate-100'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{isActive ? 'Active' : 'Select Model'}</span>
                            </button>
                          </div>
                        </GlassSurface>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Popular Image Models */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-teal-300 mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-400" /> Popular Image Generation Models ({popularImageModels.length})
                </h3>
                {popularImageModels.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-4 glass-surface rounded-xl border border-aurora-500/20">No matching popular image models found for "{searchQuery}".</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularImageModels.map((m) => {
                      const cfg = providerConfigs[m.providerId];
                      const keyVal = keyInputValues[m.providerId] ?? (cfg?.apiKey || '');
                      const isVisible = showKeys[m.providerId] || false;
                      const isTesting = testingStatus[m.providerId] || false;
                      const isActive = activeImageModelName === m.name;

                      return (
                        <GlassSurface key={m.id} width="100%" height="auto" className={`p-4 border transition-all space-y-3 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-xl rounded-2xl ${
                          isActive ? 'border-2 border-teal-400 shadow-glow-sm' : 'border-teal-500/25 hover:border-teal-500/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-aurora-300 bg-aurora-500/15 px-2 py-0.5 rounded border border-aurora-500/25">{m.providerName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{m.speed}</span>
                          </div>

                          <div>
                            <div className="font-serif font-bold text-sm text-slate-100 flex items-center justify-between">
                              <span>{m.name}</span>
                              {isActive && <span className="text-[10px] font-mono text-teal-300 font-bold bg-teal-500/15 px-2 py-0.5 rounded border border-teal-500/30">Active Artwork</span>}
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1">{m.description}</p>
                          </div>

                          {/* Inline API Key Entry */}
                          <div className="space-y-1.5 pt-1">
                            <label className="block text-[10px] font-mono text-teal-300 uppercase font-semibold">Paste {m.providerName} API Key</label>
                            <div className="flex items-center gap-1.5 glass-surface bg-teal-500/10 border border-teal-500/25 rounded-xl px-2.5 py-1">
                              <Key className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <input
                                type={isVisible ? 'text' : 'password'}
                                value={keyVal}
                                onChange={(e) => handleKeyInputChange(m.providerId, e.target.value)}
                                placeholder={`Enter API key...`}
                                className="w-full bg-transparent text-[11px] font-mono text-slate-100 focus:outline-none"
                              />
                              <button onClick={() => toggleShowKey(m.providerId)} className="text-slate-400 hover:text-slate-200 p-0.5">
                                {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-teal-500/15">
                            <button
                              disabled={isTesting}
                              onClick={() => handleSaveAndTestKey(m.providerId)}
                              className="flex-1 py-1.5 text-[11px] bg-teal-500/20 hover:bg-teal-500/35 text-teal-200 rounded-xl border border-teal-500/30 transition cursor-pointer font-semibold flex items-center justify-center gap-1"
                            >
                              <Zap className={`w-3 h-3 ${isTesting ? 'animate-spin text-amber-400' : 'text-teal-400'}`} />
                              <span>{isTesting ? 'Testing...' : 'Test Key'}</span>
                            </button>

                            <button
                              onClick={() => handleActivateModel(m)}
                              className={`flex-1 py-1.5 text-[11px] rounded-xl font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                                isActive
                                  ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-glow-sm'
                                  : 'wax-seal-btn text-slate-100'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{isActive ? 'Active' : 'Select Model'}</span>
                            </button>
                          </div>
                        </GlassSurface>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TEXT & REASONING MODELS */}
          {activeSectionTab === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-aurora-300">
                  All Supported Text & Reasoning Models ({textModelsList.length})
                </h3>
                <div className="w-56">
                  <GlassSelect
                    value={providerFilter}
                    onChange={setProviderFilter}
                    options={[
                      { label: 'All Providers', value: 'all' },
                      { label: 'OpenAI', value: 'openai' },
                      { label: 'Google AI', value: 'google' },
                      { label: 'Anthropic', value: 'anthropic' },
                      { label: 'xAI (Grok)', value: 'xai' },
                      { label: 'DeepSeek', value: 'deepseek' },
                      { label: 'Meta AI', value: 'meta' },
                      { label: 'Mistral AI', value: 'mistral' },
                      { label: 'Alibaba Cloud', value: 'alibaba' },
                      { label: 'NVIDIA AI', value: 'nvidia' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {textModelsList.map((m) => {
                  const cfg = providerConfigs[m.providerId];
                  const keyVal = keyInputValues[m.providerId] ?? (cfg?.apiKey || '');
                  const isVisible = showKeys[m.providerId] || false;
                  const isTesting = testingStatus[m.providerId] || false;
                  const isActive = activeTextModelName === m.name;

                  return (
                    <GlassSurface key={m.id} width="100%" height="auto" className={`p-4 border space-y-3 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-xl rounded-2xl ${
                      isActive ? 'border-2 border-aurora-400 shadow-glow-sm' : 'border-aurora-500/25'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-aurora-300 bg-aurora-500/15 px-2 py-0.5 rounded border border-aurora-500/25">{m.providerName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{m.speed}</span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-100">{m.name}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{m.description}</p>
                      </div>

                      {/* Inline API Key Input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-aurora-300 uppercase font-semibold">API Key</label>
                        <div className="flex items-center gap-1.5 glass-surface bg-aurora-500/10 border border-aurora-500/25 rounded-xl px-2.5 py-1">
                          <Key className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <input
                            type={isVisible ? 'text' : 'password'}
                            value={keyVal}
                            onChange={(e) => handleKeyInputChange(m.providerId, e.target.value)}
                            placeholder={`Enter ${m.providerName} API Key...`}
                            className="w-full bg-transparent text-[11px] font-mono text-slate-100 focus:outline-none"
                          />
                          <button onClick={() => toggleShowKey(m.providerId)} className="text-slate-400 hover:text-slate-200 p-0.5">
                            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-aurora-500/15 flex items-center justify-between gap-2 text-xs">
                        <button
                          disabled={isTesting}
                          onClick={() => handleSaveAndTestKey(m.providerId)}
                          className="px-2.5 py-1 text-[11px] bg-aurora-500/20 hover:bg-aurora-500/35 text-aurora-200 rounded-lg border border-aurora-500/30 transition cursor-pointer font-semibold"
                        >
                          Save & Test
                        </button>
                        <button
                          onClick={() => handleActivateModel(m)}
                          className={`px-3 py-1 text-[11px] rounded-lg font-bold transition cursor-pointer ${
                            isActive ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' : 'wax-seal-btn text-slate-100'
                          }`}
                        >
                          {isActive ? 'Active' : 'Select Model'}
                        </button>
                      </div>
                    </GlassSurface>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE GENERATION MODELS */}
          {activeSectionTab === 'image' && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-teal-300">
                Artwork Studio Image Generation Models ({imageModelsList.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageModelsList.map((m) => {
                  const cfg = providerConfigs[m.providerId];
                  const keyVal = keyInputValues[m.providerId] ?? (cfg?.apiKey || '');
                  const isVisible = showKeys[m.providerId] || false;
                  const isTesting = testingStatus[m.providerId] || false;
                  const isActive = activeImageModelName === m.name;

                  return (
                    <GlassSurface key={m.id} width="100%" height="auto" className={`p-4 border space-y-3 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-xl rounded-2xl ${
                      isActive ? 'border-2 border-teal-400 shadow-glow-sm' : 'border-teal-500/25'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded border border-teal-500/25">{m.providerName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{m.speed}</span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-slate-100">{m.name}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{m.description}</p>
                      </div>

                      {/* Inline API Key Input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-teal-300 uppercase font-semibold">API Key</label>
                        <div className="flex items-center gap-1.5 glass-surface bg-teal-500/10 border border-teal-500/25 rounded-xl px-2.5 py-1">
                          <Key className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <input
                            type={isVisible ? 'text' : 'password'}
                            value={keyVal}
                            onChange={(e) => handleKeyInputChange(m.providerId, e.target.value)}
                            placeholder={`Enter ${m.providerName} API Key...`}
                            className="w-full bg-transparent text-[11px] font-mono text-slate-100 focus:outline-none"
                          />
                          <button onClick={() => toggleShowKey(m.providerId)} className="text-slate-400 hover:text-slate-200 p-0.5">
                            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-teal-500/15 flex items-center justify-between gap-2 text-xs">
                        <button
                          disabled={isTesting}
                          onClick={() => handleSaveAndTestKey(m.providerId)}
                          className="px-2.5 py-1 text-[11px] bg-teal-500/20 hover:bg-teal-500/35 text-teal-200 rounded-lg border border-teal-500/30 transition cursor-pointer font-semibold"
                        >
                          Save & Test
                        </button>
                        <button
                          onClick={() => handleActivateModel(m)}
                          className={`px-3 py-1 text-[11px] rounded-lg font-bold transition cursor-pointer ${
                            isActive ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40' : 'wax-seal-btn text-slate-100'
                          }`}
                        >
                          {isActive ? 'Active' : 'Select Model'}
                        </button>
                      </div>
                    </GlassSurface>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FEATURE MODEL ASSIGNMENT MATRIX */}
          {activeSectionTab === 'features' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl glass-surface bg-aurora-500/10 border border-aurora-500/20 text-xs text-slate-300">
                Assign specific AI models to different features across the application. When a feature runs, it will route to its assigned model.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureList.map((feat) => {
                  const currentAssign = featureAssignments[feat.id];
                  return (
                    <GlassSurface key={feat.id} width="100%" height="auto" className="p-5 border-aurora-500/25 space-y-3 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-xl rounded-2xl">
                      <div className="flex items-center justify-between border-b border-aurora-500/15 pb-2">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-slate-100">{feat.name}</h4>
                          <p className="text-[11px] text-slate-400">{feat.desc}</p>
                        </div>
                        <span className="text-[10px] font-mono text-aurora-300 bg-aurora-500/15 px-2 py-0.5 rounded border border-aurora-500/25 uppercase">{feat.category}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-slate-300 font-semibold">Assigned Model</label>
                        <GlassSelect
                          value={currentAssign?.modelId || ''}
                          onChange={(val) => {
                            const foundText = ALL_TEXT_MODELS.find((m) => m.id === val);
                            const foundImg = ALL_IMAGE_MODELS.find((m) => m.id === val);
                            const found = foundText || foundImg;
                            if (found) {
                              setFeatureAssignment(feat.id, found.providerId, found.id, found.name);
                            }
                          }}
                          options={
                            feat.category === 'text'
                              ? ALL_TEXT_MODELS.map((m) => ({ label: `${m.name} (${m.providerName})`, value: m.id }))
                              : ALL_IMAGE_MODELS.map((m) => ({ label: `${m.name} (${m.providerName})`, value: m.id }))
                          }
                        />
                      </div>
                    </GlassSurface>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: API KEY SECURITY & CONNECTIONS */}
          {activeSectionTab === 'keys' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl glass-surface bg-aurora-500/10 border border-aurora-500/20 text-xs text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>API keys are encrypted and stored locally. Keys are never logged in browser console or exposed to third parties.</span>
              </div>

              <div className="space-y-3">
                {Object.values(providerConfigs).map((cfg) => {
                  const keyVal = keyInputValues[cfg.providerId] ?? cfg.apiKey;
                  const isVisible = showKeys[cfg.providerId] || false;
                  const isTesting = testingStatus[cfg.providerId] || false;

                  return (
                    <GlassSurface key={cfg.providerId} width="100%" height="auto" className="p-4 border-aurora-500/20 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-xl rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 w-44 flex-shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-aurora-500/15 border border-aurora-500/30 flex items-center justify-center font-bold text-xs text-aurora-300">
                            {cfg.providerName[0]}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-xs text-slate-100">{cfg.providerName}</div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {cfg.status === 'connected' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Connected ({cfg.latencyMs || 150}ms)</span>}
                              {cfg.status === 'testing' && <span className="text-amber-400">Testing connection...</span>}
                              {cfg.status === 'invalid_key' && <span className="text-rose-400">Invalid Key</span>}
                              {cfg.status === 'disconnected' && <span className="text-slate-400">Not Configured</span>}
                            </div>
                          </div>
                        </div>

                        {/* Masked Key Input Bar */}
                        <div className="flex-1 flex items-center gap-2 glass-surface bg-aurora-500/10 border border-aurora-500/25 rounded-xl px-3 py-1.5">
                          <Key className="w-3.5 h-3.5 text-slate-400" />
                          <input
                            type={isVisible ? 'text' : 'password'}
                            value={keyVal}
                            onChange={(e) => handleKeyInputChange(cfg.providerId, e.target.value)}
                            placeholder={`Enter ${cfg.providerName} API Key...`}
                            className="w-full bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
                          />
                          <button onClick={() => toggleShowKey(cfg.providerId)} className="text-slate-400 hover:text-slate-200 p-1">
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <button
                          disabled={isTesting}
                          onClick={() => handleSaveAndTestKey(cfg.providerId)}
                          className="px-3.5 py-1.5 text-xs bg-aurora-500/20 hover:bg-aurora-500/35 text-aurora-200 rounded-xl border border-aurora-500/30 font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Zap className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-400' : 'text-aurora-400'}`} />
                          <span>{isTesting ? 'Testing...' : 'Test & Save'}</span>
                        </button>
                      </div>
                    </GlassSurface>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: FALLBACK CHAIN & RESILIENCE */}
          {activeSectionTab === 'fallback' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl glass-surface bg-aurora-500/10 border border-aurora-500/20 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-aurora-300 font-mono text-xs uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-teal-400" /> Automatic Failover Chain
                </div>
                <p className="text-slate-400 leading-relaxed">
                  If your primary custom provider encounters rate limits, quota issues, or downtime, the application seamlessly routes the request through this failover priority list without breaking your story generation session.
                </p>
              </div>

              <div className="space-y-3">
                {fallbackChain.map((chainItem, idx) => (
                  <GlassSurface key={idx} width="100%" height="auto" className="p-4 border-aurora-500/25 glass-surface bg-aurora-500/10 backdrop-blur-xl shadow-xl rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-aurora-500/20 border border-aurora-500/35 text-aurora-300 font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-serif font-bold text-xs text-slate-100 uppercase tracking-wider">
                          {idx === 0 ? 'Primary Model' : `Fallback Tier ${idx}`}
                        </div>
                        <div className="text-xs font-mono text-teal-300 font-bold">{chainItem.modelId} ({chainItem.providerId})</div>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Failover Route
                    </span>
                  </GlassSurface>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
