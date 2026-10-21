import React from 'react';
import { useAIStore } from '../../stores/useAIStore';
import { Zap } from 'lucide-react';

export const NeuronGauge: React.FC = () => {
  const { neuronsUsedToday, dailyNeuronLimit } = useAIStore();
  const percentage = Math.min(100, Math.round((neuronsUsedToday / dailyNeuronLimit) * 100));
  const remaining = dailyNeuronLimit - neuronsUsedToday;

  return (
    <div className="flex items-center gap-2 glass-surface rounded-xl px-3 py-1.5 text-xs text-slate-200 group relative cursor-help transition-all hover:border-aurora-500/40 select-none">
      <Zap className="w-3.5 h-3.5 text-teal-400 animate-pulse-glow" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-aurora-400 font-semibold">{remaining.toLocaleString()}</span>
          <span className="text-slate-400">Neurons Left</span>
        </div>
        <div className="w-20 bg-obsidian-950/60 rounded-full h-1 mt-0.5 overflow-hidden border border-aurora-500/10">
          <div className="bg-gradient-to-r from-aurora-600 via-aurora-400 to-teal-400 h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Unclipped High-Z-Index Tooltip Explanation */}
      <div className="absolute top-full right-0 mt-2.5 hidden group-hover:block z-50 w-64 animate-in fade-in duration-150">
        <div className="bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-obsidian-950/95 backdrop-blur-xl border border-aurora-500/30 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2">
          <div className="font-semibold text-aurora-300 border-b border-aurora-500/20 pb-1.5 flex items-center justify-between">
            <span>Cloudflare FLUX Neuron Budget</span>
            <Zap className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            FLUX.1 Schnell image generations consume Cloudflare Neurons. Daily limit resets at 00:00 UTC.
          </p>
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 bg-obsidian-950/60 px-2.5 py-1 rounded-lg border border-aurora-500/15">
            <span>Used: {neuronsUsedToday.toLocaleString()}</span>
            <span className="text-teal-400 font-bold">Max: {dailyNeuronLimit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
