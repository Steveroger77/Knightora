import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { GlassSurface } from '../ui/GlassSurface';
import { Shield, User, Mail, Lock, Check, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { GoogleSignInModal } from './GoogleSignInModal';
import { isSupabaseOnline } from '../../lib/supabase';


export const LoginModal: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, loginAsGuest, resetPassword, authError, clearAuthError } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearState = () => {
    setError(null);
    setSuccessMsg(null);
    clearAuthError();
  };

  const handleGoogleLogin = async () => {
    clearState();
    if (isSupabaseOnline()) {
      setLoading(true);
      try {
        const res = await loginWithGoogle(rememberMe);
        if (!res.success && res.error) {
          setError(res.error);
        }
      } catch (err: any) {
        setError(err?.message || 'Google sign-in failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // In standalone browser mode: open Google modal so user signs in with THEIR OWN Google account
      setIsGoogleModalOpen(true);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();
    if (!identifier || !password) {
      setError('Enter email/username & password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(identifier, password, rememberMe);
      if (!res.success && res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();
    if (!email || !username || !password) {
      setError('Fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUpWithEmail(email, password, username, rememberMe);
      if (!res.success && res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();
    if (!email) {
      setError('Enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError('Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end p-4 md:pr-36 lg:pr-72 overflow-hidden select-none bg-obsidian-950">
      {/* PURE UNBLURRED & UN-DARKENED KNIGHT LOGIN BACKGROUND IMAGE — INSTANT WEBP */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 pointer-events-none scale-100 transform-gpu"
        style={{ backgroundImage: 'url(/backgrounds/knight-login.webp)' }}
      />

      {/* SMALL & MINIMAL LIQUID GLASS LOGIN CARD */}
      <div className="relative z-10 w-full max-w-[340px]">
        <GlassSurface
          borderRadius={20}
          borderWidth={0.06}
          blur={14}
          displace={0.85}
          distortionScale={-35}
          redOffset={0}
          greenOffset={0}
          blueOffset={0}
          mixBlendMode="normal"
          brightness={50}
          opacity={0.94}
          className="p-5 shadow-2xl border-aurora-500/30 ink-bleed-reveal"
        >
          {/* Header Branding - Minimal */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border border-white/60 shadow-[0_0_14px_rgba(255,255,255,0.4)] text-slate-900 mb-1.5">
              <Shield className="w-4.5 h-4.5 text-slate-950 fill-slate-900/20" />
            </div>
            <h1 className="font-serif font-bold text-base tracking-wider text-white uppercase">
              KNIGHTORA
            </h1>
            <p className="text-[10px] text-aurora-400 font-medium tracking-wide mt-0.5">
              Words to Worlds
            </p>
          </div>

          {/* Alert Messages */}
          {(error || authError) && (
            <div className="mb-3 p-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{error || authError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{successMsg}</span>
            </div>
          )}

          {/* PRIMARY GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-glow-sm hover:scale-[1.01] cursor-pointer border border-white/40 mb-3 outline-none focus:outline-none focus:ring-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Minimal Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-aurora-500/20" />
            <span className="bg-obsidian-950/80 px-2 text-[9px] uppercase tracking-wider text-slate-400 font-mono absolute">
              or
            </span>
          </div>

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' ? (
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="w-full bg-obsidian-950/80 border border-aurora-500/25 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-400 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-aurora-500 to-teal-500 text-white font-bold text-xs shadow-glow-sm cursor-pointer outline-none focus:outline-none"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => { setMode('signin'); clearState(); }}
                className="w-full text-center text-[11px] text-aurora-400 hover:underline cursor-pointer pt-1 outline-none focus:outline-none"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <div>
              {/* MINIMAL MODE TAB - FIXED OUTLINE & BORDER GLITCH */}
              <div className="flex bg-obsidian-950/80 p-0.5 rounded-lg border border-aurora-500/25 mb-3">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); clearState(); }}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 border ${
                    mode === 'signin'
                      ? 'bg-aurora-500/30 text-aurora-200 border-aurora-500/40 shadow-sm'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); clearState(); }}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 border ${
                    mode === 'signup'
                      ? 'bg-aurora-500/30 text-aurora-200 border-aurora-500/40 shadow-sm'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* COMPACT FORM FIELDS */}
              <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-2.5">
                {mode === 'signin' ? (
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Email or Username"
                      className="w-full bg-obsidian-950/80 border border-aurora-500/25 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-400 outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-obsidian-950/80 border border-aurora-500/25 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-400 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full bg-obsidian-950/80 border border-aurora-500/25 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-400 outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-obsidian-950/80 border border-aurora-500/25 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aurora-400 outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3 h-3 rounded border-aurora-500/30 bg-obsidian-950 text-aurora-500 outline-none"
                    />
                    <span>Remember me</span>
                  </label>

                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); clearState(); }}
                      className="text-aurora-400 hover:underline cursor-pointer outline-none focus:outline-none"
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-aurora-500 via-aurora-600 to-teal-500 hover:from-aurora-400 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-sm cursor-pointer mt-1 outline-none focus:outline-none"
                >
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* COMPACT GUEST LINK */}
          <div className="mt-3 pt-2.5 border-t border-aurora-500/20 text-center">
            <button
              onClick={loginAsGuest}
              className="text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1.5 w-full py-1 rounded-lg hover:bg-aurora-500/15 transition-all cursor-pointer outline-none focus:outline-none"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Continue as Guest</span>
            </button>
          </div>
        </GlassSurface>
      </div>

      {/* Standalone Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        rememberMe={rememberMe}
      />
    </div>
  );
};
