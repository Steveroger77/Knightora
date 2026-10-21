import { create } from 'zustand';

interface AIState {
  neuronsUsedToday: number;
  dailyNeuronLimit: number;
  isAiLoading: boolean;
  aiStatusMessage: string;
  generationProgress: number; // 0 to 100%
  isSearchOpen: boolean;
  isAnalysisOpen: boolean;
  activeAnalysisType: string | null;

  addNeuronCost: (cost: number) => void;
  setAiLoading: (loading: boolean, message?: string, progress?: number) => void;
  setGenerationProgress: (progress: number) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsAnalysisOpen: (open: boolean, type?: string) => void;
}

const getTodayKey = () => `obsidian_neurons_${new Date().toISOString().split('T')[0]}`;

const getSavedNeurons = (): number => {
  try {
    const saved = localStorage.getItem(getTodayKey());
    return saved ? parseInt(saved, 10) : 420; // default baseline
  } catch (_) {
    return 420;
  }
};

export const useAIStore = create<AIState>((set) => ({
  neuronsUsedToday: getSavedNeurons(),
  dailyNeuronLimit: 10000,
  isAiLoading: false,
  aiStatusMessage: 'The ink is flowing...',
  generationProgress: 0,
  isSearchOpen: false,
  isAnalysisOpen: false,
  activeAnalysisType: null,

  addNeuronCost: (cost) => set((state) => {
    const nextTotal = Math.min(state.dailyNeuronLimit, state.neuronsUsedToday + cost);
    try {
      localStorage.setItem(getTodayKey(), nextTotal.toString());
    } catch (_) {}
    return { neuronsUsedToday: nextTotal };
  }),

  setAiLoading: (isAiLoading, aiStatusMessage = 'The ink is flowing...', generationProgress = 0) => set({
    isAiLoading,
    aiStatusMessage,
    generationProgress,
  }),

  setGenerationProgress: (generationProgress) => set({ generationProgress }),

  setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),

  setIsAnalysisOpen: (isAnalysisOpen, activeAnalysisType = null) => set({
    isAnalysisOpen,
    activeAnalysisType,
  }),
}));
