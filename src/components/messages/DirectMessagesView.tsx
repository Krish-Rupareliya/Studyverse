import React, { useState, useEffect, useRef, useCallback } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mediaService } from '../../services/mediaService';
import { LocalCameraStreamView, ScreenShareStreamView } from '../rooms/DraggableVideoStage';
import {
  MessageSquare,
  Send,
  Radio,
  Search,
  Check,
  UserCheck,
  UserPlus,
  Flame,
  ArrowLeft,
  BookOpen,
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Laptop,
  Sparkles,
  Smile,
  Film,
  CheckCheck,
  Image as ImageIcon,
} from 'lucide-react';

interface DirectMessagesViewProps {
  initialRecipientId?: string | null;
  autoStartCall?: boolean;
  onNavigateProfile: (username: string) => void;
  onNavigateRoom: (roomId: string) => void;
}

const POPULAR_GIFS = [
  { id: '1', title: 'Lofi Study Girl Focus', category: 'study', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZtNHptam9oZnlmdHZ1bHlxd2RydHBmbGl2ZW1ubHRxbHRwbmdkYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kC8N6DPOkbqGXjFUPU/giphy.gif' },
  { id: '2', title: 'Mind Blown / Genius', category: 'study', url: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif' },
  { id: '3', title: 'Cat Typing Fast Code', category: 'memes', url: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' },
  { id: '4', title: 'Coffee Grind & Vibe', category: 'coffee', url: 'https://media.giphy.com/media/3o85xGocUH8RYoDKKs/giphy.gif' },
  { id: '5', title: 'High Five Celebration', category: 'celebration', url: 'https://media.giphy.com/media/l1Aswx0iA2f3M2JeU/giphy.gif' },
  { id: '6', title: "Let's Go Hype Study", category: 'goodluck', url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif' },
  { id: '7', title: 'A+ Exam Ace', category: 'celebration', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif' },
  { id: '8', title: 'Good Luck Crossed Fingers', category: 'goodluck', url: 'https://media.giphy.com/media/1d7F9zb62PRb2/giphy.gif' },
  { id: '9', title: 'Brain Power Working', category: 'study', url: 'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif' },
  { id: '10', title: 'Writing Fast Pencil', category: 'study', url: 'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif' },
  { id: '11', title: 'Popcorn Chill Spectator', category: 'funny', url: 'https://media.giphy.com/media/gl0mkIZOW6Nwc/giphy.gif' },
  { id: '12', title: 'Anime Studying Hard', category: 'anime', url: 'https://media.giphy.com/media/12m03pMbePZ8B2/giphy.gif' },
  { id: '13', title: 'Gamer Concentration Mode', category: 'gaming', url: 'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif' },
  { id: '14', title: 'Nodding Approval Yes', category: 'reactions', url: 'https://media.giphy.com/media/10Jpr9KSaXLchW/giphy.gif' },
  { id: '15', title: 'SpongeBob Studying Hard', category: 'funny', url: 'https://media.giphy.com/media/B37cYPCruqwwg/giphy.gif' },
  { id: '16', title: 'Dancing Celebration Cat', category: 'memes', url: 'https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif' },
  { id: '17', title: 'Confused Math Formulas', category: 'study', url: 'https://media.giphy.com/media/DHqth0hVQoIzS/giphy.gif' },
  { id: '18', title: 'Thumbs Up Champion', category: 'reactions', url: 'https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif' },
  { id: '19', title: 'Morning Coffee Steam', category: 'coffee', url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif' },
  { id: '20', title: 'Victory Fireworks Spin', category: 'celebration', url: 'https://media.giphy.com/media/26tOZbfD9vA4315QI/giphy.gif' },
];

export const DirectMessagesView: React.FC<DirectMessagesViewProps> = ({
  initialRecipientId,
  autoStartCall,
  onNavigateProfile,
  onNavigateRoom,
}) => {
  const { currentUser, users = [] } = useAuth();
  const {
    getFriends,
    getDirectMessages,
    sendMessage,
    sendDirectMessage,
    markConversationAsRead,
    markDirectMessagesAsRead,
    getMessagesForConversation,
    activeRoom,
    rooms = [],
    startScreenShare,
    stopScreenShare,
    localScreenStream,
    isScreenSharingActive,
  } = useApp();

  const safeGetDirectMessages = useCallback(
    (user1Id: string, user2Id: string) => {
      if (typeof getDirectMessages === 'function') {
        return getDirectMessages(user1Id, user2Id) || [];
      }
      if (typeof getMessagesForConversation === 'function') {
        const pair = [user1Id, user2Id].sort();
        const convId = `conv_${pair[0]}_${pair[1]}`;
        return getMessagesForConversation(convId) || [];
      }
      return [];
    },
    [getDirectMessages, getMessagesForConversation]
  );

  const safeSendDirectMessage = useCallback(
    (
      receiverId: string,
      content: string,
      type: 'text' | 'room_invite' = 'text',
      actionData?: { roomId?: string; roomCode?: string; roomTitle?: string }
    ) => {
      if (typeof sendDirectMessage === 'function') {
        sendDirectMessage(receiverId, content, type, actionData);
        return;
      }
      if (typeof sendMessage === 'function') {
        const pair = [currentUser.id, receiverId].sort();
        const convId = `conv_${pair[0]}_${pair[1]}`;
        sendMessage(convId, content, type, actionData);
      }
    },
    [sendDirectMessage, sendMessage, currentUser]
  );

  const safeMarkAsRead = useCallback(
    (otherUserId: string) => {
      if (typeof markDirectMessagesAsRead === 'function') {
        markDirectMessagesAsRead(otherUserId);
      } else if (typeof markConversationAsRead === 'function') {
        const pair = [currentUser.id, otherUserId].sort();
        const convId = `conv_${pair[0]}_${pair[1]}`;
        markConversationAsRead(convId);
      }
    },
    [markDirectMessagesAsRead, markConversationAsRead, currentUser]
  );

  const friends = typeof getFriends === 'function' && currentUser?.id ? getFriends(currentUser.id) || [] : [];
  const otherUsers = (users || []).filter((u) => u.id !== currentUser?.id);

  // Selected thread recipient
  const [selectedUserId, setSelectedUserId] = useState<string>(
    initialRecipientId || (friends[0]?.id ?? otherUsers[0]?.id ?? '')
  );

  const [messageInput, setMessageInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [selectedGifCategory, setSelectedGifCategory] = useState<string>('all');
  const [tenorGifs, setTenorGifs] = useState<{ id: string; title: string; url: string; previewUrl: string }[]>([]);
  const [tenorLoading, setTenorLoading] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(initialRecipientId));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Switch if initial recipient prop changes
  useEffect(() => {
    if (initialRecipientId) {
      setSelectedUserId(initialRecipientId);
      setMobileShowChat(true);
    }
  }, [initialRecipientId]);

  const selectedUser = (users || []).find((u) => u.id === selectedUserId);
  const threadMessages = selectedUserId && currentUser?.id ? safeGetDirectMessages(currentUser.id, selectedUserId) : [];

  // Auto-start call if requested
  useEffect(() => {
    if (autoStartCall && selectedUserId) {
      handleStartVideoCall();
    }
  }, [autoStartCall, selectedUserId]);

  const [activeCallStream, setActiveCallStream] = useState<MediaStream | null>(null);
  const [callCameraNotice, setCallCameraNotice] = useState<string | null>(null);
  const [isCallSpeaking, setIsCallSpeaking] = useState<boolean>(false);

  const requestCallMedia = useCallback(async () => {
    try {
      const { stream, isSimulated, error } = await mediaService.startCameraAndMic(
        true,
        isVideoOn,
        isMicOn
      );
      setActiveCallStream(stream);
      mediaService.toggleVideo(isVideoOn);
      mediaService.toggleAudio(isMicOn);

      if (error) {
        setCallCameraNotice(error);
      } else if (isSimulated && isVideoOn) {
        setCallCameraNotice('Camera preview active');
      } else {
        setCallCameraNotice(null);
      }
    } catch {
      setCallCameraNotice('Media stream failed');
    }
  }, [isVideoOn, isMicOn]);

  // Handle local call media stream and mic audio monitoring
  useEffect(() => {
    let stopAudioMonitor: (() => void) | null = null;

    if (showVideoCallModal && (isVideoOn || isMicOn)) {
      requestCallMedia();

      if (isMicOn) {
        stopAudioMonitor = mediaService.monitorAudioLevel((_, isSpeaking) => {
          setIsCallSpeaking(isSpeaking);
        });
      } else {
        setIsCallSpeaking(false);
      }
    } else {
      mediaService.stopCameraAndMic();
      setActiveCallStream(null);
      setCallCameraNotice(null);
      setIsCallSpeaking(false);
    }

    return () => {
      if (stopAudioMonitor) stopAudioMonitor();
    };
  }, [showVideoCallModal, isVideoOn, isMicOn, requestCallMedia]);

  // Call timer ticker
  useEffect(() => {
    let timer: any = null;
    if (showVideoCallModal) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showVideoCallModal]);

  const handleStartVideoCall = () => {
    if (!selectedUserId || !selectedUser) return;
    setShowVideoCallModal(true);
    setIsVideoOn(true);
    setIsMicOn(true);
    safeSendDirectMessage(selectedUserId, `📹 Started a 1-on-1 Video Call with @${selectedUser.username}`, 'text');
  };

  const handleEndVideoCall = () => {
    if (selectedUserId && selectedUser) {
      safeSendDirectMessage(
        selectedUserId,
        `📹 Ended 1-on-1 Video Call (Duration: ${formatTime(callDuration)})`,
        'text'
      );
    }
    setShowVideoCallModal(false);
    mediaService.stopCameraAndMic();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mark as read on view
  useEffect(() => {
    if (selectedUserId) {
      safeMarkAsRead(selectedUserId);
    }
  }, [selectedUserId, threadMessages.length, safeMarkAsRead]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length]);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setMobileShowChat(true);
  };

  const handleSendGif = (gifUrl: string) => {
    if (!selectedUserId) return;
    safeSendDirectMessage(selectedUserId, `[GIF] ${gifUrl}`, 'text');
    setShowGifPicker(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!selectedUserId) return;
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                safeSendDirectMessage(selectedUserId, `[GIF] ${result}`, 'text');
              }
            };
            reader.readAsDataURL(blob);
            e.preventDefault();
            return;
          }
        }
      }
    }
  };

  // Live Tenor GIF API Integration
  useEffect(() => {
    if (!showGifPicker) return;

    let active = true;
    setTenorLoading(true);

    const searchTerm = gifSearchQuery.trim() || (selectedGifCategory !== 'all' ? selectedGifCategory : 'trending study');
    const tenorKey = 'LIVDSRZULELA'; // Official Tenor public demo client key
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(searchTerm)}&key=${tenorKey}&client_key=studyverse_app&limit=24&media_filter=gif,tinygif`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          const parsed = data.results
            .map((item: any) => ({
              id: item.id,
              title: item.title || item.content_description || 'Tenor GIF',
              url: item.media_formats?.gif?.url || item.media_formats?.mediumgif?.url || item.media_formats?.tinygif?.url,
              previewUrl: item.media_formats?.tinygif?.url || item.media_formats?.gif?.url,
            }))
            .filter((g: any) => Boolean(g.url));
          setTenorGifs(parsed);
        } else {
          setTenorGifs([]);
        }
      })
      .catch((err) => {
        console.warn('Tenor API fetch fallback:', err);
        if (active) setTenorGifs([]);
      })
      .finally(() => {
        if (active) setTenorLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showGifPicker, gifSearchQuery, selectedGifCategory]);

  const displayGifs = tenorGifs.length > 0
    ? tenorGifs
    : POPULAR_GIFS.filter((gif) => {
        const matchesCategory = selectedGifCategory === 'all' || gif.category === selectedGifCategory;
        const matchesQuery = gif.title.toLowerCase().includes(gifSearchQuery.toLowerCase()) || gif.category.toLowerCase().includes(gifSearchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      }).map((g) => ({ id: g.id, title: g.title, url: g.url, previewUrl: g.url }));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed || !selectedUserId) return;

    // Detect if content is a direct GIF link
    const isDirectGifUrl = (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
      (trimmed.toLowerCase().includes('.gif') || trimmed.toLowerCase().includes('giphy.com') || trimmed.toLowerCase().includes('tenor.com'));

    if (isDirectGifUrl) {
      safeSendDirectMessage(selectedUserId, `[GIF] ${trimmed}`, 'text');
    } else {
      safeSendDirectMessage(selectedUserId, trimmed, 'text');
    }

    setMessageInput('');
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  };

  const handleSendRoomInvite = (roomId: string) => {
    if (!selectedUserId) return;
    const targetRoom = (rooms || []).find((r) => r.id === roomId);
    if (!targetRoom) return;

    safeSendDirectMessage(
      selectedUserId,
      `Hey! Join me in study room "${targetRoom.title}" (Code: ${targetRoom.code})`,
      'room_invite',
      { roomId: targetRoom.id, roomCode: targetRoom.code, roomTitle: targetRoom.title }
    );
    setShowInviteModal(false);
  };

  // Filter conversations list
  const filteredUsers = (otherUsers || []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div id="direct-messages-layout" className="max-w-7xl mx-auto h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] animate-fade-in text-slate-200 pb-16 md:pb-0">
      <div className="bg-[#171431] border border-[#26214A] rounded-2xl h-full flex overflow-hidden shadow-2xl">
        {/* Left Sidebar: Conversations Directory */}
        <aside
          className={`${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 lg:w-88 border-r border-[#26214A] bg-[#0D0B1D] flex-col shrink-0`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-[#26214A] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#A78BFA]" />
                <span>Direct Messages</span>
              </h2>
              <span className="text-[11px] font-semibold text-[#8E8AAB]">
                {otherUsers.length} Peers
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8E8AAB] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#171431] border border-[#26214A] rounded-xl text-xs text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1E1938]">
            {filteredUsers.map((user) => {
              const msgs = safeGetDirectMessages(currentUser.id, user.id);
              const lastMsg = msgs[msgs.length - 1];
              const unreadCount = msgs.filter((m) => m.senderId === user.id && !m.isRead).length;
              const isSelected = user.id === selectedUserId;

              return (
                <button
                  key={user.id}
                  id={`dm-thread-user-${user.id}`}
                  onClick={() => handleSelectUser(user.id)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition ${
                    isSelected
                      ? 'bg-[#6D28D9]/20 border-r-4 border-[#8B5CF6]'
                      : 'hover:bg-[#171431]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#352F64]"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#0D0B1D] ${
                        user.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {user.name}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-[#8E8AAB] shrink-0">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-[#8E8AAB] truncate max-w-[150px]">
                        {lastMsg ? lastMsg.content : `Start studying with @${user.username}`}
                      </p>
                      {unreadCount > 0 && (
                        <span className="bg-[#6D28D9] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Stage: Active Chat Thread */}
        {selectedUser ? (
          <main
            className={`${
              !mobileShowChat ? 'hidden md:flex' : 'flex'
            } flex-1 flex-col bg-[#131129] overflow-hidden`}
          >
            {/* Thread Header */}
            <div className="h-15 px-4 sm:px-6 border-b border-[#26214A] bg-[#171431] flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden p-1.5 rounded-xl bg-[#231F45] text-[#8E8AAB] hover:text-white"
                  title="Back to Conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-8 sm:w-9 h-8 sm:h-9 rounded-full object-cover ring-2 ring-[#6D28D9] cursor-pointer"
                    onClick={() => onNavigateProfile(selectedUser.username)}
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#171431] ${
                      selectedUser.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <button
                    onClick={() => onNavigateProfile(selectedUser.username)}
                    className="font-bold text-xs sm:text-sm text-white hover:text-[#A78BFA] transition block text-left truncate"
                  >
                    {selectedUser.name}
                  </button>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#8E8AAB] truncate">
                    <span className="text-[#A78BFA] font-medium">@{selectedUser.username}</span>
                    <span>•</span>
                    <span>{selectedUser.isOnline ? 'Active Now' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              {/* Actions: Video Call & Study Room Invite */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="start-video-call-btn"
                  onClick={handleStartVideoCall}
                  className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl border border-emerald-400/50 flex items-center gap-1 sm:gap-1.5 transition shadow-lg shadow-emerald-900/30"
                  title="Start 1-on-1 Video Call with Camera"
                >
                  <Video className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Video Call</span>
                  <span className="sm:hidden font-bold">Call</span>
                </button>

                <button
                  id="invite-to-room-thread-btn"
                  onClick={() => setShowInviteModal(true)}
                  className="px-2.5 sm:px-3 py-1.5 bg-[#6D28D9]/20 hover:bg-[#6D28D9]/30 text-white text-xs font-semibold rounded-xl border border-[#8B5CF6]/50 flex items-center gap-1 sm:gap-1.5 transition shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span className="hidden sm:inline">Invite to Room</span>
                  <span className="sm:hidden">Invite</span>
                </button>

                <button
                  onClick={() => onNavigateProfile(selectedUser.username)}
                  className="px-2.5 sm:px-3 py-1.5 bg-[#0D0B1D] hover:bg-[#231F45] text-[#8E8AAB] hover:text-white text-xs font-semibold rounded-xl transition"
                >
                  Profile
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {threadMessages.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#231F45] text-[#A78BFA] flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-sm">No messages yet</h3>
                  <p className="text-xs text-[#8E8AAB] max-w-sm mx-auto">
                    Say hello to {selectedUser.name}, discuss homework, or invite them to a live study sprint room!
                  </p>
                </div>
              ) : (
                threadMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isGif = msg.content.startsWith('[GIF]') || (msg.content.includes('giphy.com') && msg.content.includes('.gif'));
                  const gifUrl = isGif ? msg.content.replace('[GIF]', '').trim() : '';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className={`text-[10px] font-bold ${isMe ? 'text-[#A78BFA]' : 'text-[#8E8AAB]'}`}>
                          {isMe ? 'You' : selectedUser.name}
                        </span>
                        <span className="text-[10px] text-[#8E8AAB]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Render GIF Card */}
                      {isGif && gifUrl ? (
                        <div
                          className={`rounded-2xl overflow-hidden border border-[#2E2856] max-w-xs shadow-2xl bg-[#0D0B1D] ${
                            isMe ? 'rounded-tr-none border-[#8B5CF6]/50' : 'rounded-tl-none border-[#26214A]'
                          }`}
                        >
                          <div className="relative group">
                            <img src={gifUrl} alt="GIF" className="w-full h-auto max-h-56 object-cover" />
                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-black text-purple-300 flex items-center gap-1 border border-purple-500/30">
                              <Film className="w-3 h-3 text-purple-400" />
                              <span>GIF</span>
                            </div>
                          </div>
                        </div>
                      ) : msg.type === 'room_invite' && msg.actionData?.roomId ? (
                        /* Rich Room Invite */
                        <div
                          className={`p-4 rounded-2xl max-w-md space-y-2.5 border shadow-lg ${
                            isMe
                              ? 'bg-[#231F45] border-[#8B5CF6]/40 text-white rounded-tr-none'
                              : 'bg-[#171431] border-[#26214A] text-white rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-[#A78BFA] animate-pulse" />
                            <span className="font-bold text-xs text-white">
                              Study Room Invitation
                            </span>
                          </div>
                          <p className="text-xs text-[#8E8AAB]">{msg.content}</p>
                          <button
                            id={`join-room-from-dm-${msg.actionData.roomId}`}
                            onClick={() => onNavigateRoom(msg.actionData!.roomId!)}
                            className="w-full py-2 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-lg shadow-purple-900/40"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>Join Study Room</span>
                          </button>
                        </div>
                      ) : (
                        /* Standard Text Message */
                        <div
                          className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed shadow-md break-words ${
                            isMe
                              ? 'bg-[#6D28D9] text-white rounded-tr-none'
                              : 'bg-[#171431] border border-[#26214A] text-white rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Upgraded Composer & Native Keyboard Support Toolbar */}
            <div className="p-3 sm:p-4 bg-[#171431] border-t border-[#26214A] space-y-2 relative">
              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between gap-1.5 px-1">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {/* GIF Gallery Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowGifPicker(!showGifPicker);
                      setShowEmojiPicker(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
                      showGifPicker
                        ? 'bg-[#6D28D9] text-white border-[#8B5CF6]'
                        : 'bg-[#0D0B1D] text-[#A78BFA] border-[#2E2856] hover:bg-[#231F45] hover:text-white'
                    }`}
                    title="Open GIF Gallery"
                  >
                    <Film className="w-3.5 h-3.5 text-purple-400" />
                    <span>GIF</span>
                  </button>

                  {/* Emoji Picker Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowGifPicker(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
                      showEmojiPicker
                        ? 'bg-[#6D28D9] text-white border-[#8B5CF6]'
                        : 'bg-[#0D0B1D] text-[#A78BFA] border-[#2E2856] hover:bg-[#231F45] hover:text-white'
                    }`}
                    title="Insert Emojis"
                  >
                    <Smile className="w-3.5 h-3.5 text-amber-400" />
                    <span>Emoji</span>
                  </button>
                </div>

                <span className="text-[10px] text-[#8E8AAB] hidden sm:inline font-mono">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-[#0D0B1D] border border-[#2E2856] text-white">Enter</kbd> to send
                </span>
              </div>

              {/* GIF Picker Popover */}
              {showGifPicker && (
                <div className="absolute bottom-16 left-4 right-4 z-40 bg-[#0D0B1D] border border-[#8B5CF6]/50 rounded-2xl p-4 shadow-2xl space-y-3 animate-fade-in max-h-84 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-purple-400" />
                      <span className="font-extrabold text-xs text-white">GIF Gallery</span>
                    </div>
                    <button onClick={() => setShowGifPicker(false)} className="text-[#8E8AAB] hover:text-white text-xs cursor-pointer">
                      ✕
                    </button>
                  </div>

                  {/* Search and Category Tabs */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#8E8AAB] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={gifSearchQuery}
                        onChange={(e) => setGifSearchQuery(e.target.value)}
                        placeholder="Search GIFs (study, coffee, reactions, memes)..."
                        className="w-full pl-8 pr-3 py-1.5 bg-[#171431] border border-[#2E2856] rounded-xl text-xs text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] font-bold">
                      {['all', 'study', 'reactions', 'funny', 'coffee', 'celebration', 'memes', 'anime', 'goodluck', 'gaming'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedGifCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg capitalize transition cursor-pointer shrink-0 ${
                            selectedGifCategory === cat
                              ? 'bg-[#6D28D9] text-white'
                              : 'bg-[#171431] text-[#8E8AAB] hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GIFs Grid */}
                  <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pr-1 min-h-[140px]">
                    {tenorLoading ? (
                      <div className="col-span-full py-10 flex flex-col items-center justify-center space-y-2 text-xs text-[#8E8AAB]">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span>Fetching Tenor GIFs...</span>
                      </div>
                    ) : displayGifs.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-xs text-[#8E8AAB]">
                        No GIFs found matching "{gifSearchQuery}". Try pasting a direct GIF link!
                      </div>
                    ) : (
                      displayGifs.map((gif) => (
                        <button
                          key={gif.id}
                          type="button"
                          onClick={() => handleSendGif(gif.url)}
                          className="group relative rounded-xl overflow-hidden border border-[#26214A] hover:border-[#8B5CF6] transition focus:outline-none cursor-pointer bg-[#171431] h-24"
                        >
                          <img src={gif.previewUrl || gif.url} alt={gif.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white truncate">{gif.title}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="pt-1 text-[10px] text-[#8E8AAB] flex items-center justify-between border-t border-[#26214A]">
                    <span>💡 Tip: Paste any GIF link or image file directly</span>
                    <span className="font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                      Powered by Tenor
                    </span>
                  </div>
                </div>
              )}

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-4 z-40 shadow-2xl animate-fade-in rounded-2xl overflow-hidden border border-[#8B5CF6]/50 bg-[#0D0B1D]">
                  <div className="flex items-center justify-between px-3 py-2 bg-[#171431] border-b border-[#26214A]">
                    <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5 text-amber-400" /> Emoji Picker
                    </span>
                    <button onClick={() => setShowEmojiPicker(false)} className="text-[#8E8AAB] hover:text-white text-xs cursor-pointer">✕</button>
                  </div>
                  <Picker
                    data={data}
                    onEmojiSelect={(emoji: any) => {
                      if (emoji?.native) {
                        setMessageInput((prev) => prev + emoji.native);
                      }
                    }}
                    theme="dark"
                    previewPosition="none"
                    skinTonePosition="none"
                    navPosition="top"
                    perLine={8}
                  />
                </div>
              )}

              {/* Main Text Input Composer Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  id="dm-message-input"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onPaste={handlePaste}
                  enterKeyHint="send"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck={true}
                  placeholder={`Message @${selectedUser.username}... (Type, paste GIF links, or use keyboard)`}
                  className="flex-1 px-4 py-2.5 bg-[#0D0B1D] border border-[#2E2856] rounded-xl text-xs text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6] transition shadow-inner"
                />
                <button
                  type="submit"
                  id="dm-send-btn"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 bg-[#6D28D9] hover:bg-[#7C3AED] disabled:opacity-40 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-purple-900/40 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </main>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[#8E8AAB] text-xs">
            Select a peer from the left sidebar to start messaging.
          </div>
        )}
      </div>

      {/* Select Room to Invite Modal */}
      {showInviteModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#171431] border border-[#2E2856] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#26214A]">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#A78BFA]" />
                <span>Invite {selectedUser.name} to Study Room</span>
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-[#8E8AAB] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8E8AAB]">
              Choose an active study room to send an instant join invitation card directly into this chat:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-3 rounded-xl bg-[#0D0B1D] border border-[#26214A] flex items-center justify-between gap-3 hover:border-[#8B5CF6] transition"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{room.title}</h4>
                    <span className="text-[10px] text-[#A78BFA] font-semibold">{room.subject}</span>
                    <span className="text-[10px] text-[#8E8AAB] ml-2">Code: {room.code}</span>
                  </div>

                  <button
                    onClick={() => handleSendRoomInvite(room.id)}
                    className="px-3 py-1.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold transition shadow-md"
                  >
                    Send Invite
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1-on-1 Direct Video Call Overlay Modal */}
      {showVideoCallModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#0D0B1D]/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in text-slate-200">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between bg-[#171431]/90 border border-[#2E2856] rounded-2xl px-5 py-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#171431] animate-ping" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{selectedUser.name}</h3>
                  <span className="text-xs text-[#A78BFA] font-medium">@{selectedUser.username}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>1-on-1 Direct Video Call</span>
                  <span className="text-[#8E8AAB]">({formatTime(callDuration)})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (rooms.length > 0) {
                    onNavigateRoom(rooms[0].id);
                    handleEndVideoCall();
                  }
                }}
                className="px-3 py-1.5 bg-[#6D28D9] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40"
              >
                <Radio className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="hidden sm:inline">Convert to Study Room</span>
                <span className="sm:hidden">Study Room</span>
              </button>

              <button
                onClick={handleEndVideoCall}
                className="p-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-100 rounded-xl border border-rose-500/40 transition"
                title="End Video Call"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Call Stage Grid */}
          <div className="flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0 relative">
            {/* Peer Video Stream Tile */}
            <div className="relative rounded-2xl overflow-hidden bg-[#171431] border border-[#2E2856] flex flex-col items-center justify-center shadow-2xl group">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Speaking Audio Wave Visualizer */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{selectedUser.name}</span>
                </div>

                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-white/10">
                  <div className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>

            {/* Local User Camera Stream Tile */}
            <div className="relative rounded-2xl overflow-hidden bg-[#171431] border border-[#2E2856] flex flex-col items-center justify-center shadow-2xl">
              {isVideoOn ? (
                <div className="relative w-full h-full">
                  <LocalCameraStreamView stream={activeCallStream} />
                  {callCameraNotice && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/50 text-xs text-amber-300 flex items-center gap-2">
                      <span>{callCameraNotice}</span>
                      <button
                        type="button"
                        onClick={requestCallMedia}
                        className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#231F45] border border-[#352F64] flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-[#8E8AAB]" />
                  </div>
                  <span className="text-xs font-bold text-white">Your Camera is Off</span>
                  <p className="text-[11px] text-[#8E8AAB]">Click the camera button below to turn on your webcam.</p>
                </div>
              )}

              {/* Local Tile Overlay Badge */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 z-10">
                <span className={`w-2 h-2 rounded-full ${isMicOn ? (isCallSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500') : 'bg-rose-500'}`} />
                <span className="text-xs font-bold text-white">You {isMicOn ? (isCallSpeaking ? '(Speaking...)' : '(Mic On)') : '(Muted)'}</span>
                {isMicOn && isCallSpeaking && (
                  <div className="flex items-center gap-0.5 ml-1">
                    <div className="w-0.5 h-2.5 bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-0.5 h-3.5 bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-0.5 h-2 bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="bg-[#171431]/90 border border-[#2E2856] rounded-2xl p-4 flex items-center justify-center gap-3 sm:gap-4 shadow-2xl backdrop-blur-md max-w-xl mx-auto w-full">
            {/* Camera Toggle Button */}
            <button
              id="dm-call-toggle-camera-btn"
              onClick={() => setIsVideoOn((prev) => !prev)}
              className={`p-3.5 rounded-2xl transition flex items-center justify-center font-bold text-xs ${
                isVideoOn
                  ? 'bg-[#6D28D9] hover:bg-[#7C3AED] text-white shadow-lg shadow-purple-900/40'
                  : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
              }`}
              title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Mic Toggle Button */}
            <button
              id="dm-call-toggle-mic-btn"
              onClick={() => setIsMicOn((prev) => !prev)}
              className={`p-3.5 rounded-2xl transition flex items-center justify-center font-bold text-xs ${
                isMicOn
                  ? 'bg-[#231F45] hover:bg-[#352F64] text-white border border-[#2E2856]'
                  : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Screen Share Button */}
            <button
              id="dm-call-toggle-screenshare-btn"
              onClick={async () => {
                if (isScreenSharingActive) {
                  stopScreenShare();
                } else {
                  await startScreenShare();
                }
              }}
              className={`p-3.5 rounded-2xl transition flex items-center justify-center font-bold text-xs ${
                isScreenSharingActive
                  ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-900/40 ring-2 ring-amber-300'
                  : 'bg-[#231F45] hover:bg-[#352F64] text-[#A78BFA] border border-[#2E2856]'
              }`}
              title={isScreenSharingActive ? 'Stop Screen Share' : 'Share Screen'}
            >
              <Laptop className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              id="dm-call-end-call-btn"
              onClick={handleEndVideoCall}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl flex items-center gap-2 transition shadow-lg shadow-rose-900/50"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
