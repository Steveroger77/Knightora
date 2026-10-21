import React, { useRef, useState, useEffect } from 'react';
import { LeftRail } from './LeftRail';
import { RightRail } from './RightRail';
import { useUIStore } from '../../stores/useUIStore';
import { ScreenplayEditor } from '../editor/ScreenplayEditor';
import { StoryBibleView } from '../story-bible/StoryBibleView';
import { CorkboardGraph } from '../relationship-graph/CorkboardGraph';
import { FilmReelScrubber } from '../timeline/FilmReelScrubber';
import { ImageStudioView } from '../image-studio/ImageStudioView';
import { NotesWidget } from '../notes/NotesWidget';
import { APIHubView } from '../api-hub/APIHubView';
import { Minimize2, X, Columns } from 'lucide-react';

export const ThreePanelLayout: React.FC = () => {
  const { activeTab, isSplitView, toggleSplitView, splitRightTab, splitRatio, setSplitRatio, maximizedPanel, setMaximizedPanel } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (maximizedPanel !== 'none') {
          setMaximizedPanel('none');
        } else if (isSplitView) {
          toggleSplitView();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [maximizedPanel, isSplitView, toggleSplitView, setMaximizedPanel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percentage = Math.min(80, Math.max(20, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      setSplitRatio(percentage);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const isStoryBibleGroup = ['story-bible', 'characters', 'locations', 'props', 'scenes', 'consistency'].includes(activeTab);

  const renderSplitRightView = () => {
    switch (splitRightTab) {
      case 'images': return <ImageStudioView />;
      case 'story-bible': return <StoryBibleView />;
      case 'timeline': return <FilmReelScrubber />;
      case 'relationships': return <CorkboardGraph />;
      case 'notes': return <NotesWidget />;
      case 'api-hub': return <APIHubView />;
      default: return <ImageStudioView />;
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden relative p-4 gap-4">
      <LeftRail />
      <main className="flex-1 flex h-full min-w-0 overflow-hidden relative select-none" ref={containerRef}>
        {isSplitView && (
          <div className="absolute top-2.5 right-3 z-50 flex items-center gap-1.5">
            {maximizedPanel !== 'none' && (
              <button
                onClick={() => setMaximizedPanel('none')}
                className="w-6 h-6 rounded-md bg-obsidian-950/80 hover:bg-aurora-500/25 text-slate-400 hover:text-aurora-300 border border-slate-700/60 hover:border-aurora-500/40 backdrop-blur-md flex items-center justify-center transition-all shadow-md cursor-pointer group"
                title="Restore Split (Esc)"
              >
                <Minimize2 className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              </button>
            )}

            <button
              onClick={toggleSplitView}
              className="w-6 h-6 rounded-md bg-obsidian-950/80 hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 backdrop-blur-md flex items-center justify-center transition-all shadow-md cursor-pointer group"
              title="Exit Split Screen (Esc)"
              aria-label="Exit Split Screen"
            >
              <X className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        )}

        {isSplitView ? (
          <div className="flex-1 flex h-full w-full overflow-hidden relative">
            {maximizedPanel !== 'right' && (
              <div style={{ width: maximizedPanel === 'left' ? '100%' : `${splitRatio}%` }} className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-expo-out transform-gpu">
                <ScreenplayEditor />
              </div>
            )}
            
            {maximizedPanel === 'none' && (
              <div onMouseDown={handleMouseDown} className={`w-[6px] flex items-center justify-center cursor-col-resize transition-all z-20 group relative ${isDragging ? 'bg-aurora-500/20' : 'bg-transparent hover:bg-aurora-500/10'}`}>
                <div className={`w-[2px] h-12 rounded-full transition-all duration-300 ${isDragging ? 'bg-aurora-400 shadow-glow-sm' : 'bg-aurora-500/30 group-hover:bg-aurora-400 group-hover:h-16'}`} />
              </div>
            )}
            
            {maximizedPanel !== 'left' && (
              <div style={{ width: maximizedPanel === 'right' ? '100%' : `${100 - splitRatio}%` }} className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-expo-out transform-gpu">
                {renderSplitRightView()}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            <div className={`w-full h-full ${activeTab === 'script' ? 'flex flex-col' : 'hidden'}`}><ScreenplayEditor /></div>
            <div className={`w-full h-full ${isStoryBibleGroup ? 'flex flex-col' : 'hidden'}`}><StoryBibleView /></div>
            <div className={`w-full h-full ${activeTab === 'timeline' ? 'flex flex-col' : 'hidden'}`}><FilmReelScrubber /></div>
            <div className={`w-full h-full ${activeTab === 'relationships' ? 'flex flex-col' : 'hidden'}`}><CorkboardGraph /></div>
            <div className={`w-full h-full ${activeTab === 'images' ? 'flex flex-col' : 'hidden'}`}><ImageStudioView /></div>
            <div className={`w-full h-full ${activeTab === 'notes' ? 'flex flex-col' : 'hidden'}`}><NotesWidget /></div>
            <div className={`w-full h-full ${activeTab === 'api-hub' ? 'flex flex-col' : 'hidden'}`}><APIHubView /></div>
          </div>
        )}
      </main>
      <RightRail />
    </div>
  );
};
