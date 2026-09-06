import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Ban,
  Search,
  MessageSquare,
  Radio,
  Check,
  X,
  Flame,
  BookOpen,
  Video,
  MoreVertical,
  UserX,
  ShieldAlert,
  Share2,
  ArrowUpDown,
  GraduationCap,
  Award,
  Sparkles,
} from 'lucide-react';

interface FriendsViewProps {
  onNavigateProfile: (username: string) => void;
  onNavigateDirectMessage: (userId: string, startVideoCall?: boolean) => void;
  onNavigateRoom: (roomId: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  onNavigateProfile,
  onNavigateDirectMessage,
  onNavigateRoom,
}) => {
  const { currentUser, users } = useAuth();
  const {
    getFriends,
    getPendingReceived,
    getPendingSent,
    getBlockedUsers,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    unblockUser,
    sendFriendRequest,
    removeFriend,
    blockUser,
    inviteFriendToRoom,
    activeRoomId,
    rooms,
    getFriendshipStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'pending_received' | 'pending_sent' | 'blocked' | 'discover'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddUsername, setQuickAddUsername] = useState('');
  const [quickAddStatus, setQuickAddStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'streak' | 'name' | 'activity' | 'hours'>('activity');
  const [openMenuFriendId, setOpenMenuFriendId] = useState<string | null>(null);
  const [invitedUserIds, setInvitedUserIds] = useState<Record<string, boolean>>({});

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  const allFriends = typeof getFriends === 'function' ? getFriends(currentUser?.id || '') || [] : [];
  const onlineFriends = allFriends.filter((f) => f.isOnline);
  const pendingReceived = typeof getPendingReceived === 'function' ? getPendingReceived(currentUser?.id || '') || [] : [];
  const pendingSent = typeof getPendingSent === 'function' ? getPendingSent(currentUser?.id || '') || [] : [];
  const blockedUsers = typeof getBlockedUsers === 'function' ? getBlockedUsers(currentUser?.id || '') || [] : [];

  // All other platform users for Discover mode
  const discoverUsers = (users || []).filter((u) => u.id !== currentUser?.id);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickAddUsername.trim().replace('@', '');
    if (!clean) return;

    const targetUser = users.find((u) => u.username.toLowerCase() === clean.toLowerCase());
    if (!targetUser) {
      setQuickAddStatus(`User "@${clean}" does not exist.`);
      return;
    }
    if (targetUser.id === currentUser?.id) {
      setQuickAddStatus("You cannot add yourself as a friend.");
      return;
    }

    sendFriendRequest(targetUser.id);
    setQuickAddStatus(`Friend request sent to @${targetUser.username}!`);
    setQuickAddUsername('');
    setTimeout(() => setQuickAddStatus(null), 3500);
  };

  const handleInviteToRoom = (targetUserId: string) => {
    if (!activeRoomId) return;
    if (typeof inviteFriendToRoom === 'function') {
      inviteFriendToRoom(activeRoomId, targetUserId);
    }
    setInvitedUserIds((prev) => ({ ...prev, [targetUserId]: true }));
    setQuickAddStatus(`Invited friend to study room "${activeRoom?.title || 'Study Room'}"!`);
    setTimeout(() => setQuickAddStatus(null), 3500);
  };

  const handleRemoveFriend = (targetUserId: string, targetName: string) => {
    if (window.confirm(`Are you sure you want to remove ${targetName} from your friends list?`)) {
      if (typeof removeFriend === 'function') {
        removeFriend(targetUserId);
      }
      setOpenMenuFriendId(null);
      setQuickAddStatus(`Removed ${targetName} from friends.`);
      setTimeout(() => setQuickAddStatus(null), 3000);
    }
  };

  const handleBlockUser = (targetUserId: string, targetName: string) => {
    if (window.confirm(`Are you sure you want to block ${targetName}?`)) {
      if (typeof blockUser === 'function') {
        blockUser(targetUserId);
      }
      setOpenMenuFriendId(null);
      setQuickAddStatus(`Blocked ${targetName}.`);
      setTimeout(() => setQuickAddStatus(null), 3000);
    }
  };

  const getFilteredList = () => {
    let list: any[] = [];
    if (activeTab === 'all') list = [...allFriends];
    else if (activeTab === 'online') list = [...onlineFriends];
    else if (activeTab === 'pending_received') list = [...pendingReceived];
    else if (activeTab === 'pending_sent') list = [...pendingSent];
    else if (activeTab === 'blocked') list = [...blockedUsers];
    else if (activeTab === 'discover') list = [...discoverUsers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => {
        const u = item.user || item;
        return (
          u?.name?.toLowerCase().includes(q) ||
          u?.username?.toLowerCase().includes(q) ||
          u?.major?.toLowerCase().includes(q) ||
          u?.university?.toLowerCase().includes(q)
        );
      });
    }

    // Apply Sorting logic
    list.sort((a, b) => {
      const uA = a.user || a;
      const uB = b.user || b;

      if (sortBy === 'streak') {
        return (uB.studyStats?.streakDays || 0) - (uA.studyStats?.streakDays || 0);
      } else if (sortBy === 'name') {
        return (uA.name || '').localeCompare(uB.name || '');
      } else if (sortBy === 'hours') {
        return (uB.studyStats?.totalHours || 0) - (uA.studyStats?.totalHours || 0);
      } else {
        // 'activity' - studying first, then online, then offline
        const getScore = (u: any) => (u.status === 'studying' ? 3 : u.isOnline || u.status === 'online' ? 2 : 1);
        return getScore(uB) - getScore(uA);
      }
    });

    return list;
  };

  const displayedList = getFilteredList();

  return (
    <div id="friends-view-container" className="max-w-7xl mx-auto space-y-6 text-slate-200">
      {/* Top Banner / Add Friend Quick Form */}
      <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#A78BFA]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Study Friends & Network</h1>
          </div>
          <p className="text-xs text-[#8E8AAB]">
            Connect with peers, invite them into live study rooms, and co-study across universities.
          </p>
        </div>

        {/* Quick Add Form with Autocomplete Suggestions */}
        <div className="relative">
          <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <UserPlus className="w-3.5 h-3.5 text-[#8E8AAB] absolute left-3 top-3" />
              <input
                type="text"
                id="quick-add-username-input"
                value={quickAddUsername}
                onChange={(e) => setQuickAddUsername(e.target.value)}
                placeholder="Search/Add by @username..."
                className="pl-8 pr-3 py-2 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-xs text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] w-full sm:w-64"
              />
            </div>
            <button
              type="submit"
              id="quick-add-submit-btn"
              className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-purple-900/40 shrink-0"
            >
              Send Request
            </button>
          </form>

          {/* Quick Add Live Suggestions Dropdown */}
          {quickAddUsername.trim().length > 0 && (
            <div className="absolute right-0 top-12 z-30 w-80 bg-[#171431] border border-[#2E2856] rounded-2xl shadow-2xl p-3 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#8E8AAB] px-1 pb-1 border-b border-[#26214A]">
                <span>Matching Students</span>
                <span className="text-[#A78BFA] font-mono">{users.length} Total Users</span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {users
                  .filter(
                    (u) =>
                      u.id !== currentUser?.id &&
                      (u.username.toLowerCase().includes(quickAddUsername.trim().toLowerCase().replace('@', '')) ||
                        u.name.toLowerCase().includes(quickAddUsername.trim().toLowerCase()))
                  )
                  .map((usr) => {
                    const status = typeof getFriendshipStatus === 'function' ? getFriendshipStatus(usr.id) : 'none';

                    return (
                      <div
                        key={usr.id}
                        className="p-2 rounded-xl bg-[#0D0B1D] border border-[#26214A] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={usr.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{usr.name}</span>
                            <span className="text-[10px] text-[#A78BFA] block truncate">@{usr.username}</span>
                          </div>
                        </div>

                        {status === 'none' ? (
                          <button
                            type="button"
                            onClick={() => {
                              sendFriendRequest(usr.id);
                              setQuickAddStatus(`Friend request sent to @${usr.username}!`);
                              setQuickAddUsername('');
                              setTimeout(() => setQuickAddStatus(null), 3500);
                            }}
                            className="px-2.5 py-1 bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-[11px] font-bold rounded-lg transition shrink-0"
                          >
                            + Send Request
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#8E8AAB] bg-[#1E1938] px-2 py-0.5 rounded-md shrink-0 capitalize">
                            {status === 'accepted' ? 'Friends' : status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    );
                  })}

                {users.filter(
                  (u) =>
                    u.id !== currentUser?.id &&
                    (u.username.toLowerCase().includes(quickAddUsername.trim().toLowerCase().replace('@', '')) ||
                      u.name.toLowerCase().includes(quickAddUsername.trim().toLowerCase()))
                ).length === 0 && (
                  <p className="text-xs text-[#8E8AAB] py-3 text-center">
                    No users matching &ldquo;{quickAddUsername}&rdquo;
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {quickAddStatus && (
        <div className="p-3 bg-[#6D28D9]/20 border border-[#8B5CF6]/50 text-white text-xs rounded-xl flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
            <span>{quickAddStatus}</span>
          </div>
          <button onClick={() => setQuickAddStatus(null)} className="text-[#A78BFA] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs, Sorting & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E1938] pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 text-xs">
            <button
              id="tab-all-friends"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-[#6D28D9] text-white font-semibold shadow-xs'
                  : 'bg-[#171431] hover:bg-[#231F45] text-[#8E8AAB] border border-[#26214A]'
              }`}
            >
              <span>All Friends</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0D0B1D] text-[#A78BFA] font-bold">
                {allFriends.length}
              </span>
            </button>

            <button
              id="tab-online-friends"
              onClick={() => setActiveTab('online')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'online'
                  ? 'bg-[#6D28D9] text-white font-semibold shadow-xs'
                  : 'bg-[#171431] hover:bg-[#231F45] text-[#8E8AAB] border border-[#26214A]'
              }`}
            >
              <span>Online</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {onlineFriends.length}
              </span>
            </button>

            <button
              id="tab-pending-received"
              onClick={() => setActiveTab('pending_received')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'pending_received'
                  ? 'bg-[#6D28D9] text-white font-semibold shadow-xs'
                  : 'bg-[#171431] hover:bg-[#231F45] text-[#8E8AAB] border border-[#26214A]'
              }`}
            >
              <span>Incoming Requests</span>
              {pendingReceived.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  {pendingReceived.length}
                </span>
              )}
            </button>

            <button
              id="tab-pending-sent"
              onClick={() => setActiveTab('pending_sent')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'pending_sent'
                  ? 'bg-[#6D28D9] text-white font-semibold shadow-xs'
                  : 'bg-[#171431] hover:bg-[#231F45] text-[#8E8AAB] border border-[#26214A]'
              }`}
            >
              <span>Outgoing Sent</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0D0B1D] text-[#8E8AAB] font-bold">
                {pendingSent.length}
              </span>
            </button>

            <button
              id="tab-blocked"
              onClick={() => setActiveTab('blocked')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'blocked'
                  ? 'bg-[#6D28D9] text-white font-semibold shadow-xs'
                  : 'bg-[#171431] hover:bg-[#231F45] text-[#8E8AAB] border border-[#26214A]'
              }`}
            >
              <span>Blocked</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0D0B1D] text-[#8E8AAB] font-bold">
                {blockedUsers.length}
              </span>
            </button>

            <button
              id="tab-discover-students"
              onClick={() => setActiveTab('discover')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                activeTab === 'discover'
                  ? 'bg-[#6D28D9] text-white font-semibold shadow-xs'
                  : 'bg-[#171431] hover:bg-[#231F45] text-[#8E8AAB] border border-[#26214A]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Discover All Students</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#0D0B1D] text-[#A78BFA] font-bold">
                {discoverUsers.length}
              </span>
            </button>
          </div>

          {/* Search Filter & Sorting Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#8E8AAB] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'discover' ? 'Search students by name, major...' : 'Search friends, major, handle...'}
                className="w-full pl-8 pr-8 py-1.5 bg-[#171431] border border-[#26214A] rounded-xl text-xs text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#8E8AAB] hover:text-white transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting Selector */}
            <div className="flex items-center gap-1.5 bg-[#171431] border border-[#26214A] rounded-xl px-2.5 py-1 text-xs shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8AAB]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-[#A78BFA] focus:outline-none cursor-pointer font-medium"
              >
                <option value="activity" className="bg-[#171431] text-white">Sort: Active Status</option>
                <option value="streak" className="bg-[#171431] text-white">Sort: Highest Streak</option>
                <option value="hours" className="bg-[#171431] text-white">Sort: Total Hours</option>
                <option value="name" className="bg-[#171431] text-white">Sort: Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search status bar if filter is active */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#171431]/80 border border-[#26214A] rounded-xl text-xs text-[#8E8AAB]">
            <span>
              Showing <strong className="text-white">{displayedList.length}</strong> matching results for &ldquo;{searchQuery}&rdquo;
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#A78BFA] hover:text-white font-semibold text-[11px]"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Content Stream */}
        {displayedList.length === 0 ? (
          <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-10 text-center space-y-4 shadow-xl">
            <Users className="w-8 h-8 text-[#8E8AAB] mx-auto opacity-50" />
            <p className="text-sm font-semibold text-white">
              {searchQuery ? `No results found for "${searchQuery}" in this category.` : 'No peers found in this category.'}
            </p>
            {activeTab !== 'discover' && (
              <button
                onClick={() => setActiveTab('discover')}
                className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-900/40 inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Search all Studyverse students for &ldquo;{searchQuery || 'friends'}&rdquo;</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Accepted & Online Friends */}
            {(activeTab === 'all' || activeTab === 'online') &&
              displayedList.map((friend) => {
                const isMenuOpen = openMenuFriendId === friend.id;
                const isInvited = invitedUserIds[friend.id];

                return (
                  <div
                    key={friend.id}
                    className="bg-[#171431] border border-[#26214A] hover:border-[#8B5CF6] rounded-2xl p-4 flex flex-col justify-between space-y-3 transition shadow-lg relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6D28D9] cursor-pointer"
                            onClick={() => onNavigateProfile(friend.username)}
                          />
                          <div
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#171431] ${
                              friend.status === 'studying'
                                ? 'bg-purple-500 animate-pulse'
                                : friend.status === 'online' || friend.isOnline
                                ? 'bg-emerald-500'
                                : 'bg-slate-500'
                            }`}
                          />
                        </div>

                        <div>
                          <button
                            onClick={() => onNavigateProfile(friend.username)}
                            className="font-bold text-sm text-white hover:text-[#A78BFA] transition block text-left"
                          >
                            {friend.name}
                          </button>
                          <span className="text-xs text-[#A78BFA] block">@{friend.username}</span>
                          <span className="text-[11px] text-[#8E8AAB] block truncate max-w-[140px]">
                            {friend.major || 'Student'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Flame className="w-3 h-3" />
                          {friend.studyStats?.streakDays || 1}d
                        </span>

                        {/* More Options Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuFriendId(isMenuOpen ? null : friend.id)}
                            className="p-1 rounded-lg hover:bg-[#231F45] text-[#8E8AAB] hover:text-white transition"
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-7 z-20 w-44 bg-[#0D0B1D] border border-[#2E2856] rounded-xl shadow-2xl p-1.5 space-y-1 animate-fade-in text-xs">
                              <button
                                onClick={() => {
                                  setOpenMenuFriendId(null);
                                  onNavigateProfile(friend.username);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#231F45] text-white flex items-center gap-2"
                              >
                                <Users className="w-3.5 h-3.5 text-[#A78BFA]" />
                                <span>View Profile</span>
                              </button>

                              {activeRoomId && (
                                <button
                                  onClick={() => {
                                    setOpenMenuFriendId(null);
                                    handleInviteToRoom(friend.id);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#231F45] text-[#A78BFA] flex items-center gap-2"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Invite to Room</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleRemoveFriend(friend.id, friend.name)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 flex items-center gap-2"
                              >
                                <UserX className="w-3.5 h-3.5 text-rose-400" />
                                <span>Remove Friend</span>
                              </button>

                              <button
                                onClick={() => handleBlockUser(friend.id, friend.name)}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 flex items-center gap-2"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Block User</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Active Study Room Status indicator if studying */}
                    {(friend.status === 'studying' || friend.currentRoomId) && (
                      <div className="p-2.5 rounded-xl bg-[#6D28D9]/20 border border-[#8B5CF6]/40 flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <Radio className="w-3.5 h-3.5 text-[#A78BFA] shrink-0 animate-pulse" />
                          <div className="truncate">
                            <span className="font-bold block truncate text-xs text-white">
                              {friend.currentRoomTitle || 'Studying Live'}
                            </span>
                          </div>
                        </div>
                        {friend.currentRoomId && (
                          <button
                            onClick={() => onNavigateRoom(friend.currentRoomId!)}
                            className="px-2.5 py-1 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-lg text-[11px] font-bold transition shadow-xs shrink-0"
                          >
                            Join Room
                          </button>
                        )}
                      </div>
                    )}

                    {/* Quick Room Invite banner if in a study room */}
                    {activeRoomId && (friend.isOnline || friend.status === 'online' || friend.status === 'studying') && !friend.currentRoomId && (
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#1E1938] border border-[#2E2856] text-[11px]">
                        <span className="text-[#8E8AAB] truncate">Active in {activeRoom?.title || 'Room'}</span>
                        {isInvited ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                            <Check className="w-3 h-3" /> Invited
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInviteToRoom(friend.id)}
                            className="text-[#A78BFA] hover:text-white font-bold transition flex items-center gap-1 hover:underline"
                          >
                            <Share2 className="w-3 h-3" /> Invite
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-[#26214A] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigateProfile(friend.username)}
                        className="px-3 py-1.5 rounded-xl bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white text-xs font-semibold transition"
                      >
                        Profile
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`call-friend-btn-${friend.id}`}
                          onClick={() => onNavigateDirectMessage(friend.id, true)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                          title="Start Video Call with Camera"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>

                        <button
                          id={`dm-friend-btn-${friend.id}`}
                          onClick={() => onNavigateDirectMessage(friend.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/30"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Pending Received Requests */}
            {activeTab === 'pending_received' &&
              displayedList.map((req) => {
                const targetUser = req.user;
                const relationshipId = req.relationship?.id || targetUser.id;
                return (
                  <div
                    key={relationshipId}
                    className="bg-[#171431] border border-[#26214A] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={targetUser.avatar}
                        alt={targetUser.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6D28D9]"
                      />
                      <div>
                        <button
                          onClick={() => onNavigateProfile(targetUser.username)}
                          className="font-bold text-sm text-white hover:text-[#A78BFA] transition block text-left"
                        >
                          {targetUser.name}
                        </button>
                        <span className="text-xs text-[#A78BFA] block">@{targetUser.username}</span>
                        <span className="text-[11px] text-[#8E8AAB] block">{targetUser.university || targetUser.major}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#26214A] flex items-center gap-2">
                      <button
                        id={`accept-request-btn-${targetUser.id}`}
                        onClick={() => acceptFriendRequest(targetUser.id)}
                        className="flex-1 py-1.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-purple-900/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        id={`decline-request-btn-${targetUser.id}`}
                        onClick={() => declineFriendRequest(targetUser.id)}
                        className="flex-1 py-1.5 bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Pending Sent Requests */}
            {activeTab === 'pending_sent' &&
              displayedList.map((req) => {
                const targetUser = req.user;
                const relationshipId = req.relationship?.id || targetUser.id;
                return (
                  <div
                    key={relationshipId}
                    className="bg-[#171431] border border-[#26214A] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={targetUser.avatar}
                        alt={targetUser.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#352F64]"
                      />
                      <div>
                        <button
                          onClick={() => onNavigateProfile(targetUser.username)}
                          className="font-bold text-sm text-white hover:text-[#A78BFA] transition block text-left"
                        >
                          {targetUser.name}
                        </button>
                        <span className="text-xs text-[#A78BFA] block">@{targetUser.username}</span>
                        <span className="text-[11px] text-[#8E8AAB] block">Request sent</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#26214A] flex items-center justify-between">
                      <span className="text-[11px] text-[#8E8AAB] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Response</span>
                      </span>
                      <button
                        id={`cancel-request-btn-${targetUser.id}`}
                        onClick={() => cancelFriendRequest(targetUser.id)}
                        className="px-3 py-1 bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white rounded-xl text-xs font-semibold transition"
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Blocked Users */}
            {activeTab === 'blocked' &&
              displayedList.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#171431] border border-[#26214A] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.avatar}
                      alt={b.name}
                      className="w-10 h-10 rounded-full object-cover opacity-60"
                    />
                    <div>
                      <span className="font-bold text-xs text-white block">{b.name}</span>
                      <span className="text-[10px] text-[#8E8AAB] block">@{b.username}</span>
                    </div>
                  </div>

                  <button
                    id={`unblock-user-btn-${b.id}`}
                    onClick={() => unblockUser(b.id)}
                    className="px-3 py-1.5 bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white text-xs font-semibold rounded-xl transition"
                  >
                    Unblock
                  </button>
                </div>
              ))}

            {/* Discover All Students Stream */}
            {activeTab === 'discover' &&
              displayedList.map((usr) => {
                const status = typeof getFriendshipStatus === 'function' ? getFriendshipStatus(usr.id) : 'none';
                return (
                  <div
                    key={usr.id}
                    className="bg-[#171431] border border-[#26214A] hover:border-[#8B5CF6]/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatar}
                          alt={usr.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6D28D9] cursor-pointer"
                          onClick={() => onNavigateProfile(usr.username)}
                        />
                        <div>
                          <button
                            onClick={() => onNavigateProfile(usr.username)}
                            className="font-bold text-sm text-white hover:text-[#A78BFA] transition block text-left"
                          >
                            {usr.name}
                          </button>
                          <span className="text-xs text-[#A78BFA] block">@{usr.username}</span>
                          <span className="text-[11px] text-[#8E8AAB] block truncate max-w-[150px]">
                            {usr.major || usr.university || 'Student'}
                          </span>
                        </div>
                      </div>

                      {usr.studyStats?.streakDays ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Flame className="w-3 h-3" />
                          {usr.studyStats.streakDays}d
                        </span>
                      ) : null}
                    </div>

                    {usr.bio && (
                      <p className="text-xs text-[#8E8AAB] line-clamp-2 bg-[#0D0B1D]/50 p-2 rounded-xl border border-[#26214A]">
                        {usr.bio}
                      </p>
                    )}

                    <div className="pt-2 border-t border-[#26214A] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onNavigateProfile(usr.username)}
                        className="px-3 py-1.5 rounded-xl bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white text-xs font-semibold transition"
                      >
                        Profile
                      </button>

                      {status === 'accepted' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded-xl flex items-center gap-1">
                            <Check className="w-3 h-3" /> Friends
                          </span>
                          <button
                            onClick={() => onNavigateDirectMessage(usr.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Message</span>
                          </button>
                        </div>
                      ) : status === 'pending_sent' ? (
                        <button
                          onClick={() => cancelFriendRequest(usr.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#231F45] text-[#8E8AAB] hover:text-white text-xs font-semibold transition"
                        >
                          Request Sent
                        </button>
                      ) : status === 'pending_received' ? (
                        <button
                          onClick={() => acceptFriendRequest(usr.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-semibold transition"
                        >
                          Accept Request
                        </button>
                      ) : status === 'blocked' ? (
                        <button
                          onClick={() => unblockUser(usr.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#231F45] text-slate-400 hover:text-white text-xs font-semibold transition"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            sendFriendRequest(usr.id);
                            setQuickAddStatus(`Friend request sent to @${usr.username}!`);
                            setTimeout(() => setQuickAddStatus(null), 3500);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/30"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add Friend</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
