import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Users,
  Radio,
  BookOpen,
  UserPlus,
  Check,
  Clock,
  MessageSquare,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateProfile: (username: string) => void;
  onNavigateRoom: (roomId: string) => void;
  onNavigateDirectMessage: (userId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateProfile,
  onNavigateRoom,
  onNavigateDirectMessage,
}) => {
  const { currentUser, users } = useAuth();
  const {
    rooms,
    getRelationship,
    sendFriendRequest,
    acceptFriendRequest,
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'students' | 'rooms'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Search Results
  const matchedUsers = users.filter((u) => {
    if (!cleanQuery) return true;
    return (
      u.name.toLowerCase().includes(cleanQuery) ||
      u.username.toLowerCase().includes(cleanQuery) ||
      u.major.toLowerCase().includes(cleanQuery) ||
      u.university.toLowerCase().includes(cleanQuery) ||
      u.subjects.some((s) => s.toLowerCase().includes(cleanQuery))
    );
  });

  const matchedRooms = rooms.filter((r) => {
    if (!cleanQuery) return true;
    return (
      r.title.toLowerCase().includes(cleanQuery) ||
      r.subject.toLowerCase().includes(cleanQuery) ||
      r.code.toLowerCase() === cleanQuery ||
      r.tags.some((t) => t.toLowerCase().includes(cleanQuery))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-slate-800">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-command-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, subjects, study rooms, or room codes..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md font-mono"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills & User Statistics */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'all' ? 'bg-indigo-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setFilterType('students')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'students' ? 'bg-indigo-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Students ({matchedUsers.length})
            </button>
            <button
              onClick={() => setFilterType('rooms')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'rooms' ? 'bg-indigo-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Study Rooms ({matchedRooms.length})
            </button>
          </div>

          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
            {users.length} Total Users on Platform
          </span>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Section: Students */}
          {(filterType === 'all' || filterType === 'students') && matchedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Students & Peers</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  Showing {matchedUsers.length} of {users.length} students
                </span>
              </div>

              <div className="space-y-1.5">
                {matchedUsers.map((user) => {
                  const isMe = user.id === currentUser.id;
                  const rel = isMe ? 'me' : getRelationship(currentUser.id, user.id);

                  return (
                    <div
                      key={user.id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 transition flex items-center justify-between gap-3 group"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                        onClick={() => {
                          onNavigateProfile(user.username);
                          onClose();
                        }}
                      >
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                              user.isOnline ? 'bg-green-500' : 'bg-slate-300'
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition truncate">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-indigo-600 font-medium">@{user.username}</span>
                            {isMe && (
                              <span className="text-[9px] px-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {user.major} • {user.university}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isMe && rel === 'none' && (
                          <button
                            id={`search-add-user-${user.id}`}
                            onClick={() => sendFriendRequest(user.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Send Request</span>
                          </button>
                        )}

                        {!isMe && rel === 'pending_sent' && (
                          <span className="text-[11px] text-indigo-600 font-medium px-2 py-1 rounded bg-indigo-50 border border-indigo-100 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}

                        {!isMe && rel === 'pending_received' && (
                          <button
                            onClick={() => acceptFriendRequest(user.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 transition shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            Accept
                          </button>
                        )}

                        {!isMe && rel === 'accepted' && (
                          <button
                            onClick={() => {
                              onNavigateDirectMessage(user.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Message
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onNavigateProfile(user.username);
                            onClose();
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Study Rooms */}
          {(filterType === 'all' || filterType === 'rooms') && matchedRooms.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                <Radio className="w-3.5 h-3.5 text-indigo-600" />
                <span>Live Study Rooms</span>
              </div>

              <div className="space-y-1.5">
                {matchedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-200 transition flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="cursor-pointer min-w-0"
                      onClick={() => {
                        onNavigateRoom(room.id);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition truncate">
                          {room.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {room.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {room.subject} • {room.participants.length}/{room.maxParticipants} peers active
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigateRoom(room.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-2xs"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Join</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {matchedUsers.length === 0 && matchedRooms.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No results found</p>
              <p className="text-xs text-slate-500">
                No matching students or rooms for "{query}". Try another search keyword!
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search tip: Type a username, course topic, or 6-digit room code</span>
          <span className="font-mono">Press ↵ to open</span>
        </div>
      </div>
    </div>
  );
};
