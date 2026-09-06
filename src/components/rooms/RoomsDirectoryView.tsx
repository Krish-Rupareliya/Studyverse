import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { SCENIC_ROOM_BACKGROUNDS } from '../../data/roomThemes';
import { RoomSettingsCustomizerModal } from './RoomSettingsCustomizerModal';
import { StudyRoom } from '../../types';
import {
  Search,
  Plus,
  Flame,
  Clock,
  Globe,
  Lock,
  Users,
  ChevronDown,
  X,
  Sparkles,
  Trash2,
  Settings,
} from 'lucide-react';

interface RoomsDirectoryViewProps {
  onJoinRoom: (roomId: string) => void;
  onNavigateProfile: (username: string) => void;
  onOpenCreateModal?: () => void;
}

export const RoomsDirectoryView: React.FC<RoomsDirectoryViewProps> = ({
  onJoinRoom,
  onNavigateProfile,
}) => {
  const { currentUser } = useAuth();
  const { rooms, createRoom, deleteRoom, updateRoomSettings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All Tags');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<StudyRoom | null>(null);

  // New room modal state matching Screenshot 2
  const [newTitle, setNewTitle] = useState('');
  const [newAccess, setNewAccess] = useState<'public' | 'private' | 'locked'>('public');
  const [newPasscode, setNewPasscode] = useState('1234');
  const [newMicRule, setNewMicRule] = useState<'Breaks Only' | 'Always Allowed' | 'Muted'>('Breaks Only');
  const [newChatRule, setNewChatRule] = useState<'Breaks Only' | 'Always Allowed' | 'Disabled'>('Breaks Only');
  const [newCategory, setNewCategory] = useState('Focused Study');

  const tagsList = ['All Tags', 'Focused Study', 'Computer Science', 'Medical / MCAT', 'Quiet Library', 'Lofi & Chill', 'Exam Prep'];

  const filteredRooms = (rooms || []).filter((room) => {
    const matchesTag = selectedTag === 'All Tags' || room.category === selectedTag || room.subject === selectedTag;
    const matchesSearch =
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const isPriv = newAccess === 'private' || newAccess === 'locked';

    const created = createRoom({
      title: newTitle.trim(),
      description: `#studywithme aesthetics and ⏰ 50/10 pomodoro!`,
      subject: newCategory,
      category: 'General Focus',
      isPrivate: isPriv,
      passcode: newAccess === 'locked' ? (newPasscode.trim() || '1234') : undefined,
      maxParticipants: 15,
      theme: 'lofi_cafe',
      workDuration: 50,
      shortBreakDuration: 10,
      rules: {
        micRule: newMicRule === 'Always Allowed' ? 'always_allowed' : newMicRule === 'Muted' ? 'host_only' : 'break_only',
        chatRule: newChatRule === 'Always Allowed' ? 'free_chat' : newChatRule === 'Disabled' ? 'disabled' : 'break_only',
        cameraRule: 'optional',
        screenShareRule: 'anyone',
        accessType: newAccess === 'public' ? 'public' : newAccess === 'private' ? 'unlisted' : 'private_passcode',
        autoMuteOnJoin: false,
      },
    });

    setShowCreateModal(false);
    onJoinRoom(created.id);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-[#0D0B1D] text-slate-100 min-h-full">
      {/* Top Header Bar with Monthly Stats and Create Button (Matching Screenshot 5 & 9) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Public Rooms</h1>
          <p className="text-xs sm:text-sm text-[#8E8AAB] mt-0.5">Discover and join study sessions</p>
        </div>

        {/* Right Stats Chips & Create Room Button */}
        <div className="flex items-center gap-3">
          {/* Monthly Focus Time Chip */}
          <div className="px-3.5 py-1.5 rounded-xl bg-[#171431] border border-[#26214A] flex items-center gap-2 text-xs font-semibold text-white shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>0.6 h this month</span>
          </div>

          {/* Day Streak Chip */}
          <div className="px-3.5 py-1.5 rounded-xl bg-[#171431] border border-[#26214A] flex items-center gap-1.5 text-xs font-semibold text-white shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>1 days</span>
          </div>

          {/* Vibrant Purple Create Room Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create study room</span>
          </button>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8E8AAB] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="w-full bg-[#171431] border border-[#26214A] focus:border-[#8B5CF6] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-[#8E8AAB] focus:outline-none transition"
          />
        </div>

        {/* Tags Selector Dropdown */}
        <div className="relative shrink-0 w-full sm:w-auto">
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-[#171431] border border-[#26214A] hover:border-[#8B5CF6] rounded-xl pl-4 pr-9 py-2 text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer"
          >
            {tagsList.map((tag) => (
              <option key={tag} value={tag} className="bg-[#171431] text-white">
                {tag}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#8E8AAB] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Scenic Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room, idx) => {
          const bgImage =
            SCENIC_ROOM_BACKGROUNDS[idx % SCENIC_ROOM_BACKGROUNDS.length]?.imageUrl ||
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';

          const roomParticipants = room.participants || [];
          const participantCount = roomParticipants.length;

          return (
            <div
              key={room.id}
              onClick={() => onJoinRoom(room.id)}
              className="relative h-60 rounded-2xl overflow-hidden bg-[#171431] border border-[#26214A] hover:border-[#8B5CF6] transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-purple-900/30 flex flex-col justify-between p-4"
            >
              {/* Background Cover Image with Gradient Overlay */}
              <img
                src={bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1D] via-[#0D0B1D]/60 to-[#0D0B1D]/25" />

              {/* Top Header Row in Card: Public Badge + Avatars */}
              <div className="relative z-10 flex items-center justify-between">
                {/* Privacy Badge */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                  {room.isPrivate ? (
                    <>
                      <Lock className="w-2.5 h-2.5 text-amber-400" />
                      <span>PRIVATE</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-2.5 h-2.5 text-emerald-400" />
                      <span>PUBLIC</span>
                    </>
                  )}
                </div>

                {/* Overlapping Friend Avatars & Host Options */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-2">
                    {roomParticipants.length > 0 ? (
                      roomParticipants.slice(0, 3).map((p, pIdx) => (
                        <div
                          key={p.userId || pIdx}
                          className="w-6.5 h-6.5 rounded-full bg-purple-600 ring-2 ring-[#0D0B1D] overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          title={p.user?.name || p.userId}
                        >
                          {p.user?.avatar ? (
                            <img src={p.user.avatar} alt={p.user?.name || ''} className="w-full h-full object-cover" />
                          ) : (
                            (p.user?.name || 'P').slice(0, 2).toUpperCase()
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="w-6.5 h-6.5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-[#0D0B1D]">
                        1
                      </div>
                    )}
                    {roomParticipants.length > 3 && (
                      <div className="px-1.5 py-0.5 rounded-full bg-[#1E1938] text-[9px] font-bold text-[#A78BFA] ring-2 ring-[#0D0B1D]">
                        +{roomParticipants.length - 3}
                      </div>
                    )}
                  </div>

                  {room.hostId === currentUser?.id && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRoom(room);
                        }}
                        className="p-1.5 rounded-full bg-purple-500/20 hover:bg-purple-600 text-purple-300 hover:text-white transition backdrop-blur-md border border-purple-500/30 cursor-pointer"
                        title="Edit Room Settings & Access"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete study room "${room.title}"?`)) {
                            deleteRoom(room.id);
                          }
                        }}
                        className="p-1.5 rounded-full bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition backdrop-blur-md border border-rose-500/30 cursor-pointer"
                        title="Delete Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Content: Title, Description, Tags */}
              <div className="relative z-10 space-y-2">
                <h3 className="font-extrabold text-base text-white group-hover:text-[#A78BFA] transition line-clamp-1">
                  {room.title}
                </h3>

                <p className="text-[11px] text-[#8E8AAB] line-clamp-2 leading-relaxed">
                  {room.description || 'Welcome! Focus and study together in silence with pomodoro timer.'}
                </p>

                {/* Tags & Live Participant Count */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-semibold text-[#A78BFA]">
                  <span className="px-2 py-0.5 rounded-md bg-[#231F45]/80 border border-[#352F64] text-emerald-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>{participantCount} / {room.maxParticipants || 10}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#231F45]/80 border border-[#352F64]">
                    ⏰ {room.timer?.workDuration || 50}/{room.timer?.shortBreakDuration || 10}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#231F45]/80 border border-[#352F64]">
                    🧘 {room.category || 'Focus'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Room Modal (Matching Screenshot 2) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171431] border border-[#2E2856] rounded-3xl p-6 w-full max-w-lg space-y-5 text-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#26214A] pb-3">
              <h3 className="text-lg font-extrabold text-white">Create Study Room</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              {/* Room Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8E8AAB] uppercase tracking-wider">
                  Room Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dipti's Japanese Hills at Dusk 🍃"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0D0B1D] border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#8E8AAB] focus:outline-none"
                />
              </div>

              {/* Room Access (Public / Private / Locked) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8E8AAB] uppercase tracking-wider">
                  Room Access
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAccess('public')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition ${
                      newAccess === 'public'
                        ? 'bg-[#6D28D9]/20 border-[#8B5CF6] text-white'
                        : 'bg-[#0D0B1D] border-[#26214A] text-[#8E8AAB] hover:border-[#352F64]'
                    }`}
                  >
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold">Public</span>
                    <span className="text-[9px] text-[#8E8AAB]">Anyone can join</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewAccess('private')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition ${
                      newAccess === 'private'
                        ? 'bg-[#6D28D9]/20 border-[#8B5CF6] text-white'
                        : 'bg-[#0D0B1D] border-[#26214A] text-[#8E8AAB] hover:border-[#352F64]'
                    }`}
                  >
                    <Users className="w-5 h-5 text-[#A78BFA]" />
                    <span className="text-xs font-bold">Private</span>
                    <span className="text-[9px] text-[#8E8AAB]">Friends & Link only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewAccess('locked')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition ${
                      newAccess === 'locked'
                        ? 'bg-[#6D28D9]/20 border-[#8B5CF6] text-white'
                        : 'bg-[#0D0B1D] border-[#26214A] text-[#8E8AAB] hover:border-[#352F64]'
                    }`}
                  >
                    <Lock className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold">Locked</span>
                    <span className="text-[9px] text-[#8E8AAB]">PIN passcode</span>
                  </button>
                </div>

                {newAccess === 'locked' && (
                  <div className="p-3 rounded-xl bg-[#0D0B1D] border border-[#2E2856] flex items-center gap-3 mt-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Set 4-Digit Room PIN</label>
                      <input
                        type="text"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="e.g. 1234"
                        maxLength={8}
                        className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none mt-0.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Room Communication Rules */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-[#8E8AAB] uppercase tracking-wider">
                  Room Communication
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0D0B1D] border border-[#26214A] rounded-xl space-y-1.5">
                    <span className="text-xs font-semibold text-white block">Microphones</span>
                    <select
                      value={newMicRule}
                      onChange={(e) => setNewMicRule(e.target.value as any)}
                      className="w-full bg-[#171431] border border-[#352F64] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Breaks Only">Breaks Only</option>
                      <option value="Always Allowed">Always Allowed</option>
                      <option value="Muted">Muted</option>
                    </select>
                  </div>

                  <div className="p-3 bg-[#0D0B1D] border border-[#26214A] rounded-xl space-y-1.5">
                    <span className="text-xs font-semibold text-white block">Chat</span>
                    <select
                      value={newChatRule}
                      onChange={(e) => setNewChatRule(e.target.value as any)}
                      className="w-full bg-[#171431] border border-[#352F64] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Breaks Only">Breaks Only</option>
                      <option value="Always Allowed">Always Allowed</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26214A]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8E8AAB] hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/40 transition"
                >
                  Save & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Room Customizer Modal for Host Settings & Access */}
      {editingRoom && (
        <RoomSettingsCustomizerModal
          isOpen={Boolean(editingRoom)}
          onClose={() => setEditingRoom(null)}
          room={editingRoom}
          isLead={true}
          onDeleteRoom={(roomId) => {
            deleteRoom(roomId);
            setEditingRoom(null);
          }}
          onSave={(updates) => {
            updateRoomSettings(editingRoom.id, updates);
            setEditingRoom(null);
          }}
          onUpdateSettings={(updates) => {
            updateRoomSettings(editingRoom.id, updates);
            setEditingRoom(null);
          }}
        />
      )}
    </div>
  );
};
