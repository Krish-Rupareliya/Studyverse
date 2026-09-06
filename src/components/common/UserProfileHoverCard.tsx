import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserProfile, RoomParticipantRole } from '../../types';
import {
  Flame,
  Clock,
  UserPlus,
  UserCheck,
  MessageSquare,
  ExternalLink,
  Shield,
  AtSign,
  Crown,
  Key,
  Sparkles,
  Check,
  Video,
} from 'lucide-react';

interface UserProfileHoverCardProps {
  userId?: string;
  username?: string;
  children: React.ReactNode;
  onNavigateProfile?: (username: string) => void;
  onNavigateDirectMessage?: (userId: string, startVideoCall?: boolean) => void;
  onMentionInChat?: (username: string) => void;
  isHost?: boolean;
  isCoHost?: boolean;
  role?: RoomParticipantRole;
  align?: 'left' | 'right' | 'center' | 'auto';
  className?: string;
}

export const UserProfileHoverCard: React.FC<UserProfileHoverCardProps> = ({
  userId,
  username,
  children,
  onNavigateProfile,
  onNavigateDirectMessage,
  onMentionInChat,
  isHost,
  isCoHost,
  role,
  align = 'auto',
  className = '',
}) => {
  const { currentUser, users, getUserById, getUserByUsername } = useAuth();
  const {
    getRelationship,
    sendFriendRequest,
    acceptFriendRequest,
    activeRoom,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: false,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<any>(null);
  const closeTimeoutRef = useRef<any>(null);

  // Locate target user
  const targetUser: UserProfile | undefined = React.useMemo(() => {
    if (userId) {
      const found = getUserById?.(userId) || users.find((u) => u.id === userId);
      if (found) return found;
    }
    if (username) {
      const found = getUserByUsername?.(username) || users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (found) return found;
    }
    return undefined;
  }, [userId, username, users, getUserById, getUserByUsername]);

  const isMe = targetUser && currentUser ? targetUser.id === currentUser.id : false;
  const relationship = targetUser && currentUser && !isMe
    ? getRelationship?.(currentUser.id, targetUser.id) || 'none'
    : 'me';

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 280;
    const cardHeight = 240;

    let left = rect.left + rect.width / 2 - cardWidth / 2;
    if (align === 'left') left = rect.left;
    if (align === 'right') left = rect.right - cardWidth;

    // Bounds safety
    if (left < 12) left = 12;
    if (left + cardWidth > window.innerWidth - 12) {
      left = window.innerWidth - cardWidth - 12;
    }

    const placeAbove = rect.bottom + cardHeight > window.innerHeight && rect.top > cardHeight;
    const top = placeAbove ? rect.top - cardHeight - 8 : rect.bottom + 8;

    setCoords({ top, left, placeAbove });
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, 220);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    }
  };

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
      clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (!targetUser) {
    return <span className={className}>{children}</span>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouch}
        className={`inline-flex items-center cursor-pointer ${className}`}
      >
        {children}
      </div>

      {isOpen && (
        <div
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={() => clearTimeout(closeTimeoutRef.current)}
          onMouseLeave={handleMouseLeave}
          className="fixed z-50 w-72 bg-[#131129]/95 backdrop-blur-xl border border-[#2E2856] rounded-2xl shadow-2xl p-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150 select-none pointer-events-auto"
        >
          {/* Header Banner / Avatar */}
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <img
                src={targetUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={targetUser.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6D28D9] shadow-md"
              />
              {/* Online Indicator */}
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#131129] ${
                  targetUser.status === 'online' ? 'bg-emerald-400' : 'bg-slate-400'
                }`}
              />
              {(role === 'host' || (isHost && role !== 'co-host')) && (
                <span
                  title="Room Lead Host"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md ring-1 ring-amber-300"
                >
                  <Crown className="w-3 h-3 fill-slate-950" />
                </span>
              )}
              {(role === 'co-host' || isCoHost) && (
                <span
                  title="Room Co-Host"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#6D28D9] text-amber-300 flex items-center justify-center shadow-md border border-purple-400"
                >
                  <Key className="w-3 h-3 text-amber-300" />
                </span>
              )}
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-1.5">
              {onMentionInChat && !isMe && (
                <button
                  type="button"
                  onClick={() => {
                    onMentionInChat(targetUser.username);
                    setIsOpen(false);
                  }}
                  className="px-2 py-1 bg-[#231F45] hover:bg-[#352F64] text-[#A78BFA] text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                  title="Mention in chat"
                >
                  <AtSign className="w-3 h-3" />
                  <span>Mention</span>
                </button>
              )}

              {onNavigateProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateProfile(targetUser.username);
                    setIsOpen(false);
                  }}
                  className="p-1.5 bg-[#231F45] hover:bg-[#352F64] text-[#8E8AAB] hover:text-white rounded-lg transition"
                  title="Open Full Profile"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Name & Handle */}
          <div className="mt-2.5">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-white truncate">{targetUser.name}</h4>
              {isMe && (
                <span className="text-[10px] bg-[#6D28D9]/40 text-[#C4B5FD] font-semibold px-1.5 py-0.2 rounded-md">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-[#A78BFA] font-medium">@{targetUser.username}</p>
          </div>

          {/* Bio / Major */}
          <p className="mt-2 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
            {targetUser.bio || `${targetUser.major || 'Student'} @ ${targetUser.university || 'StudySpace'}`}
          </p>

          {/* Mini Stats Row */}
          <div className="mt-3 pt-2.5 border-t border-[#231F45] grid grid-cols-2 gap-2 text-center">
            <div className="bg-[#1C1938]/60 p-1.5 rounded-xl border border-[#2E2856]/50 flex items-center justify-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">
                  {targetUser.studyStats?.streakDays || 1}d
                </span>
                <span className="text-[9px] text-[#8E8AAB] uppercase font-bold tracking-wider">Streak</span>
              </div>
            </div>

            <div className="bg-[#1C1938]/60 p-1.5 rounded-xl border border-[#2E2856]/50 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">
                  {targetUser.studyStats?.totalHours || 0}h
                </span>
                <span className="text-[9px] text-[#8E8AAB] uppercase font-bold tracking-wider">Focus</span>
              </div>
            </div>
          </div>

          {/* Social Friendship Buttons (if not me) */}
          {!isMe && (
            <div className="mt-3 pt-2 border-t border-[#231F45] flex items-center gap-2">
              {relationship === 'friends' ? (
                <div className="flex-1 py-1.5 px-2 bg-emerald-950/40 border border-emerald-700/50 text-emerald-300 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Friends</span>
                </div>
              ) : relationship === 'pending_received' ? (
                <button
                  type="button"
                  onClick={() => acceptFriendRequest?.(targetUser.id)}
                  className="flex-1 py-1.5 px-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-md"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Accept Friend</span>
                </button>
              ) : relationship === 'pending_sent' ? (
                <div className="flex-1 py-1.5 px-2 bg-[#231F45] text-[#8E8AAB] text-[11px] font-medium rounded-xl flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Request Sent</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => sendFriendRequest?.(targetUser.id)}
                  className="flex-1 py-1.5 px-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-purple-900/30"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Add Friend</span>
                </button>
              )}

              {onNavigateDirectMessage && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateDirectMessage(targetUser.id, true);
                      setIsOpen(false);
                    }}
                    className="p-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 hover:text-white rounded-xl border border-emerald-700/50 transition"
                    title="Start 1-on-1 Video Call with Camera"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigateDirectMessage(targetUser.id);
                      setIsOpen(false);
                    }}
                    className="p-2 bg-[#231F45] hover:bg-[#352F64] text-[#A78BFA] hover:text-white rounded-xl transition"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
