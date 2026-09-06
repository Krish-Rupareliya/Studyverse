import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: UserProfile;
  users: UserProfile[];
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  getUserById: (id: string) => UserProfile | undefined;
  getUserByUsername: (username: string) => UserProfile | undefined;
  isUsernameAvailable: (username: string, excludeUserId?: string) => boolean;
  createAccount: (userData: Omit<UserProfile, 'id' | 'studyStats' | 'badges' | 'privacySettings'>) => UserProfile;
  allUsers: UserProfile[];
}

const USERS_STORAGE_KEY = 'studyspace_all_users_v1';
const CURRENT_USER_ID_KEY = 'studyspace_current_user_id_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_ID_KEY);
      if (saved && users.some((u) => u.id === saved)) {
        return saved;
      }
    } catch {}
    return 'user_alex'; // Default to Test User A
  });

  // Sync users to storage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  // Sync current user ID to storage
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_USER_ID_KEY, currentUserId);
    } catch {}
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const switchUser = (userId: string) => {
    if (users.some((u) => u.id === userId)) {
      // Mark new user as online and update last seen
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return { ...u, status: 'online', lastSeen: Date.now() };
          }
          return u;
        })
      );
      setCurrentUserId(userId);
    }
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUserId) {
          return { ...u, ...updates, lastSeen: Date.now() };
        }
        return u;
      })
    );
  };

  const getUserById = (id: string) => {
    return users.find((u) => u.id === id);
  };

  const getUserByUsername = (username: string) => {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    return users.find((u) => u.username.toLowerCase() === clean);
  };

  const isUsernameAvailable = (username: string, excludeUserId?: string) => {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    if (!clean || clean.length < 3) return false;
    return !users.some((u) => u.username.toLowerCase() === clean && u.id !== excludeUserId);
  };

  const createAccount = (userData: Omit<UserProfile, 'id' | 'studyStats' | 'badges' | 'privacySettings'>): UserProfile => {
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

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return newUser;
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
