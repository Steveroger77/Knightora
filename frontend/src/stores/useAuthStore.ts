import { create } from 'zustand';
import { User, AuthMethod } from '../types';
import { useProjectStore } from './useProjectStore';
import { supabase, signInWithGoogleOAuth, isSupabaseOnline } from '../lib/supabase';

const SESSION_KEY = 'knightora_session';
const USERS_DB_KEY = 'knightora_registered_users';

interface RegisteredAccount extends User {
  passwordHash?: string;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  authError: string | null;
  isProfileModalOpen: boolean;
  isUsernameOnboardingOpen: boolean;
  pendingGoogleUser: User | null;

  // Actions
  initializeAuth: () => Promise<void>;
  clearAuthError: () => void;
  loginWithGoogle: (
    rememberMe?: boolean,
    accountDetails?: { email?: string; displayName?: string; avatarUrl?: string }
  ) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  completeGoogleOnboarding: (username?: string) => void;
  loginWithEmail: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, username: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  convertGuestAccount: (
    method: 'google' | 'email',
    details: { email?: string; password?: string; username?: string },
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { displayName?: string; username?: string; avatarUrl?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setIsUsernameOnboardingOpen: (open: boolean) => void;
}

// Helpers for user persistence
function getRegisteredUsers(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveRegisteredUser(user: RegisteredAccount) {
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

function checkUsernameTaken(username: string, currentUserId?: string): boolean {
  const users = getRegisteredUsers();
  return users.some((u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== currentUserId);
}

function checkEmailTaken(email: string, currentUserId?: string): boolean {
  const users = getRegisteredUsers();
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== currentUserId);
}

function getStoredSession(): { user: User; rememberMe: boolean } | null {
  try {
    // Check sessionStorage first (active session tab)
    const sessionRaw = sessionStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const parsed = JSON.parse(sessionRaw);
      if (parsed?.user) return parsed;
    }

    // Check localStorage (persisted session when rememberMe was true)
    const localRaw = localStorage.getItem(SESSION_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (parsed?.user && parsed?.rememberMe) return parsed;
    }
  } catch (err) {
    console.warn('[Session Read Error]:', err);
  }
  return null;
}

function saveSession(user: User, rememberMe: boolean) {
  const payload = JSON.stringify({ user, rememberMe });
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, payload);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, payload);
    localStorage.removeItem(SESSION_KEY);
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

const initialSession = getStoredSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: initialSession?.user || null,
  isAuthenticated: !!initialSession?.user,
  rememberMe: initialSession?.rememberMe ?? true,
  authError: null,
  isProfileModalOpen: false,
  isUsernameOnboardingOpen: false,
  pendingGoogleUser: null,

  clearAuthError: () => set({ authError: null }),

  initializeAuth: async () => {
    try {
      // 1. Detect any OAuth error returned in URL query or hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashString = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashString);

      const rawErrorDesc =
        urlParams.get('error_description') ||
        hashParams.get('error_description') ||
        urlParams.get('error') ||
        hashParams.get('error');

      if (rawErrorDesc) {
        const decoded = decodeURIComponent(rawErrorDesc).replace(/\+/g, ' ');
        console.error('[OAuth Redirect Error]:', decoded);
        set({ authError: decoded });
      }

      const hasOAuthCallbackParam =
        urlParams.has('code') ||
        hashParams.has('access_token') ||
        urlParams.has('access_token');

      if (isSupabaseOnline()) {
        // Listen to Supabase Auth State Changes (Google OAuth redirect, token refresh, sign-in)
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const sbUser = session.user;
            const authUser: User = {
              id: sbUser.id,
              email: sbUser.email || '',
              username:
                sbUser.user_metadata?.username || `author_${sbUser.id.slice(0, 5)}`,
              displayName:
                sbUser.user_metadata?.displayName ||
                sbUser.user_metadata?.full_name ||
                sbUser.email?.split('@')[0] ||
                'Google Author',
              avatarUrl:
                sbUser.user_metadata?.avatar_url ||
                sbUser.user_metadata?.picture ||
                undefined,
              createdAt: sbUser.created_at || new Date().toISOString(),
              authMethod: 'google',
              isGuest: false,
              rememberMe: true,
            };
            saveRegisteredUser(authUser);
            saveSession(authUser, true);
            set({ currentUser: authUser, isAuthenticated: true, authError: null });
            await useProjectStore.getState().loadUserWorkspace(authUser.id);
            if (window.location.hash || window.location.search) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          } else if (event === 'SIGNED_OUT') {
            clearSession();
            useProjectStore.getState().clearWorkspace();
            set({ currentUser: null, isAuthenticated: false });
          }
        });

        // Check if there is already an active Supabase session
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const sbUser = data.session.user;
          const authUser: User = {
            id: sbUser.id,
            email: sbUser.email || '',
            username:
              sbUser.user_metadata?.username || `author_${sbUser.id.slice(0, 5)}`,
            displayName:
              sbUser.user_metadata?.displayName ||
              sbUser.user_metadata?.full_name ||
              sbUser.email?.split('@')[0] ||
              'Google Author',
            avatarUrl:
              sbUser.user_metadata?.avatar_url ||
              sbUser.user_metadata?.picture ||
              undefined,
            createdAt: sbUser.created_at || new Date().toISOString(),
            authMethod: 'google',
            isGuest: false,
            rememberMe: true,
          };
          saveRegisteredUser(authUser);
          saveSession(authUser, true);
          set({ currentUser: authUser, isAuthenticated: true, authError: null });
          await useProjectStore.getState().loadUserWorkspace(authUser.id);
          if (window.location.hash || window.location.search) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          return;
        }

        // If URL has code or access_token, the OAuth token exchange is in flight;
        // do not reset workspace to unauthenticated yet — onAuthStateChange will handle it.
        if (hasOAuthCallbackParam) {
          return;
        }
      }

      // Check stored local session (only if rememberMe was true in localStorage, or active in sessionStorage)
      const sessionData = getStoredSession();
      if (sessionData && sessionData.user) {
        set({
          currentUser: sessionData.user,
          isAuthenticated: true,
          rememberMe: sessionData.rememberMe ?? true,
        });
        await useProjectStore.getState().loadUserWorkspace(sessionData.user.id);
      } else {
        // Fresh browser opening: start with clean unauthenticated state
        set({ currentUser: null, isAuthenticated: false });
        useProjectStore.getState().clearWorkspace();
      }
    } catch (err) {
      console.warn('Failed to load session:', err);
      set({ currentUser: null, isAuthenticated: false });
      useProjectStore.getState().clearWorkspace();
    }
  },

  loginWithGoogle: async (
    rememberMe = true,
    accountDetails?: { email?: string; displayName?: string; avatarUrl?: string }
  ) => {
    try {
      if (isSupabaseOnline()) {
        await signInWithGoogleOAuth();
        return { success: true, isNewUser: true };
      }
    } catch (err: any) {
      console.error('[Supabase OAuth Notice]:', err?.message || err);
      return { success: false, error: err?.message || 'Google sign-in failed. Please check popup permissions or try again.' };
    }

    // Require an email address for Google sign in
    const email = accountDetails?.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid Google email address.' };
    }

    let displayName = accountDetails?.displayName?.trim();
    if (!displayName) {
      const localPart = email.split('@')[0] || 'Google Author';
      displayName = localPart
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const users = getRegisteredUsers();

    // Check if this Google account already exists
    let existing = users.find(
      (u) => u.email.toLowerCase() === email && u.authMethod === 'google'
    );

    // Stable, deterministic user ID tied directly to this user's Google email
    const safeEmailKey = email.replace(/[^a-zA-Z0-9]/g, '_');
    const userId = existing?.id || `usr_g_${safeEmailKey}`;
    const username = existing?.username || (email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') || `author_${Math.floor(Math.random() * 9000) + 1000}`);

    const initial = displayName.charAt(0).toUpperCase() || 'G';
    const avatarSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="%231E293B"/><circle cx="48" cy="48" r="44" stroke="%234285F4" stroke-width="4" fill="none"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="700" fill="%2360A5FA" text-anchor="middle" dominant-baseline="middle">${initial}</text><circle cx="74" cy="74" r="16" fill="%2334A853"/><text x="74" y="77" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23FFFFFF" text-anchor="middle" dominant-baseline="middle">G</text></svg>`;
    const avatarUrl = accountDetails?.avatarUrl || existing?.avatarUrl || avatarSvg;

    const authUser: User = {
      id: userId,
      email,
      username,
      displayName,
      avatarUrl,
      createdAt: existing?.createdAt || new Date().toISOString(),
      authMethod: 'google',
      isGuest: false,
      rememberMe,
    };

    saveRegisteredUser(authUser);
    saveSession(authUser, rememberMe);

    set({
      currentUser: authUser,
      isAuthenticated: true,
      pendingGoogleUser: existing ? null : authUser,
      isUsernameOnboardingOpen: !existing,
      rememberMe,
    });

    // Load this user's isolated workspace immediately
    await useProjectStore.getState().loadUserWorkspace(userId);

    return { success: true, isNewUser: !existing };
  },

  completeGoogleOnboarding: (customUsername?: string) => {
    const { pendingGoogleUser, rememberMe } = get();
    if (!pendingGoogleUser) return;

    let finalUsername = pendingGoogleUser.username;
    if (customUsername && customUsername.trim()) {
      const cleanName = customUsername.trim().replace(/^@/, '');
      if (!checkUsernameTaken(cleanName, pendingGoogleUser.id)) {
        finalUsername = cleanName;
      }
    }

    const updatedUser: User = { ...pendingGoogleUser, username: finalUsername };
    saveRegisteredUser(updatedUser);
    saveSession(updatedUser, rememberMe);

    set({
      currentUser: updatedUser,
      isAuthenticated: true,
      pendingGoogleUser: null,
      isUsernameOnboardingOpen: false,
    });
  },

  loginWithEmail: async (identifier: string, password: string, rememberMe = true) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanUsername = cleanId.startsWith('@') ? cleanId.substring(1) : cleanId;
    const users = getRegisteredUsers();

    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanUsername) &&
        u.authMethod === 'email'
    );

    if (!user) {
      return { success: false, error: 'No account found with that email or username.' };
    }

    if (user.passwordHash && user.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const sessionUser: User = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      authMethod: 'email',
      isGuest: false,
      rememberMe,
    };

    saveSession(sessionUser, rememberMe);
    set({ currentUser: sessionUser, isAuthenticated: true, rememberMe });

    // Load user's private workspace
    await useProjectStore.getState().loadUserWorkspace(sessionUser.id);
    return { success: true };
  },

  signUpWithEmail: async (email: string, password: string, username: string, rememberMe = true) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().replace(/^@/, '');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    if (checkEmailTaken(cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    if (checkUsernameTaken(cleanUsername)) {
      return { success: false, error: 'Username is already taken. Please choose another.' };
    }

    const newUser: RegisteredAccount = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      authMethod: 'email',
      isGuest: false,
      passwordHash: password,
      rememberMe,
    };

    saveRegisteredUser(newUser);

    const sessionUser: User = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      displayName: newUser.displayName,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
      authMethod: 'email',
      isGuest: false,
      rememberMe,
    };

    saveSession(sessionUser, rememberMe);
    set({ currentUser: sessionUser, isAuthenticated: true, rememberMe });

    // Initialize fresh workspace for new email user
    await useProjectStore.getState().loadUserWorkspace(sessionUser.id);
    return { success: true };
  },

  loginAsGuest: async () => {
    const guestId = 'guest_' + Math.floor(Math.random() * 90000 + 10000);
    const guestUser: User = {
      id: guestId,
      email: `${guestId}@guest.knightora.studio`,
      username: `guest_${guestId.slice(-5)}`,
      displayName: `Guest Author #${guestId.slice(-4)}`,
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      authMethod: 'guest',
      isGuest: true,
      rememberMe: true,
    };

    saveSession(guestUser, false);
    set({ currentUser: guestUser, isAuthenticated: true, rememberMe: false });

    await useProjectStore.getState().loadUserWorkspace(guestId);
  },

  convertGuestAccount: async (method, details, rememberMe = true) => {
    const { currentUser } = get();
    if (!currentUser || !currentUser.isGuest) {
      return { success: false, error: 'No active guest account found.' };
    }

    let newUser: RegisteredAccount;

    if (method === 'google') {
      const email = (details.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Valid Google email is required.' };
      }
      const safeEmailKey = email.replace(/[^a-zA-Z0-9]/g, '_');
      newUser = {
        id: `usr_g_${safeEmailKey}`,
        email,
        username: details.username || email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
        displayName: 'Google Author',
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        authMethod: 'google',
        isGuest: false,
        rememberMe,
      };
    } else {
      const cleanEmail = (details.email || '').trim().toLowerCase();
      const cleanUsername = (details.username || '').trim().replace(/^@/, '');
      const password = details.password || '';

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Valid email is required.' };
      }
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }
      if (!cleanUsername || cleanUsername.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters.' };
      }

      if (checkEmailTaken(cleanEmail)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      if (checkUsernameTaken(cleanUsername)) {
        return { success: false, error: 'Username is already taken.' };
      }

      newUser = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: cleanEmail,
        username: cleanUsername,
        displayName: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        authMethod: 'email',
        isGuest: false,
        passwordHash: password,
        rememberMe,
      };
    }

    saveRegisteredUser(newUser);

    // Migrate guest projects to the new user ID
    const projectStore = useProjectStore.getState();
    const guestProjects = projectStore.projects.map((p) => {
      if (p.userId === currentUser.id) {
        return { ...p, userId: newUser.id };
      }
      return p;
    });

    useProjectStore.setState({ projects: guestProjects, currentUserId: newUser.id });

    const sessionUser: User = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      displayName: newUser.displayName,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
      authMethod: newUser.authMethod,
      isGuest: false,
      rememberMe,
    };

    saveSession(sessionUser, rememberMe);
    set({ currentUser: sessionUser, isAuthenticated: true, rememberMe });
    return { success: true };
  },

  updateProfile: async (data) => {
    const { currentUser } = get();
    if (!currentUser) return { success: false, error: 'Not logged in.' };

    if (data.username && data.username.trim() !== currentUser.username) {
      const cleanUsername = data.username.trim().replace(/^@/, '');
      if (checkUsernameTaken(cleanUsername, currentUser.id)) {
        return { success: false, error: 'Username is already taken by another author.' };
      }
      currentUser.username = cleanUsername;
    }

    if (data.displayName && data.displayName.trim()) {
      currentUser.displayName = data.displayName.trim();
    }

    if (data.avatarUrl !== undefined) {
      currentUser.avatarUrl = data.avatarUrl;
    }

    if (data.password && currentUser.authMethod === 'email') {
      const users = getRegisteredUsers();
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx >= 0) {
        users[idx].passwordHash = data.password;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }
    }

    const updatedUser = { ...currentUser };
    saveRegisteredUser(updatedUser);
    saveSession(updatedUser, get().rememberMe);
    set({ currentUser: updatedUser });

    return { success: true };
  },

  resetPassword: async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No account registered with that email.' };
    }

    return {
      success: true,
      message: `Password reset link has been sent to ${cleanEmail}. Check your inbox.`,
    };
  },

  logout: () => {
    clearSession();
    if (isSupabaseOnline()) {
      try {
        supabase.auth.signOut();
      } catch (_) {}
    }
    useProjectStore.getState().clearWorkspace();
    set({
      currentUser: null,
      isAuthenticated: false,
      isProfileModalOpen: false,
      isUsernameOnboardingOpen: false,
      pendingGoogleUser: null,
    });
  },

  setIsProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  setIsUsernameOnboardingOpen: (open) => set({ isUsernameOnboardingOpen: open }),
}));
