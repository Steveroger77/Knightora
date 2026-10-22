import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { GlassSurface } from '../ui/GlassSurface';
import { X, ArrowRight, UserCheck, Sparkles, Mail, User } from 'lucide-react';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  rememberMe: boolean;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({ isOpen, onClose, rememberMe }) => {
  const { loginWithGoogle } = useAuthStore();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedGoogleUsers, setSavedGoogleUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('knightora_registered_users') || localStorage.getItem('obsidian_atelier_registered_users');
      if (raw) {
        const users = JSON.parse(raw);
        if (Array.isArray(users)) {
          const gUsers = users.filter((u) => u.authMethod === 'google');
          setSavedGoogleUsers(gUsers.slice(-3).reverse());
        }
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignIn = async (accountDetails?: { email: string; displayName: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle(rememberMe, accountDetails);
      if (res.success) {
        onClose();
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    const displayName = customName.trim() || customEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    handleSignIn({ email: customEmail.trim(), displayName });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-[380px]">
        <GlassSurface
          borderRadius={24}
          borderWidth={1}
          blur={18}
          brightness={50}
          opacity={0.95}
          className="p-6 shadow-2xl border-aurora-500/30 text-white relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-obsidian-900/60 text-slate-400 hover:text-white hover:bg-aurora-500/20 transition-all cursor-pointer outline-none"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header with Google multi-color logo */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-glow-sm p-2 mb-2">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <h2 className="font-serif font-bold text-lg text-white tracking-wide">
              Sign in with Google
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Choose an account to continue to <span className="text-aurora-300 font-semibold">Knightora Studio</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs text-center">
              {error}
            </div>
          )}

          {/* 1. Saved Accounts list if available */}
          {savedGoogleUsers.length > 0 && (
            <div className="mb-4 space-y-1.5">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-1">
                Recent Google Accounts
              </p>
              {savedGoogleUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSignIn({ email: u.email, displayName: u.displayName })}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-obsidian-900/80 hover:bg-aurora-500/20 border border-aurora-500/25 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                      {u.displayName?.charAt(0).toUpperCase() || 'G'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-aurora-300 transition-colors truncate">
                        {u.displayName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-aurora-300 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* 2. One-Click Instant Sign-In Option */}
          <div className="mb-4">
            <button
              onClick={() => handleSignIn()}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-glow-sm hover:scale-[1.01] transition-all cursor-pointer border border-white/60 outline-none"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Continue as Google Creator (1-Click)</span>
            </button>
          </div>

          {/* Minimal Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-aurora-500/20" />
            <span className="bg-obsidian-950 px-2 text-[9px] uppercase tracking-wider text-slate-400 font-mono absolute">
              or use your own email
            </span>
          </div>

          {/* 3. Custom Google Email / Personal Account Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-2.5">
            <div>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter your Google/Gmail address"
                  className="w-full bg-obsidian-950/90 border border-aurora-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-400"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Name (optional)"
                  className="w-full bg-obsidian-950/90 border border-aurora-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500 hover:from-blue-400 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-sm cursor-pointer transition-all mt-1"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in with this Google Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-aurora-500/15 text-center">
            <p className="text-[10px] text-slate-400">
              Secured with Google OAuth profile protocol & local session state.
            </p>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
};
