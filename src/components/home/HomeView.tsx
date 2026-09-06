import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { SCENIC_ROOM_BACKGROUNDS } from '../../data/roomThemes';
import {
  Plus,
  Users,
  Flame,
  Clock,
  Radio,
  Sparkles,
  ArrowRight,
  Globe,
  Lock,
} from 'lucide-react';

interface HomeViewProps {
  onJoinRoom: (roomId: string) => void;
  onNavigateProfile: (username: string) => void;
  onCreateRoomModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onJoinRoom,
  onNavigateProfile,
  onCreateRoomModal,
}) => {
  const { currentUser } = useAuth();
  const { rooms, getFriends } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'hosted'>('all');

  const friends = typeof getFriends === 'function' ? getFriends(currentUser?.id || '') || [] : [];
  const studyingFriends = friends.filter((f) => f.status === 'studying' || f.currentRoomId);
  const primaryStudyingFriend = studyingFriends[0] || null;

  const displayedRooms = (rooms || []).filter((r) => {
    if (activeTab === 'hosted') return r.hostId === currentUser?.id;
    return true;
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-7 bg-[#0D0B1D] text-slate-100 min-h-full">
      {/* Top Welcome Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Home</h1>
        <p className="text-xs sm:text-sm text-[#8E8AAB]">Welcome back! Ready to focus?</p>
      </div>

      {/* Friends Studying Active Banner (matching Screenshot 7 & 8) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              studyingFriends.length > 0 ? 'bg-[#10B981] animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span>{studyingFriends.length} Friends Studying</span>
        </div>

        {primaryStudyingFriend && primaryStudyingFriend.currentRoomId ? (
          <div
            onClick={() => onJoinRoom(primaryStudyingFriend.currentRoomId!)}
            className="relative max-w-md h-36 rounded-2xl overflow-hidden cursor-pointer group border border-[#2E2856] hover:border-[#8B5CF6] transition-all shadow-xl"
          >
            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1D] via-[#0D0B1D]/40 to-transparent" />

            {/* User badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <img
                src={primaryStudyingFriend.avatar}
                alt={primaryStudyingFriend.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white/30"
              />
              <span className="text-xs font-bold text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                @{primaryStudyingFriend.username}
              </span>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-[#A78BFA] transition">
                  {primaryStudyingFriend.name} is studying
                </h4>
                <p className="text-[11px] text-[#A78BFA] font-medium">
                  {primaryStudyingFriend.currentRoomTitle || 'Active Study Session'}
                </p>
              </div>
              <span className="px-3 py-1 bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-bold rounded-lg shadow-md transition">
                Join Room
              </span>
            </div>
          </div>
        ) : (
          <div className="max-w-md p-4 rounded-2xl bg-[#171431] border border-[#26214A] flex items-center justify-between text-xs text-[#8E8AAB]">
            <span>No friends studying right now. Start a session or invite a friend!</span>
            <button
              onClick={onCreateRoomModal}
              className="px-3 py-1.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white font-bold rounded-xl transition text-xs shrink-0 ml-2"
            >
              Start Room
            </button>
          </div>
        )}
      </div>

      {/* Tabs Row: All Rooms | Favorites | Hosted */}
      <div className="space-y-4">
        <div className="flex items-center gap-6 border-b border-[#1E1938] pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition relative ${
              activeTab === 'all' ? 'text-white' : 'text-[#8E8AAB] hover:text-white'
            }`}
          >
            All Rooms
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition relative ${
              activeTab === 'favorites' ? 'text-white' : 'text-[#8E8AAB] hover:text-white'
            }`}
          >
            Favorites
            {activeTab === 'favorites' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('hosted')}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition relative ${
              activeTab === 'hosted' ? 'text-white' : 'text-[#8E8AAB] hover:text-white'
            }`}
          >
            Hosted
            {activeTab === 'hosted' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6] rounded-full" />
            )}
          </button>
        </div>

        {/* Create Room Dashed Action Card */}
        <button
          onClick={onCreateRoomModal}
          className="w-full py-4 border-2 border-dashed border-[#2E2856] hover:border-[#8B5CF6] hover:bg-[#171431] rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#A78BFA] transition group shadow-sm"
        >
          <Plus className="w-4 h-4 group-hover:scale-125 transition" />
          <span>Create a new study room</span>
        </button>

        {/* Scenic Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {displayedRooms.map((room, idx) => {
            const bgImage =
              SCENIC_ROOM_BACKGROUNDS[idx % SCENIC_ROOM_BACKGROUNDS.length]?.imageUrl ||
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={room.id}
                onClick={() => onJoinRoom(room.id)}
                className="relative h-56 rounded-2xl overflow-hidden bg-[#171431] border border-[#26214A] hover:border-[#8B5CF6] transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-purple-900/20 flex flex-col justify-between p-4"
              >
                {/* Background Image with Gradient Overlay */}
                <img
                  src={bgImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B1D] via-[#0D0B1D]/60 to-[#0D0B1D]/20" />

                {/* Top Badge: Member Count */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                    <Users className="w-3 h-3 text-[#A78BFA]" />
                    <span>
                      {(room.participants || []).length}/{room.maxParticipants || 15}
                    </span>
                  </div>
                </div>

                {/* Bottom Content: Title & Tags */}
                <div className="relative z-10 space-y-1.5">
                  <h3 className="font-bold text-base text-white group-hover:text-[#A78BFA] transition line-clamp-1">
                    {room.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A78BFA] font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Custom
                    </span>
                    <span>•</span>
                    <span>Focused Study</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
