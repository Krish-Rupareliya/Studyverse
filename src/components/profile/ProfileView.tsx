import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { EditUsernameModal } from './EditUsernameModal';
import {
  UserPlus,
  UserCheck,
  Clock,
  Ban,
  MessageSquare,
  Radio,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  MapPin,
  Calendar,
  Shield,
  Check,
  X,
  Share2,
  Users,
  Edit3,
  AtSign,
} from 'lucide-react';

interface ProfileViewProps {
  username: string;
  onNavigateProfile: (username: string) => void;
  onNavigateDirectMessage: (userId: string) => void;
  onNavigateRoom: (roomId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  username,
  onNavigateProfile,
  onNavigateDirectMessage,
  onNavigateRoom,
}) => {
  const { currentUser, users } = useAuth();
  const {
    getRelationship,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    unfriendUser,
    blockUser,
    unblockUser,
    getFriends,
    activeRoom,
    inviteFriendToRoom,
  } = useApp();

  const [inviteSent, setInviteSent] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Find user by username
  const targetUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

  if (!targetUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 text-slate-200">
        <h2 className="text-xl font-bold text-white">User Not Found</h2>
        <p className="text-xs text-[#8E8AAB]">The requested profile @{username} does not exist in StudySpace.</p>
        <button
          onClick={() => onNavigateProfile(currentUser?.username || 'alex')}
          className="px-4 py-2 bg-[#6D28D9] text-white rounded-xl text-xs font-semibold hover:bg-[#7C3AED] transition cursor-pointer"
        >
          Return to My Profile
        </button>
      </div>
    );
  }

  const isMe = targetUser.id === currentUser?.id;
  const relationship = isMe ? 'me' : getRelationship(currentUser?.id || '', targetUser.id);
  const targetFriends = typeof getFriends === 'function' ? getFriends(targetUser.id) || [] : [];
  const myFriends = typeof getFriends === 'function' ? getFriends(currentUser?.id || '') || [] : [];

  // Calculate mutual friends
  const mutualFriends = isMe
    ? []
    : targetFriends.filter((tf) => myFriends.some((mf) => mf.id === tf.id));

  const handleInviteToActiveRoom = () => {
    if (!activeRoom) return;
    inviteFriendToRoom(activeRoom.id, targetUser.id);
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 3000);
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/#profile-${targetUser.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div id="profile-view-container" className="max-w-4xl mx-auto space-y-6 animate-fade-in text-slate-200 pb-20 md:pb-8">
      {/* Main Profile Header Card */}
      <div className="bg-[#171431] border border-[#26214A] rounded-3xl overflow-hidden shadow-2xl">
        {/* Cover Header Banner */}
        <div
          className="h-36 sm:h-44 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4C1D95] relative bg-cover bg-center"
          style={targetUser.banner ? { backgroundImage: `url(${targetUser.banner})` } : {}}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              className="px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold rounded-full border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
              title="Copy Profile Link"
            >
              <Share2 className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>{copiedLink ? 'Link Copied! ✓' : 'Share'}</span>
            </button>

            <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold rounded-full border border-white/20 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Level {targetUser.studyStats?.level ?? 1} Scholar
            </span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4">
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl object-cover ring-4 ring-[#171431] shadow-2xl bg-[#0D0B1D]"
                />
                <div
                  className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#171431] ${
                    targetUser.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                  title={targetUser.isOnline ? 'Online' : 'Offline'}
                />
              </div>

              <div className="mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  {targetUser.name}
                  {isMe && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#6D28D9]/30 text-[#A78BFA] border border-[#8B5CF6]/40">
                      You
                    </span>
                  )}
                </h1>
                <span className="text-xs sm:text-sm text-[#A78BFA] font-semibold">@{targetUser.username}</span>
              </div>
            </div>

            {/* Relationship / Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isMe ? (
                <button
                  id="edit-profile-username-btn"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40 hover:scale-105"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Username</span>
                </button>
              ) : (
                <>
                  {/* Status: None -> Add Friend */}
                  {relationship === 'none' && (
                    <button
                      id="profile-add-friend-btn"
                      onClick={() => sendFriendRequest(targetUser.id)}
                      className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Friend</span>
                    </button>
                  )}

                  {/* Status: Pending Sent -> Cancel */}
                  {relationship === 'pending_sent' && (
                    <button
                      id="profile-cancel-request-btn"
                      onClick={() => cancelFriendRequest(targetUser.id)}
                      className="px-4 py-2 bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Clock className="w-4 h-4 text-[#A78BFA]" />
                      <span>Request Sent (Cancel)</span>
                    </button>
                  )}

                  {/* Status: Pending Received -> Accept / Decline */}
                  {relationship === 'pending_received' && (
                    <div className="flex items-center gap-2">
                      <button
                        id="profile-accept-friend-btn"
                        onClick={() => acceptFriendRequest(targetUser.id)}
                        className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        id="profile-decline-friend-btn"
                        onClick={() => declineFriendRequest(targetUser.id)}
                        className="px-3 py-2 bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white rounded-xl text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Status: Accepted Friend */}
                  {relationship === 'accepted' && (
                    <div className="flex items-center gap-2">
                      <button
                        id="profile-direct-message-btn"
                        onClick={() => onNavigateDirectMessage(targetUser.id)}
                        className="px-4 py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Message</span>
                      </button>

                      {activeRoom && (
                        <button
                          id="profile-invite-active-room-btn"
                          disabled={inviteSent}
                          onClick={handleInviteToActiveRoom}
                          className="px-3.5 py-2 bg-[#6D28D9]/20 hover:bg-[#6D28D9]/30 text-white border border-[#8B5CF6]/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Radio className="w-3.5 h-3.5 text-[#A78BFA]" />
                          <span>{inviteSent ? 'Invite Sent ✓' : 'Invite to Room'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => unfriendUser(targetUser.id)}
                        className="px-3 py-2 bg-[#0D0B1D] hover:bg-rose-500/20 text-[#8E8AAB] hover:text-rose-400 rounded-xl text-xs font-medium transition"
                        title="Unfriend"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  )}

                  {/* Block / Unblock */}
                  {relationship === 'blocked' ? (
                    <button
                      id="profile-unblock-btn"
                      onClick={() => unblockUser(targetUser.id)}
                      className="px-3.5 py-2 bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white rounded-xl text-xs font-semibold transition"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      id="profile-block-btn"
                      onClick={() => blockUser(targetUser.id)}
                      className="px-2.5 py-2 text-[#8E8AAB] hover:text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs transition"
                      title="Block user"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bio & Academic Details */}
          <div className="mt-6 pt-6 border-t border-[#26214A] space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              {targetUser.bio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#8E8AAB]">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#A78BFA]" />
                <strong className="text-white">Major:</strong> {targetUser.major}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A78BFA]" />
                <strong className="text-white">Campus:</strong> {targetUser.university}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#A78BFA]" />
                <strong className="text-white">Member Since:</strong>{' '}
                {targetUser.joinedDate ||
                  (targetUser.badges?.[0]?.unlockedAt
                    ? new Date(targetUser.badges[0].unlockedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'September 2024')}
              </span>
            </div>

            {/* Focus Areas & Interests Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-[#8E8AAB]">Focus Areas & Interests:</span>
              {(targetUser.interests || targetUser.subjects || ['Computer Science', 'Algorithms']).map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#0D0B1D] border border-[#2E2856] text-[#A78BFA] text-xs font-medium hover:border-[#8B5CF6]/50 transition"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Study Statistics & Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-5 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#8E8AAB] text-xs">
            <span>Total Study Time</span>
            <Clock className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {targetUser.studyStats?.totalHoursStudied ?? 0} Hours
          </div>
          <p className="text-[11px] text-[#A78BFA] font-medium">Verified focus room sessions</p>
        </div>

        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-5 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#8E8AAB] text-xs">
            <span>Current Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {targetUser.studyStats?.streakDays ?? 0} Days 🔥
          </div>
          <p className="text-[11px] text-amber-400 font-medium">Consecutive daily sprints</p>
        </div>

        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-5 shadow-lg space-y-1">
          <div className="flex items-center justify-between text-[#8E8AAB] text-xs">
            <span>Pomodoros Completed</span>
            <Award className="w-4 h-4 text-[#A78BFA]" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {targetUser.studyStats?.pomodorosCompleted ?? 0} Cycles
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">Deep focus intervals completed</p>
        </div>
      </div>

      {/* Badges & Mutual Friends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Badges Earned */}
        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-[#A78BFA]" />
            <span>Badges & Achievements</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {(targetUser.studyStats?.badges || []).map((badge, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#0D0B1D] border border-[#26214A] flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-[#231F45] text-[#A78BFA] flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-white block truncate">{badge}</span>
                  <span className="text-[10px] text-[#8E8AAB] block">Verified Badge</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mutual Friends / Peer Network */}
        <div className="bg-[#171431] border border-[#26214A] rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#A78BFA]" />
              <span>Study Connections ({targetFriends.length})</span>
            </h3>
            {!isMe && (
              <span className="text-xs text-[#A78BFA] font-medium">
                {mutualFriends.length} mutual friends
              </span>
            )}
          </div>

          <div className="space-y-2">
            {targetFriends.length === 0 ? (
              <p className="text-xs text-[#8E8AAB] py-4 text-center">No study connections listed yet.</p>
            ) : (
              targetFriends.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded-xl bg-[#0D0B1D] border border-[#26214A] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={f.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <button
                        onClick={() => onNavigateProfile(f.username)}
                        className="font-bold text-xs text-white hover:text-[#A78BFA] transition block text-left"
                      >
                        {f.name}
                      </button>
                      <span className="text-[10px] text-[#A78BFA]">@{f.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateProfile(f.username)}
                    className="px-2.5 py-1 bg-[#231F45] hover:bg-[#352F64] rounded-lg text-[11px] text-white font-medium transition"
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Username & Profile Modal */}
      {isMe && (
        <EditUsernameModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(newUsername) => onNavigateProfile(newUsername)}
        />
      )}
    </div>
  );
};
