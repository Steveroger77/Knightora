import React, { useEffect, useState } from 'react';
import { Header } from './components/chrome/Header';
import { ThreePanelLayout } from './components/layout/ThreePanelLayout';
import { ShortcutsModal } from './components/chrome/ShortcutsModal';
import { NewProjectModal } from './components/chrome/NewProjectModal';
import { ImportStoryModal } from './components/chrome/ImportStoryModal';
import { VersionHistoryModal } from './components/editor/VersionHistoryModal';
import { AIStorySummaryModal } from './components/chrome/AIStorySummaryModal';
import { StorySearchModal } from './components/search/StorySearchModal';
import { AnalysisDrawer } from './components/analysis/AnalysisDrawer';
import { ExportModal } from './components/export/ExportModal';
import { AskGeminiModal } from './components/chrome/AskGeminiModal';

import { LoginModal } from './components/auth/LoginModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { UsernameOnboardingModal } from './components/auth/UsernameOnboardingModal';

import { useUIStore } from './stores/useUIStore';
import { useAIStore } from './stores/useAIStore';
import { useEditorStore } from './stores/useEditorStore';
import { useAuthStore } from './stores/useAuthStore';

export const App: React.FC = () => {
  const { theme, isDistractionFree, setDistractionFree, toggleDistractionFree, setIsShortcutsOpen } = useUIStore();
  const { setIsSearchOpen } = useAIStore();
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const targetTag = (e.target as HTMLElement)?.tagName;

      // Distraction free escape
      if (e.key === 'Escape' && isDistractionFree) {
        useEditorStore.getState().setEditorMode('screenplay');
        useUIStore.getState().setActiveTab('script');
        setDistractionFree(false);
      }

      // Cmd/Ctrl + \ : Toggle Distraction-Free Mode
      if (isCmdOrCtrl && e.key === '\\') {
        e.preventDefault();
        if (isDistractionFree) {
          useEditorStore.getState().setEditorMode('screenplay');
          useUIStore.getState().setActiveTab('script');
        }
        toggleDistractionFree();
      }

      // Cmd/Ctrl + K : Natural Language Search
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // Cmd/Ctrl + N : New Project
      if (isCmdOrCtrl && (e.key === 'n' || e.key === 'N') && !e.shiftKey) {
        e.preventDefault();
        useUIStore.getState().setIsNewProjectModalOpen(true);
      }

      // Cmd/Ctrl + I : Import Story
      if (isCmdOrCtrl && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        useUIStore.getState().setIsImportStoryModalOpen(true);
      }

      // Cmd/Ctrl + E : Export Script
      if (isCmdOrCtrl && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setIsExportOpen(true);
      }

      // Cmd/Ctrl + H : Version History
      if (isCmdOrCtrl && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        useEditorStore.getState().setIsVersionHistoryOpen(true);
      }

      // Cmd/Ctrl + / or ? : Keyboard Shortcuts
      if ((isCmdOrCtrl && e.key === '/') || (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(targetTag))) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDistractionFree]);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <div className={`h-full flex flex-col select-none overflow-hidden relative theme-${theme}`}>
      {/* 4 Atmosphere Mood Background Layers */}
      <div className="app-bg-layer bg-day" style={{ backgroundImage: 'url(/backgrounds/knight-day.png)' }} />
      <div className="app-bg-layer bg-sunset" style={{ backgroundImage: 'url(/backgrounds/knight-sunset.png)' }} />
      <div className="app-bg-layer bg-cloudy" style={{ backgroundImage: 'url(/backgrounds/knight-cloudy.png)' }} />
      <div className="app-bg-layer bg-night" style={{ backgroundImage: 'url(/backgrounds/knight-night.png)' }} />

      <div className="relative z-20 px-4 pt-4 pb-0"><Header /></div>

      <div className="relative z-10 flex-1 overflow-hidden"><ThreePanelLayout /></div>

      {/* Modals & Drawers */}
      <ShortcutsModal />
      <NewProjectModal />
      <ImportStoryModal />
      <VersionHistoryModal />
      <AIStorySummaryModal />
      <StorySearchModal />
      <AnalysisDrawer />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* Floating Ask Gemini AI Chatbot */}
      <AskGeminiModal />

      {/* Auth & Profile Modals */}
      <ProfileModal />
      <UsernameOnboardingModal />
    </div>
  );
};

export default App;
