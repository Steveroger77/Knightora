import { create } from 'zustand';

export type EditorMode = 'screenplay' | 'prose';

interface DiffPreview {
  isOpen: boolean;
  originalText: string;
  modifiedText: string;
  action: string;
  onAccept: () => void;
  onReject: () => void;
}

interface EditorState {
  editorMode: EditorMode;
  fontFamily: string;
  isSaving: boolean;
  lastSavedAt: Date | null;
  selectedText: string;
  selectionCoords: { top: number; left: number } | null;
  isQuillOpen: boolean;
  diffPreview: DiffPreview | null;
  isVersionHistoryOpen: boolean;

  setEditorMode: (mode: EditorMode) => void;
  setFontFamily: (font: string) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date) => void;
  setSelectedText: (text: string, coords: { top: number; left: number } | null) => void;
  setIsQuillOpen: (open: boolean) => void;
  setDiffPreview: (preview: DiffPreview | null) => void;
  setIsVersionHistoryOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  editorMode: 'screenplay',
  fontFamily: 'Courier Prime',
  isSaving: false,
  lastSavedAt: new Date(),
  selectedText: '',
  selectionCoords: null,
  isQuillOpen: false,
  diffPreview: null,
  isVersionHistoryOpen: false,

  setEditorMode: (mode) => set({ editorMode: mode }),
  setFontFamily: (fontFamily) => set({ fontFamily }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  setSelectedText: (selectedText, selectionCoords) => set({
    selectedText,
    selectionCoords,
    isQuillOpen: !!selectedText && selectedText.trim().length > 0,
  }),
  setIsQuillOpen: (isQuillOpen) => set({ isQuillOpen }),
  setDiffPreview: (diffPreview) => set({ diffPreview }),
  setIsVersionHistoryOpen: (isVersionHistoryOpen) => set({ isVersionHistoryOpen }),
}));
