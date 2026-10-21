import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { GlassSurface } from '../ui/GlassSurface';
import { User, X, Mail, Shield, Calendar, LogOut, Check, AlertCircle, Sparkles, KeyRound, UserCheck, Lock } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { currentUser, isProfileModalOpen, setIsProfileModalOpen, updateProfile, convertGuestAccount, logout } = useAuthStore();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  
  // Guest Conversion inline state
  const [isConvertingGuest, setIsConvertingGuest] = useState(false);
  const [convertMethod, setConvertMethod] = useState<'email' | 'google'>('email');
  const [convertEmail, setConvertEmail] = useState('');
  const [convertUsername, setConvertUsername] = useState('');
  const [convertPassword, setConvertPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await updateProfile({
        displayName,
        username,
        avatarUrl,
        password: newPassword || undefined,
      });

      if (res.success) {
        setSuccess('Profile updated successfully!');
        setNewPassword('');
      } else {
        setError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestConversionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await convertGuestAccount(convertMethod, {
        email: convertEmail,
        username: convertUsername,
        password: convertPassword,
      });

      if (res.success) {
        setSuccess('Your Guest Account has been converted! All projects and data migrated.');
        setIsConvertingGuest(false);
      } else {
        setError(res.error || 'Failed to convert account.');
      }
    } catch (err: any) {
      setError(err.message || 'Account conversion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/60 backdrop-blur-md p-4 select-none animate-in fade-in duration-300">
      <div className="w-full max-w-lg">
        <GlassSurface
          borderRadius={24}
          borderWidth={1.5}
          blur={24}
          brightness={50}
          opacity={0.72}
          className="p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.7)] border-aurora-500/30 max-h-[90vh] overflow-y-auto custom-scrollbar relative backdrop-blur-xl bg-obsidian-950/40"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-obsidian-900/60 text-slate-400 hover:text-white hover:bg-aurora-500/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-aurora-500/20">
            <div className="relative group">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-aurora-500/40 shadow-glow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-glow-sm border-2 border-aurora-500/40">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-serif font-bold text-xl text-white flex items-center gap-2">
                <span>{currentUser.displayName}</span>
                {currentUser.isGuest && (
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-md uppercase">
                    Guest
                  </span>
                )}
              </h2>
              <p className="text-xs text-aurora-400 font-mono">@{currentUser.username}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-400" />
                  <span className="capitalize">{currentUser.authMethod} Auth</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* GUEST ACCOUNT CONVERSION CTA BANNER */}
          {currentUser.isGuest && !isConvertingGuest && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-aurora-500/15 via-teal-500/10 to-transparent border border-aurora-500/30 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-aurora-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Convert Guest Account</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Save all your guest projects & Story Bible data permanently.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertingGuest(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-aurora-500 to-teal-500 text-white font-bold text-xs shadow-glow-sm hover:scale-105 transition-all cursor-pointer flex-shrink-0"
              >
                Register Now
              </button>
            </div>
          )}

          {/* GUEST CONVERSION FORM */}
          {currentUser.isGuest && isConvertingGuest ? (
            <form onSubmit={handleGuestConversionSubmit} className="space-y-4 mb-6 p-4 rounded-2xl bg-obsidian-950/80 border border-aurora-500/30">
              <div className="flex items-center justify-between border-b border-aurora-500/20 pb-2">
                <h4 className="font-bold text-xs text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-aurora-400" />
                  <span>Migrate Guest Projects to Account</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsConvertingGuest(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConvertMethod('email')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    convertMethod === 'email'
                      ? 'bg-aurora-500/20 text-aurora-300 border-aurora-500/40'
                      : 'bg-obsidian-900/50 text-slate-400 border-transparent'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => setConvertMethod('google')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    convertMethod === 'google'
                      ? 'bg-aurora-500/20 text-aurora-300 border-aurora-500/40'
                      : 'bg-obsidian-900/50 text-slate-400 border-transparent'
                  }`}
                >
                  Google Account
                </button>
              </div>

              {convertMethod === 'email' ? (
                <>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={convertEmail}
                      onChange={(e) => setConvertEmail(e.target.value)}
                      placeholder="author@example.com"
                      className="w-full bg-obsidian-900/80 border border-aurora-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={convertUsername}
                      onChange={(e) => setConvertUsername(e.target.value)}
                      placeholder="new_username"
                      className="w-full bg-obsidian-900/80 border border-aurora-500/20 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={convertPassword}
                      onChange={(e) => setConvertPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-obsidian-900/80 border border-aurora-500/20 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  Clicking migrate will link your Google account and automatically transfer all current projects and Story Bible records.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aurora-500 to-teal-500 text-white font-bold text-xs shadow-glow-sm cursor-pointer"
              >
                Complete Account Conversion & Migration
              </button>
            </form>
          ) : (
            /* PROFILE EDIT FORM */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-obsidian-950/70 border border-aurora-500/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-aurora-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Username Handle
                </label>
                <div className="relative">
                  <span className="text-aurora-400 absolute left-3 top-2 text-xs font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-obsidian-950/70 border border-aurora-500/20 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-aurora-500"
                  />
                </div>
              </div>

              {/* Email Address (Read-only for info) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-obsidian-950/40 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Custom Profile Picture URL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Profile Picture URL (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/my-avatar.png"
                    className="flex-1 bg-obsidian-950/70 border border-aurora-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-aurora-500"
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/20 rounded-xl border border-rose-500/30 transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Password Change (Email accounts only) */}
              {currentUser.authMethod === 'email' && (
                <div className="pt-2 border-t border-aurora-500/15">
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    New Password (Optional)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full bg-obsidian-950/70 border border-aurora-500/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-aurora-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-aurora-500/20">
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-aurora-500 to-teal-500 hover:from-aurora-400 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}
        </GlassSurface>
      </div>
    </div>
  );
};
