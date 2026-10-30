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
      {/* SOLID & PERMANENT KNIGHT LOGIN BACKGROUND - ZERO FLICKER / ZERO DISAPPEAR */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <picture className="w-full h-full block">
          <source srcSet="/backgrounds/knight-login.webp" type="image/webp" />
          <img
            src="/backgrounds/knight-login.png"
            alt="Knightora Login"
            className="w-full h-full object-cover object-center block"
            loading="eager"
            decoding="sync"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('knight-login.png')) {
                target.src = '/backgrounds/knight-login.png';
              } else if (!target.src.includes('knight-sunset.webp')) {
                target.src = '/backgrounds/knight-sunset.webp';
              }
            }}
          />
        </picture>
        {/* Subtle cinematic gradient overlay for high contrast while maintaining luminosity */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />
      </div>

      {/* SEMI-TRANSPARENT FROSTED GLASS LOGIN CARD */}
      <div className="relative z-10 w-full max-w-[340px]">
        <GlassSurface
          borderRadius={24}
          blur={20}
          opacity={0.35}
          saturation={1.8}
          className="p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_24px_rgba(56,189,248,0.12)] border border-white/20 hover:border-aurora-400/40 transition-all backdrop-blur-xl relative"
        >
          {/* Specular frosted glass top highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Header Branding - Minimal Frosted */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-white/90 via-slate-200/80 to-slate-400/80 border border-white/60 shadow-[0_0_16px_rgba(255,255,255,0.4)] text-slate-900 mb-2">
              <Shield className="w-5 h-5 text-slate-950 fill-slate-900/20" />
            </div>
            <h1 className="font-serif font-bold text-base tracking-wider text-white uppercase drop-shadow-md">
              KNIGHTORA
            </h1>
            <p className="text-[10px] text-aurora-300 font-medium tracking-wide mt-0.5 drop-shadow-sm">
              Words to Worlds
            </p>
          </div>

          {/* Alert Messages */}
          {(error || authError) && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/25 border border-rose-400/40 text-rose-200 text-[11px] flex items-center gap-2 backdrop-blur-md">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-300" />
              <span className="truncate">{error || authError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[11px] flex items-center gap-2 backdrop-blur-md">
              <Check className="w-3.5 h-3.5 flex-shrink-0 text-emerald-300" />
              <span className="truncate">{successMsg}</span>
            </div>
          )}

          {/* PRIMARY GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md hover:scale-[1.01] cursor-pointer border border-white mb-3.5 outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Frosted Divider */}
          <div className="relative flex items-center justify-center my-3.5">
            <div className="w-full border-t border-white/15" />
            <span className="bg-slate-900/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 text-[9px] uppercase tracking-wider text-slate-300 font-mono absolute">
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
                  className="w-full bg-black/35 backdrop-blur-md border border-white/15 hover:border-white/25 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aurora-400 focus:bg-black/50 transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aurora-500 via-sky-500 to-teal-400 hover:brightness-110 text-white font-bold text-xs shadow-glow-sm cursor-pointer outline-none transition-all"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => { setMode('signin'); clearState(); }}
                className="w-full text-center text-[11px] text-aurora-300 hover:text-aurora-200 hover:underline cursor-pointer pt-1 outline-none transition-all"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <div>
              {/* Frosted Mode Tabs */}
              <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-xl border border-white/15 mb-3">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); clearState(); }}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer outline-none border ${
                    mode === 'signin'
                      ? 'bg-aurora-500/35 text-white border-aurora-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'text-slate-300 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); clearState(); }}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer outline-none border ${
                    mode === 'signup'
                      ? 'bg-aurora-500/35 text-white border-aurora-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'text-slate-300 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Frosted Form Fields */}
              <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-2.5">
                {mode === 'signin' ? (
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Email or Username"
                      className="w-full bg-black/35 backdrop-blur-md border border-white/15 hover:border-white/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aurora-400 focus:bg-black/50 transition-all outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-black/35 backdrop-blur-md border border-white/15 hover:border-white/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aurora-400 focus:bg-black/50 transition-all outline-none"
                      />
                    </div>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full bg-black/35 backdrop-blur-md border border-white/15 hover:border-white/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aurora-400 focus:bg-black/50 transition-all outline-none"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-black/35 backdrop-blur-md border border-white/15 hover:border-white/25 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aurora-400 focus:bg-black/50 transition-all outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-200 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-white/20 bg-black/40 text-aurora-500 focus:ring-0 outline-none"
                    />
                    <span className="text-slate-300">Remember me</span>
                  </label>

                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); clearState(); }}
                      className="text-aurora-300 hover:text-aurora-200 hover:underline cursor-pointer outline-none"
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aurora-500 via-sky-500 to-teal-400 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow-sm cursor-pointer mt-1 outline-none"
                >
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Frosted Guest Link */}
          <div className="mt-3.5 pt-3 border-t border-white/15 text-center">
            <button
              onClick={loginAsGuest}
              className="text-xs text-slate-200 hover:text-white flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/15 transition-all cursor-pointer outline-none"
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
