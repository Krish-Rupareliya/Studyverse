import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { EditProfileModal } from '../profile/EditProfileModal';
import {
  BookOpen,
  Users,
  MessageSquare,
  LayoutGrid,
  Sparkles,
  Search,
  Bell,
  Check,
  X,
  Radio,
  ChevronRight,
  UserCheck,
  UserPlus,
  Flame,
  Award,
  Edit3,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'rooms' | 'room_active' | 'friends' | 'messages' | 'workspace' | 'feed' | 'profile';
  setCurrentView: (view: 'rooms' | 'room_active' | 'friends' | 'messages' | 'workspace' | 'feed' | 'profile') => void;
  onOpenSearch: () => void;
  onOpenProfile: (username: string) => void;
  onOpenDirectMessage: (userId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenSearch,
  onOpenProfile,
  onOpenDirectMessage,
}) => {
  const { currentUser, users, switchUser } = useAuth();
  const {
    activeRoom,
    notifications,
    unreadNotifCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    acceptFriendRequest,
    declineFriendRequest,
    joinRoom,
    getPendingReceived,
    getUnreadMessagesCount,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const pendingRequests = getPendingReceived(currentUser.id);
  const unreadDMs = getUnreadMessagesCount(currentUser.id);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNotifications = notifications.filter((n) => n.recipientId === currentUser.id);

  return (
    <header id="main-app-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => setCurrentView('rooms')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition">
              S
            </div>
            <div className="text-left">
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                StudySpace
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">
                  Live
                </span>
              </span>
              <span className="text-[10px] text-slate-500 block font-medium mt-0.5">Social Co-Studying</span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-rooms-btn"
              onClick={() => setCurrentView(activeRoom ? 'room_active' : 'rooms')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                currentView === 'rooms' || currentView === 'room_active'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Radio className="w-4 h-4 text-indigo-600" />
              <span>Study Rooms</span>
              {activeRoom && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              )}
            </button>

            <button
              id="nav-friends-btn"
              onClick={() => setCurrentView('friends')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 relative ${
                currentView === 'friends'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Friends</span>
              {pendingRequests.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              id="nav-messages-btn"
              onClick={() => setCurrentView('messages')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 relative ${
                currentView === 'messages'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct Messages</span>
              {unreadDMs > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadDMs}
                </span>
              )}
            </button>

            <button
              id="nav-workspace-btn"
              onClick={() => setCurrentView('workspace')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                currentView === 'workspace'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Workspace</span>
            </button>

            <button
              id="nav-feed-btn"
              onClick={() => setCurrentView('feed')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                currentView === 'feed'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Feed</span>
            </button>
          </nav>
        </div>

        {/* Center/Right: Active Room Banner, Search, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Active Room Pill */}
          {activeRoom && currentView !== 'room_active' && (
            <button
              id="return-to-active-room-btn"
              onClick={() => setCurrentView('room_active')}
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold hover:bg-indigo-100 transition"
            >
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              <span>LIVE: {activeRoom.title.slice(0, 16)}...</span>
              <span className="font-bold text-indigo-800">&rarr;</span>
            </button>
          )}

          {/* Global Search Bar Trigger */}
          <button
            id="global-search-trigger-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-slate-50 hover:bg-white border border-slate-200 text-slate-500 hover:text-slate-800 text-xs transition shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search users, rooms, notes...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500 font-mono shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="notifications-bell-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    {unreadNotifCount > 0 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                        {unreadNotifCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      id="mark-all-read-btn"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {userNotifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No notifications yet. You're all caught up!
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs transition flex gap-3 ${
                          !notif.isRead ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'friend_request' && (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                              <UserPlus className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {notif.type === 'friend_accepted' && (
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {notif.type === 'room_invite' && (
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                              <Radio className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {notif.type === 'direct_message' && (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {(notif.type === 'streak_reminder' || notif.type === 'achievement') && (
                            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                              <Flame className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{notif.message}</p>

                          {/* Quick Action buttons right in notification */}
                          {notif.type === 'friend_request' && (
                            <div className="pt-1.5 flex items-center gap-2">
                              <button
                                id={`accept-notif-btn-${notif.senderId}`}
                                onClick={() => {
                                  acceptFriendRequest(notif.senderId);
                                  markNotificationAsRead(notif.id);
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                              >
                                <Check className="w-3 h-3" />
                                Accept
                              </button>
                              <button
                                id={`decline-notif-btn-${notif.senderId}`}
                                onClick={() => {
                                  declineFriendRequest(notif.senderId);
                                  deleteNotification(notif.id);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-[11px] flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Decline
                              </button>
                            </div>
                          )}

                          {notif.type === 'room_invite' && notif.actionData?.roomId && (
                            <div className="pt-1.5 flex items-center gap-2">
                              <button
                                id={`join-invited-room-btn-${notif.actionData.roomId}`}
                                onClick={() => {
                                  joinRoom(notif.actionData!.roomId!);
                                  markNotificationAsRead(notif.id);
                                  setIsNotifOpen(false);
                                  setCurrentView('room_active');
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                              >
                                <Radio className="w-3 h-3" />
                                Join Study Room
                              </button>
                            </div>
                          )}

                          {notif.type === 'friend_accepted' && notif.actionData?.username && (
                            <div className="pt-1">
                              <button
                                onClick={() => {
                                  onOpenProfile(notif.actionData!.username!);
                                  setIsNotifOpen(false);
                                }}
                                className="text-indigo-600 hover:underline text-[11px] font-semibold"
                              >
                                View Profile &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Account Switcher Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              id="user-profile-menu-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-600"
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-semibold text-slate-800 block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 block -mt-0.5">
                  @{currentUser.username}
                </span>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1.5"
              >
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <img src={currentUser.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-600" />
                    <div>
                      <span className="font-semibold text-sm text-slate-900 block">{currentUser.name}</span>
                      <span className="text-xs text-indigo-600 block font-medium">@{currentUser.username}</span>
                      <span className="text-[11px] text-slate-500 block">{currentUser.university}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <strong>{currentUser.studyStats.streakDays}d</strong> streak
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      Lvl {currentUser.studyStats.level}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    id="menu-edit-profile-btn"
                    onClick={() => {
                      setIsEditProfileOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit My Profile & Handle</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>

                  <button
                    id="menu-view-my-profile-btn"
                    onClick={() => {
                      onOpenProfile(currentUser.username);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>View My Public Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    id="menu-friends-btn"
                    onClick={() => {
                      setCurrentView('friends');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Manage Friends</span>
                    <span className="text-[10px] text-indigo-600 font-semibold">{users.length} peers</span>
                  </button>

                  <button
                    id="menu-workspace-btn"
                    onClick={() => {
                      setCurrentView('workspace');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Productivity & Habits</span>
                  </button>
                </div>

                <div className="pt-1.5 border-t border-slate-100">
                  <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Test Account
                  </div>
                  {(users || []).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full px-4 py-1.5 text-left text-xs flex items-center justify-between transition ${
                        u.id === currentUser.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <span>{u.name}</span>
                        <span className="text-[10px] text-slate-400">(@{u.username})</span>
                      </div>
                      {u.id === currentUser.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Fixed at Viewport Bottom */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 py-2 px-1 text-[11px] shadow-lg">
        <button
          onClick={() => setCurrentView(activeRoom ? 'room_active' : 'rooms')}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'rooms' || currentView === 'room_active' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Rooms</span>
          {activeRoom && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse -mt-0.5" />}
        </button>
        <button
          onClick={() => setCurrentView('friends')}
          className={`flex flex-col items-center gap-1 relative transition ${
            currentView === 'friends' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Friends</span>
          {pendingRequests.length > 0 && (
            <span className="absolute top-0 right-3 bg-rose-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentView('messages')}
          className={`flex flex-col items-center gap-1 relative transition ${
            currentView === 'messages' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>DMs</span>
          {unreadDMs > 0 && (
            <span className="absolute top-0 right-3 bg-indigo-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {unreadDMs}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentView('workspace')}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'workspace' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => setCurrentView('feed')}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'feed' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Feed</span>
        </button>
      </nav>

      {/* Edit Profile Modal Triggered from Header */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={(newU) => onOpenProfile(newU)}
      />
    </header>
  );
};
