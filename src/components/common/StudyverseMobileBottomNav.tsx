import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AppView } from './StudyverseSidebar';
import {
  Home,
  Globe,
  MessageSquare,
  Users,
  BarChart2,
  Sparkles,
} from 'lucide-react';

interface StudyverseMobileBottomNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenProfile: (username: string) => void;
}

export const StudyverseMobileBottomNav: React.FC<StudyverseMobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenProfile,
}) => {
  const { currentUser } = useAuth();
  const { activeRoom, getUnreadMessagesCount } = useApp();

  const unreadDMs = typeof getUnreadMessagesCount === 'function' ? getUnreadMessagesCount(currentUser?.id || '') : 0;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#0D0B1D]/95 backdrop-blur-xl border-t border-[#1E1938] px-3 py-2 z-40 flex items-center justify-around select-none">
      {/* Home */}
      <button
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition min-w-[54px] min-h-[44px] ${
          currentView === 'home' ? 'text-[#A78BFA]' : 'text-[#8E8AAB]'
        }`}
      >
        <div className={`p-1 rounded-lg ${currentView === 'home' ? 'bg-[#6D28D9]/30 text-white' : ''}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold">Home</span>
      </button>

      {/* Rooms */}
      <button
        onClick={() => setCurrentView('rooms')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition relative min-w-[54px] min-h-[44px] ${
          currentView === 'rooms' || currentView === 'room_active' ? 'text-[#A78BFA]' : 'text-[#8E8AAB]'
        }`}
      >
        <div className={`p-1 rounded-lg relative ${currentView === 'rooms' || currentView === 'room_active' ? 'bg-[#6D28D9]/30 text-white' : ''}`}>
          <Globe className="w-5 h-5" />
          {activeRoom && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-bold">Rooms</span>
      </button>

      {/* Messages */}
      <button
        onClick={() => setCurrentView('messages')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition relative min-w-[54px] min-h-[44px] ${
          currentView === 'messages' ? 'text-[#A78BFA]' : 'text-[#8E8AAB]'
        }`}
      >
        <div className={`p-1 rounded-lg relative ${currentView === 'messages' ? 'bg-[#6D28D9]/30 text-white' : ''}`}>
          <MessageSquare className="w-5 h-5" />
          {unreadDMs > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
              {unreadDMs}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">Chats</span>
      </button>

      {/* Friends */}
      <button
        onClick={() => setCurrentView('friends')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition min-w-[54px] min-h-[44px] ${
          currentView === 'friends' ? 'text-[#A78BFA]' : 'text-[#8E8AAB]'
        }`}
      >
        <div className={`p-1 rounded-lg ${currentView === 'friends' ? 'bg-[#6D28D9]/30 text-white' : ''}`}>
          <Users className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold">Friends</span>
      </button>

      {/* Stats */}
      <button
        onClick={() => setCurrentView('stats')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition min-w-[54px] min-h-[44px] ${
          currentView === 'stats' ? 'text-[#A78BFA]' : 'text-[#8E8AAB]'
        }`}
      >
        <div className={`p-1 rounded-lg ${currentView === 'stats' ? 'bg-[#6D28D9]/30 text-white' : ''}`}>
          <BarChart2 className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold">Stats</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => onOpenProfile(currentUser?.username || 'alex')}
        className={`flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition min-w-[54px] min-h-[44px] ${
          currentView === 'profile' ? 'text-[#A78BFA]' : 'text-[#8E8AAB]'
        }`}
      >
        <div className="relative">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className={`w-6 h-6 rounded-full object-cover ring-2 ${
              currentView === 'profile' ? 'ring-[#8B5CF6]' : 'ring-transparent'
            }`}
          />
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#0D0B1D] ${
              currentUser?.status === 'studying'
                ? 'bg-[#8B5CF6]'
                : currentUser?.status === 'away'
                ? 'bg-amber-500'
                : currentUser?.status === 'offline'
                ? 'bg-slate-500'
                : 'bg-emerald-400'
            }`}
          />
        </div>
        <span className="text-[10px] font-bold">Me</span>
      </button>
    </nav>
  );
};
