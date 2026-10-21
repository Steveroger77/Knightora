import React, { useState } from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { Clock, Film, Calendar, ArrowRight } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';

export const FilmReelScrubber: React.FC = () => {
  const { timelineEvents, scenes } = useProjectStore();
  const [selectedEventId, setSelectedEventId] = useState<string>(timelineEvents[0]?.id || '');

  const selectedEvent = timelineEvents.find((e) => e.id === selectedEventId) || timelineEvents[0];
  const relatedScene = scenes.find((s) => s.id === selectedEvent?.relatedSceneId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Top Header */}
      <GlassSurface width="100%" height="auto" className="px-6 py-3 flex items-center justify-between z-10 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brass-400" />
          <h2 className="font-serif font-bold text-lg text-brass-400">Film-Reel Narrative Timeline</h2>
          <span className="text-xs text-stone-400 font-mono">/ Chronological Story Events</span>
        </div>
      </GlassSurface>

      {/* Film Strip Reel Track */}
      <div className="my-6 px-6">
        <div className="film-reel-track p-6 rounded-lg overflow-x-auto custom-scrollbar flex items-center gap-6">
          {timelineEvents.map((evt, idx) => {
            const isSelected = selectedEventId === evt.id;
            return (
              <GlassSurface
                key={evt.id}
                width="16rem" height="auto"
                className={`flex-shrink-0 border transition transform hover:-translate-y-1 ${
                  isSelected ? 'border-brass-400 shadow-wax-seal text-stone-100' : 'border-brass-400/20 text-stone-400 hover:border-brass-400/50'
                }`}
              >
                <div onClick={() => setSelectedEventId(evt.id)} className="p-4 cursor-pointer w-full h-full">
                  <div className="flex items-center justify-between text-[10px] font-mono text-brass-400 border-b border-brass-400/20 pb-1 mb-2">
                    <span>Frame #{idx + 1}</span>
                    <span>{evt.dayOrDate}</span>
                  </div>
                  <div className="font-serif font-bold text-xs text-stone-100 mb-1 truncate">{evt.title}</div>
                  <p className="text-[11px] text-stone-400 line-clamp-2">{evt.description}</p>
                </div>
              </GlassSurface>
            );
          })}
        </div>
      </div>

      {/* Selected Event Details & Related Scene Card */}
      {selectedEvent && (
        <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
          <GlassSurface width="100%" height="auto" className="border border-brass-400/30 max-w-3xl mx-auto shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-brass-400/20 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brass-400" />
                  <span className="font-serif font-bold text-base text-stone-100">{selectedEvent.title}</span>
                </div>
                <span className="text-xs font-mono text-brass-400 bg-obsidian-950/40 px-3 py-1 rounded border border-brass-400/20">
                  {selectedEvent.dayOrDate}
                </span>
              </div>

              <p className="text-sm text-stone-300 leading-relaxed">{selectedEvent.description}</p>

              {relatedScene && (
                <div className="bg-obsidian-950/40 border border-brass-400/30 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between text-xs font-serif font-bold text-brass-400 mb-1">
                    <span className="flex items-center gap-2">
                      <Film className="w-4 h-4" />
                      <span>Linked Scene #{relatedScene.sceneNumber}: {relatedScene.title}</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 italic">"{relatedScene.summary}"</p>
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      )}
    </div>
  );
};
