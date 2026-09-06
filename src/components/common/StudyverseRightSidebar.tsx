import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  UserPlus,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Check,
  Flame,
  Trophy,
  Award,
  Users,
} from 'lucide-react';

interface StudyverseRightSidebarProps {
  onNavigateProfile: (username: string) => void;
  onNavigateRoom: (roomId: string) => void;
  onNavigateDirectMessage: (userId: string) => void;
}

export const StudyverseRightSidebar: React.FC<StudyverseRightSidebarProps> = ({
  onNavigateProfile,
  onNavigateRoom,
  onNavigateDirectMessage,
}) => {
  const { currentUser, allUsers, users } = useAuth();
  const { getFriends, sendFriendRequest, showToast } = useApp();

  const userPool = allUsers || users || [];
  const friends = typeof getFriends === 'function' ? getFriends(currentUser?.id || '') || [] : [];
  const [addedSuggestedIds, setAddedSuggestedIds] = useState<string[]>([]);

  // Friend IDs set to filter out current friends
  const friendIds = new Set([currentUser?.id, ...friends.map((f) => f.id)]);

  // Dynamic suggested friends from real users in the platform
  const suggestedFriends = useMemo(() => {
    return userPool
      .filter((u) => u.id !== currentUser?.id && !friendIds.has(u.id))
      .slice(0, 4)
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        reason: u.major ? `${u.major}` : 'Study rooms in common',
      }));
  }, [userPool, currentUser?.id, friendIds]);

  const handleAddSuggested = (id: string, name: string) => {
    sendFriendRequest(id);
    setAddedSuggestedIds((prev) => [...prev, id]);
    if (typeof showToast === 'function') {
      showToast('Friend Request Sent', `Sent a friend request to ${name}`, 'success');
    }
  };

  // Dynamic next achievement calculation
  const nextAchievement = useMemo(() => {
    if (!currentUser) {
      return {
        title: 'Photogenic',
        current: 0,
        target: 1,
        desc: 'Upload a custom profile picture',
        icon: Camera,
        percent: 0,
      };
    }

    const hasAvatar = currentUser.avatar && currentUser.avatar.trim().length > 0;
    if (!hasAvatar) {
      return {
        title: 'Photogenic',
        current: 0,
        target: 1,
        desc: 'Upload a custom profile picture',
        icon: Camera,
        percent: 0,
      };
    }

    const streak = currentUser.studyStats?.streakDays || 0;
    if (streak < 10) {
      return {
        title: '10-Day Streak',
        current: streak,
        target: 10,
        desc: 'Maintain a 10-day unbroken study streak',
        icon: Flame,
        percent: Math.min(100, Math.round((streak / 10) * 100)),
      };
    }

    const hours = Math.round(currentUser.studyStats?.totalHours || 0);
    if (hours < 200) {
      return {
        title: '200 Hours Club',
        current: hours,
        target: 200,
        desc: 'Log 200 total focus hours',
        icon: Trophy,
        percent: Math.min(100, Math.round((hours / 200) * 100)),
      };
    }

    return {
      title: 'Study Master',
      current: currentUser.studyStats?.completedSessions || 50,
      target: 100,
      desc: 'Complete 100 focus sessions',
      icon: Award,
      percent: Math.min(100, Math.round(((currentUser.studyStats?.completedSessions || 50) / 100) * 100)),
    };
  }, [currentUser]);

  const IconComponent = nextAchievement.icon;

  return (
    <aside className="w-72 bg-[#0D0B1D] border-l border-[#1E1938] p-4 flex flex-col justify-between hidden xl:flex shrink-0 select-none text-slate-200">
      <div className="space-y-6">
        {/* Next Achievement Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8E8AAB] tracking-wider uppercase">
            <span>Next Achievement</span>
            <button
              onClick={() => onNavigateProfile(currentUser?.username || 'alex')}
              className="text-[10px] text-[#A78BFA] hover:underline normal-case cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="p-3.5 bg-[#171431] border border-[#26214A] rounded-2xl flex items-center gap-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#231F45] border border-[#352F64] flex items-center justify-center text-[#A78BFA] shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white truncate">{nextAchievement.title}</span>
                <span className="text-[10px] font-mono text-[#8E8AAB]">
                  {nextAchievement.current}/{nextAchievement.target}
                </span>
              </div>
              <p className="text-[11px] text-[#8E8AAB] truncate mt-0.5">{nextAchievement.desc}</p>

              {/* Real Progress Bar */}
              <div className="w-full h-1.5 bg-[#231F45] rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] rounded-full transition-all duration-500"
                  style={{ width: `${nextAchievement.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Friends */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8E8AAB] tracking-wider uppercase">
            <span>Suggested Friends</span>
            <span className="text-[10px] text-[#A78BFA] font-normal">{suggestedFriends.length} available</span>
          </div>

          <div className="space-y-2.5">
            {suggestedFriends.length === 0 ? (
              <div className="p-3 rounded-xl bg-[#171431] border border-[#26214A] text-[11px] text-[#8E8AAB] text-center">
                All available learners added! 🎉
              </div>
            ) : (
              suggestedFriends.map((sug) => {
                const isAdded = addedSuggestedIds.includes(sug.id);
                return (
                  <div key={sug.id} className="flex items-center justify-between gap-2">
                    <div
                      onClick={() => onNavigateProfile(sug.username)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                    >
                      <img
                        src={sug.avatar}
                        alt={sug.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2E2856] group-hover:ring-[#8B5CF6] transition"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-white truncate block group-hover:text-[#A78BFA] transition">
                          {sug.name}
                        </span>
                        <span className="text-[10px] text-[#8E8AAB] truncate block flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-[#A78BFA]" />
                          {sug.reason}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={isAdded}
                      onClick={() => handleAddSuggested(sug.id, sug.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#6D28D9] hover:bg-[#7C3AED] text-white shadow-xs'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Friends */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8E8AAB] tracking-wider uppercase">
            <span>My Friends</span>
            <span className="text-[10px] text-[#A78BFA] font-mono">{friends.length}</span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {friends.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#171431] border border-[#26214A] text-center space-y-1.5">
                <Users className="w-6 h-6 text-[#A78BFA] mx-auto opacity-70" />
                <p className="text-xs font-bold text-white">No Friends Yet</p>
                <p className="text-[10px] text-[#8E8AAB]">
                  Click "+ Add" above or search for study partners in public rooms!
                </p>
              </div>
            ) : (
              friends.map((fr) => (
                <div
                  key={fr.id}
                  onClick={() => onNavigateProfile(fr.username)}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#171431] border border-[#26214A] cursor-pointer hover:border-[#6D28D9] transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img src={fr.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#171431] ${
                          fr.status === 'studying'
                            ? 'bg-[#8B5CF6] animate-pulse'
                            : fr.status === 'online'
                            ? 'bg-emerald-500'
                            : fr.status === 'away'
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-xs text-white block truncate group-hover:text-[#A78BFA] transition">
                        {fr.name}
                      </span>
                      <span className="text-[10px] text-[#A78BFA] truncate block">
                        {fr.currentRoomTitle || (fr.status === 'studying' ? 'In Focus Session' : fr.status)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateDirectMessage(fr.id);
                    }}
                    className="p-1.5 rounded-lg text-[#8E8AAB] hover:text-white hover:bg-[#231F45] transition cursor-pointer"
                    title={`Message ${fr.name}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Purple Chat Action Bubble */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={() => onNavigateDirectMessage(friends[0]?.id || 'user_bella')}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center shadow-lg shadow-purple-900/50 hover:scale-110 transition transform cursor-pointer"
          title="Open Quick Chat"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
        </button>
      </div>
    </aside>
  );
};
