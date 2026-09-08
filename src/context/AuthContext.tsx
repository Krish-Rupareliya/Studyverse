import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { dataService } from '../services/base44DataService';
import { base44, isBase44Enabled } from '../api/base44Client';

const CURRENT_USER_ID_KEY = 'studyspace_current_user_id_v2';

interface AuthContextType {
  currentUser: UserProfile | undefined;
  users: UserProfile[];
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  getUserById: (id: string) => UserProfile | undefined;
  getUserByUsername: (username: string) => UserProfile | undefined;
  isUsernameAvailable: (username: string, excludeUserId?: string) => boolean;
  createAccount: (userData: Omit<UserProfile, 'id' | 'studyStats' | 'badges' | 'privacySettings'>) => UserProfile;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load all users from Base44 (or localStorage fallback) on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fetched = await dataService.list<UserProfile>('UserProfile');
        if (!mounted) return;
        setUsers(fetched);

        // Restore current user
        try {
          const saved = localStorage.getItem(CURRENT_USER_ID_KEY);
          if (saved && fetched.some(u => u.id === saved)) {
            setCurrentUserId(saved);
          }
        } catch {}

        // If using Base44 auth, try to get the current user from the session
        if (isBase44Enabled() && base44) {
          try {
            const authUser = await base44.auth.me();
            if (authUser && mounted) {
              // Find or create profile from auth user
              const existing = fetched.find(u => u.id === authUser.id);
              if (existing) {
                setCurrentUserId(authUser.id);
              }
            }
          } catch {
            // Not authenticated with Base44 yet — that's OK
          }
        }
      } catch (e) {
        console.error('Failed to load users:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Subscribe to UserProfile changes (Base44 real-time)
  useEffect(() => {
    if (!isBase44Enabled()) return;
    const unsub = dataService.subscribe<UserProfile>('UserProfile', (event) => {
      if (event.type === 'create') {
        setUsers(prev => {
          if (prev.some(u => u.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      } else if (event.type === 'update') {
        setUsers(prev => prev.map(u => u.id === event.data.id ? { ...u, ...event.data } : u));
      } else if (event.type === 'delete') {
        setUsers(prev => prev.filter(u => u.id !== event.id));
      }
    });
    return unsub;
  }, []);

  // Sync current user ID to storage
  useEffect(() => {
    if (currentUserId) {
      try { localStorage.setItem(CURRENT_USER_ID_KEY, currentUserId); } catch {}
    }
  }, [currentUserId]);

  // Sync users to localStorage (for fallback mode)
  useEffect(() => {
    if (!isBase44Enabled()) {
      try { localStorage.setItem('studyspace_all_users_v2', JSON.stringify(users)); } catch {}
    }
  }, [users]);

  const currentUser = users.find(u => u.id === currentUserId);

  const switchUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) return { ...u, status: 'online', lastSeen: Date.now() };
      return u;
    }));
    setCurrentUserId(userId);
  }, []);

  const updateCurrentUserProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!currentUserId) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUserId) return { ...u, ...updates, lastSeen: Date.now() };
      return u;
    }));
    // Persist to backend
    dataService.update<UserProfile>('UserProfile', currentUserId, updates).catch(() => {});
  }, [currentUserId]);

  const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);

  const getUserByUsername = useCallback((username: string) => {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    return users.find(u => u.username.toLowerCase() === clean);
  }, [users]);

  const isUsernameAvailable = useCallback((username: string, excludeUserId?: string) => {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    if (!clean || clean.length < 3) return false;
    return !users.some(u => u.username.toLowerCase() === clean && u.id !== excludeUserId);
  }, [users]);

  const createAccount = useCallback((userData: Omit<UserProfile, 'id' | 'studyStats' | 'badges' | 'privacySettings'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username: userData.username.trim().toLowerCase().replace(/^@/, ''),
      joinedDate: userData.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      status: 'online',
      lastSeen: Date.now(),
      studyStats: {
        totalHours: 0,
        weeklyHours: 0,
        completedSessions: 0,
        streakDays: 1,
        level: 1,
        xp: 100,
        focusScore: 100,
      },
      badges: [
        {
          id: 'b_welcome',
          title: 'Welcome to StudySpace',
          description: 'Created account and joined the community',
          icon: '🎓',
          unlockedAt: new Date().toISOString().split('T')[0],
        },
      ],
      privacySettings: {
        showStats: 'public',
        showActivity: 'public',
        allowDirectMessages: 'everyone',
        allowRoomInvites: 'everyone',
      },
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    // Persist to backend
    dataService.create<UserProfile>('UserProfile', newUser).catch(() => {});
    return newUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        allUsers: users,
        switchUser,
        updateCurrentUserProfile,
        getUserById,
        getUserByUsername,
        isUsernameAvailable,
        createAccount,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
