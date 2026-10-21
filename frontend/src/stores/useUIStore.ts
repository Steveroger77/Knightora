import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActiveTab } from '../types';

export type Mood = 'day' | 'sunset' | 'cloudy' | 'night';

interface UIState {
  theme: Mood;
  activeTab: ActiveTab;
  isLeftRailOpen: boolean;
  isRightRailOpen: boolean;
  isDistractionFree: boolean;
  isShortcutsOpen: boolean;
  isNewProjectModalOpen: boolean;
  isImportStoryModalOpen: boolean;
  isAIStorySummaryOpen: boolean;
  activeEntityDetail: { type: 'character' | 'location' | 'prop' | 'scene'; id: string } | null;
  
  // Split View & Panel Maximize States
  isSplitView: boolean;
  splitRightTab: 'images' | 'story-bible' | 'timeline' | 'relationships' | 'notes' | 'api-hub';
  splitRatio: number; // 20 to 80 percent
  maximizedPanel: 'none' | 'left' | 'right';
  pendingImagePrompt: string;

  setTheme: (theme: Mood) => void;
  cycleTheme: () => void;
  toggleTheme: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  toggleLeftRail: () => void;
  toggleRightRail: () => void;
  setDistractionFree: (df: boolean) => void;
  toggleDistractionFree: () => void;
  setIsShortcutsOpen: (open: boolean) => void;
  setIsNewProjectModalOpen: (open: boolean) => void;
  setIsImportStoryModalOpen: (open: boolean) => void;
  setIsAIStorySummaryOpen: (open: boolean) => void;
  setActiveEntityDetail: (detail: { type: 'character' | 'location' | 'prop' | 'scene'; id: string } | null) => void;
  
  // Split View Actions
  toggleSplitView: () => void;
  setSplitView: (split: boolean, rightTab?: 'images' | 'story-bible' | 'timeline' | 'relationships' | 'notes') => void;
  openSplitViewWithImagePrompt: (prompt: string) => void;
  setSplitRatio: (ratio: number) => void;
  setMaximizedPanel: (panel: 'none' | 'left' | 'right') => void;
  toggleMaximizedPanel: (panel: 'left' | 'right') => void;
  setPendingImagePrompt: (prompt: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'day',
      activeTab: 'script',
      isLeftRailOpen: true,
      isRightRailOpen: false,
      isDistractionFree: false,
      isShortcutsOpen: false,
      isNewProjectModalOpen: false,
      isImportStoryModalOpen: false,
      isAIStorySummaryOpen: false,
      activeEntityDetail: null,
      
      isSplitView: false,
      splitRightTab: 'images',
      splitRatio: 50,
      maximizedPanel: 'none',
      pendingImagePrompt: '',

      setTheme: (theme) => set({ theme }),

      cycleTheme: () => set((s) => {
        const order: Mood[] = ['day', 'sunset', 'cloudy', 'night'];
        const nextIdx = (order.indexOf(s.theme as Mood) + 1) % order.length;
        return { theme: order[nextIdx] };
      }),

      toggleTheme: () => set((s) => {
        const order: Mood[] = ['day', 'sunset', 'cloudy', 'night'];
        const nextIdx = (order.indexOf(s.theme as Mood) + 1) % order.length;
        return { theme: order[nextIdx] };
      }),

      setActiveTab: (activeTab) => set((s) => ({
        activeTab,
        isSplitView: false,
        maximizedPanel: 'none',
      })),

      toggleLeftRail: () => set((s) => ({ isLeftRailOpen: !s.isLeftRailOpen })),
      toggleRightRail: () => set((s) => ({ isRightRailOpen: !s.isRightRailOpen })),
      setDistractionFree: (isDistractionFree) => set({ isDistractionFree }),
      toggleDistractionFree: () => set((s) => ({ isDistractionFree: !s.isDistractionFree })),
      setIsShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
      setIsNewProjectModalOpen: (isNewProjectModalOpen) => set({ isNewProjectModalOpen }),
      setIsImportStoryModalOpen: (isImportStoryModalOpen) => set({ isImportStoryModalOpen }),
      setIsAIStorySummaryOpen: (isAIStorySummaryOpen) => set({ isAIStorySummaryOpen }),
      setActiveEntityDetail: (activeEntityDetail) => set({ activeEntityDetail }),

      toggleSplitView: () => set((s) => {
        const nextSplit = !s.isSplitView;
        return {
          isSplitView: nextSplit,
          isRightRailOpen: !nextSplit,
          maximizedPanel: 'none',
        };
      }),

      setSplitView: (isSplitView, splitRightTab = 'images') => set({
        isSplitView,
        splitRightTab,
        isRightRailOpen: !isSplitView,
        maximizedPanel: 'none',
      }),

      openSplitViewWithImagePrompt: (pendingImagePrompt) => set({
        isSplitView: true,
        splitRightTab: 'images',
        activeTab: 'script',
        isRightRailOpen: false,
        maximizedPanel: 'none',
        pendingImagePrompt,
      }),

      setSplitRatio: (splitRatio) => set({ splitRatio }),

      setMaximizedPanel: (maximizedPanel) => set({ maximizedPanel }),

      toggleMaximizedPanel: (panel) => set((s) => ({
        maximizedPanel: s.maximizedPanel === panel ? 'none' : panel,
      })),

      setPendingImagePrompt: (pendingImagePrompt) => set({ pendingImagePrompt }),
    }),
    {
      name: 'obsidian-ui-store-v2',
      partialize: (state) => ({
        theme: state.theme,
        activeTab: state.activeTab,
        isLeftRailOpen: state.isLeftRailOpen,
        isRightRailOpen: state.isRightRailOpen,
        isSplitView: state.isSplitView,
        splitRightTab: state.splitRightTab,
        splitRatio: state.splitRatio,
      }),
    }
  )
);
