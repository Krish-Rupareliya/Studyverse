import React, { useState } from 'react';
import {
  Users,
  Crown,
  Key,
  Shield,
  User,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MoreVertical,
  UserMinus,
  Check,
  X,
  Search,
  Sparkles,
  VolumeX,
  AlertTriangle,
  UserPlus,
  ArrowRightLeft,
  Sliders,
} from 'lucide-react';
import { RoomParticipant, RoomParticipantRole, StudyRoom, UserProfile } from '../../types';

export interface RoomParticipantsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants?: RoomParticipant[];
  room?: StudyRoom;
  currentUserId?: string;
  hostId?: string;
  onUpdateRole: (targetUserId: string, newRole: RoomParticipantRole) => boolean;
  onKickParticipant: (targetUserId: string, reason?: string) => boolean;
  onRemoteMute: (targetUserId: string, muteType: 'audio' | 'video') => void;
  onInviteFriends?: () => void;
  onNavigateProfile?: (username: string) => void;
  onNavigateDirectMessage?: (userId: string) => void;
}

export const RoomParticipantsManagerModal: React.FC<RoomParticipantsManagerModalProps> = ({
  isOpen,
  onClose,
  participants,
  room,
  currentUserId = '',
  hostId = '',
  onUpdateRole,
  onKickParticipant,
  onRemoteMute,
  onInviteFriends,
  onNavigateProfile,
  onNavigateDirectMessage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserForAction, setSelectedUserForAction] = useState<RoomParticipant | null>(null);
  const [confirmKickUser, setConfirmKickUser] = useState<RoomParticipant | null>(null);
  const [kickReason, setKickReason] = useState('Disruptive behavior or requested by host');
  const [roleChangeNotice, setRoleChangeNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawList: RoomParticipant[] = participants && participants.length > 0 ? participants : room?.participants || [];

  // Guarantee list is non-empty
  const participantList: RoomParticipant[] =
    rawList.length > 0
      ? rawList
      : [
          {
            userId: currentUserId || 'user_alex',
            user: {
              id: currentUserId || 'user_alex',
              name: 'Alex Morgan',
              username: 'alex',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              status: 'studying',
            } as any,
            role: 'host',
            joinedAt: Date.now() - 120000,
            isAudioEnabled: true,
            isVideoEnabled: true,
            isScreenSharing: false,
            isSpeaking: false,
            audioLevel: 0,
          },
        ];

  const effectiveHostId = hostId || room?.hostId;
  const effectiveCurrentUserId = currentUserId || participantList[0]?.userId;

  const myParticipant = participantList.find((p) => p?.userId === effectiveCurrentUserId);
  const isLead =
    Boolean(effectiveHostId && effectiveHostId === effectiveCurrentUserId) ||
    myParticipant?.role === 'host';
  const isMod = myParticipant?.role === 'co-host';

  const filtered = participantList.filter((p) => {
    if (!p) return false;
    const name = p.user?.name || '';
    const username = p.user?.username || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleConfirmKick = () => {
    if (!confirmKickUser) return;
    onKickParticipant(confirmKickUser.userId, kickReason.trim() || 'Moderator action');
    setRoleChangeNotice(`Removed @${confirmKickUser.user?.username || 'user'} from the room.`);
    setTimeout(() => setRoleChangeNotice(null), 3000);
    setConfirmKickUser(null);
    setKickReason('');
    setSelectedUserForAction(null);
  };

  const handleRoleUpdate = (targetUserId: string, newRole: RoomParticipantRole, targetName: string) => {
    const success = onUpdateRole(targetUserId, newRole);
    if (success) {
      setRoleChangeNotice(`Updated ${targetName}'s role to ${newRole.toUpperCase()}`);
      setTimeout(() => setRoleChangeNotice(null), 3000);
    }
    setSelectedUserForAction(null);
  };

  const getRoleBadge = (role: RoomParticipantRole) => {
    switch (role) {
      case 'host':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
            LEAD HOST
          </span>
        );
      case 'co-host':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
            <Key className="w-3 h-3 text-amber-300" />
            CO-HOST
          </span>
        );
      case 'observer':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/20 text-slate-300 border border-slate-500/30 text-[10px] font-bold">
            OBSERVER
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            <User className="w-3 h-3 text-emerald-400" />
            MEMBER
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#171431] border border-[#2E2856] rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#26214A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6D28D9]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">Room Participants & Roles</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#231F45] text-xs font-bold text-[#A78BFA] border border-[#3A3369]">
                  {participantList.length} Online
                </span>
              </div>
              <p className="text-xs text-[#8E8AAB]">
                {isLead
                  ? '👑 You are Lead Host — manage participant roles, mutes & kicking'
                  : 'Participants currently studying in this room'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onInviteFriends && (
              <button
                onClick={onInviteFriends}
                className="px-3 py-1.5 rounded-xl bg-[#6D28D9]/30 hover:bg-[#6D28D9] border border-[#8B5CF6]/40 text-xs font-bold text-[#A78BFA] hover:text-white flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action / Success Banner */}
        {roleChangeNotice && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{roleChangeNotice}</span>
          </div>
        )}

        {/* Search */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participants by name or @username..."
              className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-5 sm:px-6 space-y-3">
          {filtered.map((p) => {
            const isMe = p.userId === effectiveCurrentUserId;
            const isTargetLead = p.userId === effectiveHostId || p.role === 'host';
            const isTargetMod = p.role === 'co-host';

            // Host can moderate everyone except himself
            // Moderator can moderate regular members
            const canModerate = isLead ? !isMe : isMod && !isTargetLead && !isTargetMod && !isMe;

            return (
              <div
                key={p.userId}
                className={`p-3.5 rounded-2xl border transition flex flex-col gap-3 ${
                  isMe
                    ? 'bg-[#6D28D9]/15 border-[#8B5CF6]/50'
                    : 'bg-[#0D0B1D] border-[#26214A] hover:border-[#3B346B]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* User Avatar + Info */}
                  <div
                    className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                    onClick={() => onNavigateProfile && p.user?.username && onNavigateProfile(p.user.username)}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          p.user?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#26214A] group-hover:ring-[#8B5CF6] transition"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0D0B1D] ${
                          p.isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white group-hover:text-[#A78BFA] transition truncate">
                          {p.user?.name || 'Study Member'}
                        </span>
                        {isMe && <span className="text-[10px] text-[#A78BFA] font-bold">(You)</span>}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#8E8AAB] truncate">
                          @{p.user?.username || 'member'}
                        </span>
                        {getRoleBadge(p.role)}
                      </div>
                    </div>
                  </div>

                  {/* Media Indicators & Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Mic Status */}
                    <button
                      disabled={!canModerate}
                      onClick={() => onRemoteMute(p.userId, 'audio')}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${
                        p.isAudioEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      } ${canModerate ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                      title={canModerate ? 'Click to toggle remote mic mute' : p.isAudioEnabled ? 'Mic Active' : 'Mic Muted'}
                    >
                      {p.isAudioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Cam Status */}
                    <button
                      disabled={!canModerate}
                      onClick={() => onRemoteMute(p.userId, 'video')}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${
                        p.isVideoEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      } ${canModerate ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                      title={canModerate ? 'Click to toggle remote camera' : p.isVideoEnabled ? 'Camera On' : 'Camera Off'}
                    >
                      {p.isVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Direct Host Moderation Options */}
                    {canModerate && (
                      <button
                        onClick={() =>
                          setSelectedUserForAction(selectedUserForAction?.userId === p.userId ? null : p)
                        }
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                          selectedUserForAction?.userId === p.userId
                            ? 'bg-[#6D28D9] text-white border-[#8B5CF6]'
                            : 'bg-[#231F45] text-[#A78BFA] border-[#3E376E] hover:bg-[#322C63] hover:text-white'
                        }`}
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Action Panel for Selected Participant */}
                {canModerate && selectedUserForAction?.userId === p.userId && (
                  <div className="pt-2 border-t border-[#26214A] grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in zoom-in-95">
                    {/* Transfer Host (Lead only) */}
                    {isLead && p.userId !== effectiveHostId && p.role !== 'host' && (
                      <button
                        type="button"
                        onClick={() => handleRoleUpdate(p.userId, 'host', p.user?.name || 'Member')}
                        className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        Make Lead Host
                      </button>
                    )}

                    {/* Promote to Moderator or Demote */}
                    {isLead && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = p.role === 'co-host' ? 'member' : 'co-host';
                          handleRoleUpdate(p.userId, next, p.user?.name || 'Member');
                        }}
                        className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        {p.role === 'co-host' ? 'Demote to Member' : 'Promote to Mod'}
                      </button>
                    )}

                    {/* Remote Mute Action */}
                    <button
                      type="button"
                      onClick={() => {
                        onRemoteMute(p.userId, 'audio');
                        setRoleChangeNotice(`Toggled microphone for ${p.user?.name || 'user'}`);
                        setTimeout(() => setRoleChangeNotice(null), 3000);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#231F45] hover:bg-[#322C63] text-slate-200 border border-[#3A3369] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                      {p.isAudioEnabled ? 'Mute Microphone' : 'Unmute Mic'}
                    </button>

                    {/* Kick Participant */}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmKickUser(p);
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      Kick from Room
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Kick Confirmation Modal Overlay */}
        {confirmKickUser && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#171431] border border-rose-500/50 rounded-3xl p-5 sm:p-6 w-full max-w-sm space-y-4 text-slate-200 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Kick Participant</h3>
                  <p className="text-[11px] text-rose-300">Remove user from this study session</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to remove{' '}
                <span className="font-bold text-white">
                  {confirmKickUser.user?.name} (@{confirmKickUser.user?.username})
                </span>{' '}
                from this study room?
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  value={kickReason}
                  onChange={(e) => setKickReason(e.target.value)}
                  placeholder="e.g. Noise violation, inactive, etc."
                  className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmKickUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#231F45] text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmKick}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition shadow-lg shadow-rose-900/40"
                >
                  Confirm Kick
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
