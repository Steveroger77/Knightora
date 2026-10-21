import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { GlassSurface } from '../ui/GlassSurface';
import { AtSign, Sparkles, Check, ArrowRight } from 'lucide-react';

export const UsernameOnboardingModal: React.FC = () => {
  const { isUsernameOnboardingOpen, pendingGoogleUser, completeGoogleOnboarding } = useAuthStore();
  const [username, setUsername] = useState(pendingGoogleUser?.username || '');

  if (!isUsernameOnboardingOpen || !pendingGoogleUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeGoogleOnboarding(username);
  };

  const handleSkip = () => {
    completeGoogleOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-md">
        <GlassSurface
          borderRadius={24}
          borderWidth={1.5}
          blur={20}
          brightness={60}
          opacity={0.92}
          className="p-8 shadow-2xl border-aurora-500/30 text-center"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-aurora-500/20 border border-aurora-500/30 text-aurora-300 mb-4 shadow-glow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="font-serif font-bold text-xl text-white mb-1">
            Welcome to Knightora!
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Choose a unique author handle for your profile, stories, and collaboration across the Atelier.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Choose Your Handle / Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-aurora-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="author_handle"
                  className="w-full bg-obsidian-950/70 border border-aurora-500/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-500 focus:shadow-glow-sm font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                You can change your username at any time from your Profile settings.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aurora-500 to-teal-500 hover:from-aurora-400 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glow-sm cursor-pointer"
              >
                <span>Save Username & Continue</span>
                <Check className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Skip for now (Use default)
              </button>
            </div>
          </form>
        </GlassSurface>
      </div>
    </div>
  );
};
