import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Home,
  Globe,
  MessageSquare,
  BarChart2,
  Users,
  User,
  Sparkles,
  ChevronRight,
  Circle,
} from 'lucide-react';

export type AppView = 'home' | 'rooms' | 'room_active' | 'stats' | 'friends' | 'messages' | 'workspace' | 'feed' | 'profile';

interface StudyverseSidebarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenProfile: (username: string) => void;
}

export const StudyverseSidebar: React.FC<StudyverseSidebarProps> = ({
  currentView,
  setCurrentView,
  onOpenProfile,
}) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const { activeRoom, getUnreadMessagesCount, showToast } = useApp();

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    };
    if (showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusMenu]);

  const unreadDMs = typeof getUnreadMessagesCount === 'function' ? getUnreadMessagesCount(currentUser?.id || '') : 0;

  // Initials for avatar bubble
  const initials = (currentUser?.name || 'DI')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currentStatus = currentUser?.status || 'online';

  const statusConfig = {
    online: {
      label: 'Online',
      color: 'bg-emerald-500',
      ring: 'ring-emerald-500/30',
      border: 'border-emerald-500',
      dotColor: '#10B981',
      desc: 'Available to study & chat',
    },
    studying: {
      label: 'In Focus',
      color: 'bg-[#8B5CF6]',
      ring: 'ring-purple-500/30',
      border: 'border-purple-500',
      dotColor: '#8B5CF6',
      desc: 'Deep focus study session',
    },
    away: {
      label: 'Away',
      color: 'bg-amber-500',
      ring: 'ring-amber-500/30',
      border: 'border-amber-500',
      dotColor: '#F59E0B',
      desc: 'Taking a study break',
    },
    offline: {
      label: 'Offline',
      color: 'bg-slate-500',
      ring: 'ring-slate-500/30',
      border: 'border-slate-500',
      dotColor: '#6B7280',
      desc: 'Invisible / Offline',
    },
  }[currentStatus] || {
    label: 'Online',
    color: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    border: 'border-emerald-500',
    dotColor: '#10B981',
    desc: 'Available to study',
  };

  const handleStatusChange = (newStatus: 'online' | 'studying' | 'away' | 'offline') => {
    updateCurrentUserProfile({ status: newStatus });
    setShowStatusMenu(false);
    showToast(
      'Status Updated',
      `Your connection status is now ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`,
      'info'
    );
  };

  return (
    <aside className="hidden md:flex w-16 sm:w-18 bg-[#0D0B1D] border-r border-[#1E1938] flex-col items-center py-4 justify-between shrink-0 select-none z-40">
      {/* Top Logo & Navigation Icons */}
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Studyverse 'S' Logo */}
        <button
          onClick={() => setCurrentView('home')}
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white shadow-lg shadow-purple-900/30 hover:scale-105 transition transform"
          title="Studyverse Home"
        >
          {/* Stylized Modern S Wave Logo */}
          <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c-2.49 0-4-1.51-4-3.5 0-1.74 1.16-2.88 3.2-3.32l1.6-.35c1.07-.23 1.5-.66 1.5-1.33 0-.89-.78-1.5-2.1-1.5-1.42 0-2.25.68-2.3 1.83H9.1c.06-2.02 1.63-3.33 3.8-3.33 2.38 0 3.9 1.41 3.9 3.32 0 1.62-1.07 2.72-3.1 3.16l-1.6.35c-1.12.25-1.6.68-1.6 1.42 0 .96.87 1.6 2.2 1.6 1.54 0 2.45-.73 2.5-1.92h1.8c-.06 2.19-1.7 3.27-3.9 3.27z" />
          </svg>
        </button>

        <div className="w-8 h-px bg-[#231F45]" />

        {/* Main Nav Items */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {/* Home */}
          <button
            onClick={() => setCurrentView('home')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'home'
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-600/40'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Public Rooms / Explore */}
          <button
            onClick={() => setCurrentView('rooms')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative ${
              currentView === 'rooms' || currentView === 'room_active'
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-600/40'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
            title="Public Study Rooms"
          >
            <Globe className="w-5 h-5" />
            {activeRoom && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Direct Messages */}
          <button
            onClick={() => setCurrentView('messages')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative ${
              currentView === 'messages'
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-600/40'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadDMs > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                {unreadDMs}
              </span>
            )}
          </button>

          {/* Study Stats / Analytics */}
          <button
            onClick={() => setCurrentView('stats')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'stats'
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-600/40'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
            title="Study Stats & Streaks"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          {/* Friends */}
          <button
            onClick={() => setCurrentView('friends')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              currentView === 'friends'
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-600/40'
                : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
            }`}
            title="Study Friends"
          >
            <Users className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Bottom Profile Avatar, Connection Status & Community Link */}
      <div className="flex flex-col items-center gap-2.5 w-full relative" ref={statusMenuRef}>
        {/* Connection Status Indicator Popover Menu */}
        {showStatusMenu && (
          <div className="absolute bottom-12 left-16 w-56 bg-[#161230] border border-[#2E2856] rounded-2xl p-2.5 shadow-2xl z-50 animate-fade-in text-slate-200">
            <div className="px-2 py-1.5 border-b border-[#26214A] mb-1.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-[#8E8AAB]">@{currentUser.username}</p>
              </div>
              <button
                onClick={() => {
                  setShowStatusMenu(false);
                  onOpenProfile(currentUser.username);
                }}
                className="text-[10px] text-[#A78BFA] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Profile</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="text-[10px] font-bold text-[#8E8AAB] px-2 py-1 uppercase tracking-wider">
              Set Connection Status
            </div>

            <div className="space-y-1">
              {(
                [
                  { id: 'online', label: 'Online', dot: 'bg-emerald-500', sub: 'Available to study' },
                  { id: 'studying', label: 'In Focus', dot: 'bg-[#8B5CF6]', sub: 'Deep focus study session' },
                  { id: 'away', label: 'Away', dot: 'bg-amber-500', sub: 'Taking a study break' },
                  { id: 'offline', label: 'Offline', dot: 'bg-slate-500', sub: 'Invisible / Offline' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleStatusChange(opt.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                    currentStatus === opt.id
                      ? 'bg-[#6D28D9]/30 border border-[#8B5CF6]/40 text-white'
                      : 'hover:bg-[#1E1938] text-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${opt.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold leading-tight">{opt.label}</p>
                    <p className="text-[10px] text-[#8E8AAB] truncate">{opt.sub}</p>
                  </div>
                  {currentStatus === opt.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Avatar with Connection Status Dot */}
        <div className="relative group">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="relative p-0.5 rounded-full transition cursor-pointer"
            title={`Connection Status: ${statusConfig.label} (Click to change)`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-[#0D0B1D] font-extrabold flex items-center justify-center text-sm shadow-md ring-2 ring-transparent group-hover:ring-[#8B5CF6]">
              {initials}
            </div>
            {/* Dynamic Status Indicator Dot */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${statusConfig.color} border-2 border-[#0D0B1D] shadow-sm transition-all duration-300 group-hover:scale-110`}
            />
          </button>
        </div>

        {/* Small Connection Status Badge Button under Avatar */}
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white flex items-center gap-1 border transition cursor-pointer ${statusConfig.color} bg-opacity-20 ${statusConfig.border}`}
          title={`Status: ${statusConfig.label}. Click to switch status.`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.color} animate-pulse`} />
          <span>{statusConfig.label}</span>
        </button>

        {/* Discord / Community Icon */}
        <a
          href="https://discord.gg"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8E8AAB] hover:text-white hover:bg-[#1E1938] transition mt-1"
          title="Join Community"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </a>
      </div>
    </aside>
  );
};
