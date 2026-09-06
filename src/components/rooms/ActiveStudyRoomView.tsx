import React, { useState, useEffect, useRef } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mediaService } from '../../services/mediaService';
import { ambientAudioService, AmbientSoundType } from '../../services/ambientAudioService';
import { SCENIC_ROOM_BACKGROUNDS, AUDIO_TRACKS, RoomBackgroundScene } from '../../data/roomThemes';
import { RoomWhiteboard } from './RoomWhiteboard';
import { RoomColorPaletteModal, RoomPaletteSettings, ROOM_PALETTE_PRESETS } from './RoomColorPaletteModal';
import { DraggableVideoStage } from './DraggableVideoStage';
import { EditProfileModal } from '../profile/EditProfileModal';
import { UserProfileHoverCard } from '../common/UserProfileHoverCard';
import { RoomBackgroundMusicModal, CURATED_SONG_PLAYLIST, SongTrack } from './RoomBackgroundMusicModal';
import {
  RoomClockCustomizerModal,
  ClockSettings,
  DEFAULT_CLOCK_SETTINGS,
} from './RoomClockCustomizerModal';
import { RoomSettingsCustomizerModal } from './RoomSettingsCustomizerModal';
import { RoomParticipantsManagerModal } from './RoomParticipantsManagerModal';
import { RoomParticipant, RoomParticipantRole } from '../../types';
import {
  ArrowLeft,
  Settings,
  Plus,
  Copy,
  Check,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Music,
  Image as ImageIcon,
  Palette,
  Play,
  Pause,
  Square,
  ChevronDown,
  ChevronUp,
  Smile,
  Film,
  Search,
  Send,
  MoreVertical,
  X,
  Globe,
  Lock,
  Users,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  Edit3,
  Trash2,
  Clock,
  ListTodo,
  MessageSquare,
  Sliders,
  Layers,
  Crown,
  Key,
  User,
  Shield,
  Timer,
  Zap,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ActiveStudyRoomViewProps {
  onLeaveRoom: () => void;
  onNavigateProfile: (username: string) => void;
  onNavigateDirectMessage?: (userId: string) => void;
}

export const ActiveStudyRoomView: React.FC<ActiveStudyRoomViewProps> = ({
  onLeaveRoom,
  onNavigateProfile,
  onNavigateDirectMessage,
}) => {
  const { currentUser, users } = useAuth();
  const {
    activeRoom,
    leaveRoom,
    deleteRoom,
    updateRoomTimer,
    roomMessages,
    sendRoomMessage,
    getFriends,
    inviteFriendToRoom,
    updateRoomSettings,
    updateParticipantRole,
    kickParticipant,
    remoteMuteParticipant,
    startScreenShare,
    stopScreenShare,
    localScreenStream,
    isScreenSharingActive,
    rtcConnectionState,
    reconnectAttemptCount,
    triggerWebRTCReconnect,
  } = useApp();

  const friends = typeof getFriends === 'function' ? getFriends(currentUser?.id || '') || [] : [];

  const activeRoomMessages = React.useMemo(() => {
    if (!activeRoom?.id) return [];
    if (Array.isArray(roomMessages)) return roomMessages;
    if (roomMessages && typeof roomMessages === 'object' && activeRoom.id in roomMessages) {
      const list = (roomMessages as Record<string, any[]>)[activeRoom.id];
      return Array.isArray(list) ? list : [];
    }
    return [];
  }, [roomMessages, activeRoom?.id]);

  // Active Background Scene
  const [currentScene, setCurrentScene] = useState<RoomBackgroundScene>(
    SCENIC_ROOM_BACKGROUNDS[0] // Japanese Hills at Dusk
  );

  // Room Color Palette State with persistence
  const [roomPalette, setRoomPalette] = useState<RoomPaletteSettings>(() => {
    try {
      const key = `studyspace_room_palette_${activeRoom?.id || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ROOM_PALETTE_PRESETS[0];
  });

  useEffect(() => {
    try {
      const key = `studyspace_room_palette_${activeRoom?.id || 'default'}`;
      localStorage.setItem(key, JSON.stringify(roomPalette));
    } catch {}
  }, [roomPalette, activeRoom?.id]);

  // Clock Customization & Timer Priority State
  const [clockSettings, setClockSettings] = useState<ClockSettings>(() => {
    try {
      const key = `studyspace_clock_settings_${activeRoom?.id || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CLOCK_SETTINGS;
  });

  useEffect(() => {
    try {
      const key = `studyspace_clock_settings_${activeRoom?.id || 'default'}`;
      localStorage.setItem(key, JSON.stringify(clockSettings));
    } catch {}
  }, [clockSettings, activeRoom?.id]);

  // Local real-world time
  const [localTimeStr, setLocalTimeStr] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLocalTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showClockModal, setShowClockModal] = useState(false);
  const [customTrack, setCustomTrack] = useState<SongTrack | null>(null);

  // Audio track & Ambient Sound
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [audioVolume, setAudioVolume] = useState(60);

  // Local Media State
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedBgCategory, setSelectedBgCategory] = useState<string>('Popular');
  const [copiedLink, setCopiedLink] = useState(false);

  // Mobile Active Panel Tab: 'none' | 'timer' | 'tasks' | 'chat' | 'whiteboard'
  const [mobileActivePanel, setMobileActivePanel] = useState<'none' | 'timer' | 'tasks' | 'chat'>('none');

  // Desktop Accordions Open State
  const [isTimerOpen, setIsTimerOpen] = useState(true);
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  // GROUP Timer State (50:00 pomodoro)
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(50 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // PERSONAL Timer State (Independent user pace)
  const [personalMode, setPersonalMode] = useState<'focus' | 'break'>('focus');
  const [personalTimeLeft, setPersonalTimeLeft] = useState<number>(
    clockSettings.personalWorkMinutes * 60
  );
  const [isPersonalTimerRunning, setIsPersonalTimerRunning] = useState(false);

  // Effective Timer Values based on Clock Priority
  const isPersonalPriority = clockSettings.priority === 'personal';
  const effectiveTimeLeft = isPersonalPriority ? personalTimeLeft : timeLeft;
  const effectiveTimerMode = isPersonalPriority ? personalMode : timerMode;
  const effectiveIsRunning = isPersonalPriority ? isPersonalTimerRunning : isTimerRunning;

  // Tasks State
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: 't1', text: 'Read Chapter 4 Notes', completed: false },
    { id: 't2', text: 'Review Flashcards', completed: true },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [selectedGifCategory, setSelectedGifCategory] = useState('study');
  const [tenorGifs, setTenorGifs] = useState<Array<{ id: string; url: string; previewUrl: string; title: string }>>([]);
  const [tenorLoading, setTenorLoading] = useState(false);
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch Tenor GIFs
  useEffect(() => {
    if (!showGifPicker) return;
    let isMounted = true;
    const fetchGifs = async () => {
      setTenorLoading(true);
      try {
        const query = gifSearchQuery.trim() || selectedGifCategory || 'study';
        const apiKey = 'LIVDSRZ4A1UT';
        const res = await fetch(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${apiKey}&limit=16&media_filter=gif`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.results) {
            const formatted = data.results.map((item: any) => ({
              id: item.id,
              url: item.media_formats?.gif?.url || item.media_formats?.tinygif?.url,
              previewUrl: item.media_formats?.tinygif?.url || item.media_formats?.gif?.url,
              title: item.title || 'GIF',
            }));
            setTenorGifs(formatted);
          }
        }
      } catch (err) {
        console.error('Failed to fetch Tenor GIFs:', err);
      } finally {
        if (isMounted) setTenorLoading(false);
      }
    };

    const timer = setTimeout(fetchGifs, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [showGifPicker, selectedGifCategory, gifSearchQuery]);

  // Room Access Settings state
  const [roomAccess, setRoomAccess] = useState<'public' | 'private' | 'locked'>('private');
  const [micRule, setMicRule] = useState<'Breaks Only' | 'Always Allowed' | 'Muted'>('Breaks Only');
  const [chatRule, setChatRule] = useState<'Breaks Only' | 'Always Allowed' | 'Disabled'>('Breaks Only');

  // Active Participants in room (fully dynamic, synced with activeRoom and role changes)
  const roomParticipants = React.useMemo(() => {
    const rawParticipants = activeRoom?.participants || [];
    const currentHostId = activeRoom?.hostId;

    const mapped = rawParticipants.map((p) => {
      const u = p.user || users.find((usr) => usr.id === p.userId) || currentUser;
      const isHost = Boolean(currentHostId && p.userId === currentHostId) || p.role === 'host';
      return {
        id: p.userId,
        name: u?.name || 'Study Member',
        username: u?.username || 'member',
        avatar:
          u?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isHost,
        role: (p.role || (isHost ? 'host' : 'member')) as RoomParticipantRole,
        isMuted: p.userId === currentUser?.id ? !isMicOn : !p.isAudioEnabled,
        isVideo: p.userId === currentUser?.id ? isVideoOn : p.isVideoEnabled,
        isSpeaking: p.isSpeaking,
      };
    });

    // Ensure current user is present if they are in the active room
    if (currentUser && !mapped.some((m) => m.id === currentUser.id)) {
      // Check if current user is supposed to be in this room
      const isInParticipants = activeRoom?.participants?.some((p) => p.userId === currentUser.id);
      if (isInParticipants || activeRoom?.hostId === currentUser.id) {
        const isHost = Boolean(currentHostId && currentHostId === currentUser.id);
        mapped.unshift({
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          avatar: currentUser.avatar,
          isHost,
          role: (isHost ? 'host' : 'member') as RoomParticipantRole,
          isMuted: !isMicOn,
          isVideo: isVideoOn,
          isSpeaking: false,
        });
      }
    }

    return mapped;
  }, [activeRoom, currentUser, users, isMicOn, isVideoOn]);

  const isHostOrCoHost = React.useMemo(() => {
    if (!activeRoom || !currentUser) return true;
    if (activeRoom.hostId === currentUser.id) return true;
    const myP = (activeRoom.participants || []).find((p) => p.userId === currentUser.id);
    return Boolean(myP?.isHost || myP?.role === 'host' || myP?.role === 'co-host');
  }, [activeRoom, currentUser]);

  // Leave room if current user was kicked out of activeRoom
  useEffect(() => {
    if (activeRoom && currentUser) {
      const isStillInRoom = activeRoom.participants?.some((p) => p.userId === currentUser.id);
      if (isStillInRoom === false && activeRoom.hostId !== currentUser.id) {
        onLeaveRoom();
      }
    }
  }, [activeRoom, currentUser, onLeaveRoom]);

  // Start initial audio on load
  useEffect(() => {
    ambientAudioService.playSound('lofi', audioVolume);
    return () => {
      ambientAudioService.stopSound();
    };
  }, []);

  // Web Audio Synth for Custom Clock Completion Sounds
  const playTimerAlertSound = (choice: string) => {
    if (choice === 'silent') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (choice === 'zen_gong') {
        // Warm Tibetan singing bowl resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.exponentialRampToValueAtTime(130.81, ctx.currentTime + 3.0);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 3.5);
      } else if (choice === 'digital_beep') {
        // Crisp dual beep
        [0, 0.15, 0.3].forEach((t) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime + t);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + t + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.12);
        });
      } else {
        // Soft Crystal Chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      }
    } catch {}
  };

  // Group Timer Interval Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playTimerAlertSound(clockSettings.alertSound);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, clockSettings.alertSound]);

  // Personal Timer Interval Effect
  useEffect(() => {
    let interval: any = null;
    if (isPersonalTimerRunning && personalTimeLeft > 0) {
      interval = setInterval(() => {
        setPersonalTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (personalTimeLeft === 0 && isPersonalTimerRunning) {
      setIsPersonalTimerRunning(false);
      playTimerAlertSound(clockSettings.alertSound);
      if (clockSettings.autoStartBreaks) {
        if (personalMode === 'focus') {
          setPersonalMode('break');
          setPersonalTimeLeft(clockSettings.personalBreakMinutes * 60);
          setIsPersonalTimerRunning(true);
        } else {
          setPersonalMode('focus');
          setPersonalTimeLeft(clockSettings.personalWorkMinutes * 60);
          setIsPersonalTimerRunning(true);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isPersonalTimerRunning, personalTimeLeft, personalMode, clockSettings]);

  // Unified Toggle Timer Handler
  const toggleTimer = () => {
    if (isPersonalPriority) {
      setIsPersonalTimerRunning(!isPersonalTimerRunning);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  // Unified Reset Timer Handler
  const resetTimer = (mode: 'focus' | 'break') => {
    if (isPersonalPriority) {
      setPersonalMode(mode);
      setPersonalTimeLeft(
        mode === 'focus'
          ? clockSettings.personalWorkMinutes * 60
          : clockSettings.personalBreakMinutes * 60
      );
      setIsPersonalTimerRunning(false);
    } else {
      setTimerMode(mode);
      setTimeLeft(mode === 'focus' ? 50 * 60 : 10 * 60);
      setIsTimerRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      ambientAudioService.stopSound();
      setIsPlayingAudio(false);
    } else {
      if (customTrack && currentTrackIndex >= CURATED_SONG_PLAYLIST.length) {
        if (customTrack.customUrl) {
          ambientAudioService.playCustomAudio(customTrack.customUrl, audioVolume);
        } else {
          ambientAudioService.playSound(customTrack.soundType, audioVolume);
        }
      } else {
        const track = CURATED_SONG_PLAYLIST[currentTrackIndex] || CURATED_SONG_PLAYLIST[0];
        ambientAudioService.playSound((track?.soundType as AmbientSoundType) || 'lofi', audioVolume);
      }
      setIsPlayingAudio(true);
    }
  };

  const handleSelectSongTrack = (index: number) => {
    setCurrentTrackIndex(index);
    const allTracks = [...CURATED_SONG_PLAYLIST, ...(customTrack ? [customTrack] : [])];
    const selected = allTracks[index] || CURATED_SONG_PLAYLIST[0];

    if (selected.customUrl) {
      ambientAudioService.playCustomAudio(selected.customUrl, audioVolume);
    } else {
      ambientAudioService.playSound((selected.soundType as AmbientSoundType) || 'lofi', audioVolume);
    }
    setIsPlayingAudio(true);
  };

  const handleSelectScene = (scene: RoomBackgroundScene) => {
    setCurrentScene(scene);
    setShowBackgroundModal(false);
    // Clear custom background so preset shows
    setRoomPalette((prev) => ({ ...prev, customBgUrl: '' }));
    if (isPlayingAudio) {
      ambientAudioService.playSound((scene.ambientSound as AmbientSoundType) || 'lofi', audioVolume);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTaskInput.trim(), completed: false }]);
    setNewTaskInput('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRoom?.id) return;
    sendRoomMessage(activeRoom.id, chatInput.trim());
    setChatInput('');
    setShowEmojiPicker(false);
  };

  const handleCopyRoomLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const initials = (currentUser?.name || 'DI')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  const bgCategories = [
    'Popular',
    'Lofi',
    'Pixel Art',
    'Aesthetic',
    'Cozy',
    'Nature',
    'Cities',
    'Space',
    '#StudyWithMe',
    'Fantasy',
  ];

  const filteredScenes = SCENIC_ROOM_BACKGROUNDS.filter(
    (scene) => selectedBgCategory === 'Popular' || scene.category === selectedBgCategory
  );

  const effectiveAccent = roomPalette.primaryColor || '#8B5CF6';
  const effectiveSecondary = roomPalette.secondaryColor || '#6D28D9';
  const effectiveBgImage = roomPalette.customBgUrl || currentScene.imageUrl;

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden select-none bg-[#0D0B1D] font-sans"
      style={
        {
          '--room-primary': effectiveAccent,
          '--room-secondary': effectiveSecondary,
          '--room-accent': effectiveAccent,
          '--room-glow': roomPalette.accentGlow || `${effectiveAccent}66`,
          '--room-backdrop-tint': roomPalette.backdropTint || '#131129',
          '--room-bubble-bg': roomPalette.bubbleBg || '#1C1938',
        } as React.CSSProperties
      }
    >
      {/* 1. SCENIC LIVE FULLSCREEN BACKGROUND LAYER (With custom image, blur, and scale support) */}
      <img
        src={effectiveBgImage}
        alt={currentScene.name}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 pointer-events-none"
        style={{
          filter: roomPalette.bgBlur ? `blur(${roomPalette.bgBlur}px)` : undefined,
          transform: roomPalette.bgBlur ? 'scale(1.05)' : undefined,
        }}
      />

      {/* 1b. DYNAMIC COLOR PALETTE ATMOSPHERIC TINT OVERLAY */}
      <div
        className="absolute inset-0 transition-all duration-500 pointer-events-none"
        style={{
          backgroundColor: roomPalette.backdropTint || '#131129',
          opacity: (roomPalette.tintOpacity ?? 35) / 100,
          mixBlendMode: 'multiply',
        }}
      />

      {/* 1c. Custom Background Dimming Layer */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: (roomPalette.bgDim ?? 25) / 100,
        }}
      />

      {/* 2. TOP CENTER FLOATING PILL BAR (Mobile & Desktop Responsive Alignment) */}
      <div className="absolute top-2 sm:top-4 inset-x-0 z-30 flex items-center justify-between sm:justify-center px-2 sm:px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-3 bg-[#131129]/90 backdrop-blur-md border border-[#2E2856]/80 px-2 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-2xl max-w-full overflow-x-auto scrollbar-none">
          {/* Back Return Button */}
          <button
            onClick={onLeaveRoom}
            className="w-7 sm:w-8 h-7 sm:h-8 rounded-xl bg-[#231F45]/80 hover:bg-[#352F64] text-white flex items-center justify-center transition shadow-xs shrink-0"
            title="Leave Room"
          >
            <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Room Title with Settings Gear Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-white hover:text-[#A78BFA] transition px-1.5 sm:px-2 py-1 rounded-lg hover:bg-[#231F45]/50 min-w-0"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8E8AAB] shrink-0" />
            <span className="truncate max-w-[95px] sm:max-w-xs">
              {activeRoom?.title || currentScene.name}
            </span>
          </button>

          {/* Dynamic Room Access Badge (Public vs Private PIN Protected with Quick Toggle) */}
          <button
            onClick={() => {
              if (isHostOrCoHost && activeRoom) {
                const nextIsPrivate = !activeRoom.isPrivate;
                updateRoomSettings(activeRoom.id, {
                  isPrivate: nextIsPrivate,
                  passcode: nextIsPrivate ? activeRoom.passcode || '1234' : undefined,
                  rules: {
                    ...(activeRoom.rules || {
                      micRule: 'always_allowed',
                      cameraRule: 'optional',
                      chatRule: 'free_chat',
                      screenShareRule: 'anyone',
                      autoMuteOnJoin: false,
                    }),
                    accessType: nextIsPrivate ? 'private_passcode' : 'public',
                  },
                });
              } else {
                setShowSettingsModal(true);
              }
            }}
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition hover:scale-105 cursor-pointer ${
              activeRoom?.isPrivate
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
            title={isHostOrCoHost ? "Click to toggle Public <-> Private PIN Access instantly" : "Room Access Setting & Passcode Policies"}
          >
            {activeRoom?.isPrivate ? (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Private PIN</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Public Room</span>
              </>
            )}
          </button>

          {/* Palette indicator badge */}
          <button
            onClick={() => setShowPaletteModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#1C1938] border border-[#2E2856] hover:border-[#8B5CF6] text-xs font-semibold text-slate-200 transition"
            title="Edit Room Color Palette & Wallpaper"
          >
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/30"
              style={{ backgroundColor: effectiveAccent }}
            />
            <span className="text-[11px] text-[#A78BFA]">{roomPalette.name}</span>
          </button>

          {/* Participants Pill with Hover Previews */}
          <button
            onClick={() => setShowParticipantsModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#231F45]/80 hover:bg-[#352F64] text-xs font-bold text-slate-200 transition shrink-0"
            title="View In-Room Participants"
          >
            <Users className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>{roomParticipants.length}</span>
          </button>

          {/* Vibrant '+ Add' Pill Button */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 sm:gap-1.5 transition shadow-lg shrink-0 hover:scale-105"
            style={{ backgroundColor: effectiveAccent }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Invite</span>
          </button>
        </div>
      </div>

      {/* 3. LEFT FLOATING DOCK */}
      <div className="absolute left-2 sm:left-4 top-14 sm:top-4 bottom-20 sm:bottom-4 z-30 flex flex-col justify-between pointer-events-none">
        {/* Top: Current User & Participant Avatars with Dynamic Role Badges */}
        <div className="pointer-events-auto flex flex-col items-center gap-2 sm:gap-3">
          {(() => {
            const myParticipant = roomParticipants.find((p) => p.id === currentUser?.id);
            const isMyHost = Boolean(activeRoom?.hostId && activeRoom?.hostId === currentUser?.id) || myParticipant?.isHost || myParticipant?.role === 'host';
            const isMyCoHost = myParticipant?.role === 'co-host';

            return (
              <UserProfileHoverCard
                userId={currentUser?.id}
                username={currentUser?.username}
                onNavigateProfile={onNavigateProfile}
                onNavigateDirectMessage={onNavigateDirectMessage}
                isHost={isMyHost}
                isCoHost={isMyCoHost}
                role={myParticipant?.role}
                align="left"
              >
                <div
                  onClick={() => setShowEditProfileModal(true)}
                  className="relative group cursor-pointer"
                  title="Click to edit your profile"
                >
                  {/* Crown for host, Key for co-host */}
                  {isMyHost && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-amber-400 z-10" title="Lead Host">
                      <Crown className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow" />
                    </div>
                  )}
                  {!isMyHost && isMyCoHost && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-amber-300 z-10 bg-[#6D28D9] p-0.5 rounded-full border border-purple-400 shadow" title="Co-Host">
                      <Key className="w-3 h-3 text-amber-300" />
                    </div>
                  )}

                  {/* Circular Avatar */}
                  <div
                    className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-tr ${
                      isMyHost
                        ? 'from-amber-400 to-amber-200 text-[#0D0B1D]'
                        : isMyCoHost
                        ? 'from-purple-500 to-indigo-300 text-white'
                        : 'from-indigo-600 to-purple-500 text-white'
                    } font-extrabold text-xs sm:text-sm flex items-center justify-center ring-2 shadow-xl hover:scale-105 transition`}
                    style={{ ringColor: effectiveAccent }}
                  >
                    {initials}
                  </div>

                  {/* Mic Status Indicator Badge at bottom right */}
                  <div
                    className={`absolute bottom-0 right-0 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[9px] border-2 border-[#0D0B1D] ${
                      isMicOn ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  >
                    {isMicOn ? <Mic className="w-2.5 h-2.5" /> : <MicOff className="w-2.5 h-2.5" />}
                  </div>
                </div>
              </UserProfileHoverCard>
            );
          })()}

          {/* Other In-Room Participant Avatars with Hover Previews */}
          {roomParticipants.filter((p) => p.id !== currentUser?.id).slice(0, 3).map((p) => (
            <UserProfileHoverCard
              key={p.id}
              userId={p.id}
              username={p.username}
              onNavigateProfile={onNavigateProfile}
              onNavigateDirectMessage={onNavigateDirectMessage}
              onMentionInChat={(u) => setChatInput((prev) => `${prev}@${u} `)}
              isHost={p.isHost || p.role === 'host'}
              isCoHost={p.role === 'co-host'}
              role={p.role}
              align="left"
            >
              <div className="relative group cursor-pointer hover:scale-105 transition">
                {p.isHost || p.role === 'host' ? (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-400 z-10" title="Lead Host">
                    <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow" />
                  </div>
                ) : p.role === 'co-host' ? (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-300 z-10 bg-[#6D28D9] p-0.5 rounded-full border border-purple-400 shadow" title="Co-Host">
                    <Key className="w-2.5 h-2.5 text-amber-300" />
                  </div>
                ) : null}
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover ring-2 ring-[#2E2856] group-hover:ring-[#8B5CF6] shadow-md"
                />
                <div
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full flex items-center justify-center text-white text-[7px] border border-[#0D0B1D] ${
                    !p.isMuted ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                >
                  {!p.isMuted ? <Mic className="w-2 h-2" /> : <MicOff className="w-2 h-2" />}
                </div>
              </div>
            </UserProfileHoverCard>
          ))}
        </div>

        {/* Bottom: Whiteboard Toggle & Palette Shortcut */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <button
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className={`w-8 sm:w-10 h-8 sm:h-10 rounded-2xl backdrop-blur-md border flex items-center justify-center cursor-pointer transition shadow-lg hover:scale-110 ${
              showWhiteboard
                ? 'bg-[#6D28D9] text-white border-[#8B5CF6]'
                : 'bg-[#1C1938]/80 border-[#2E2856] text-[#A78BFA] hover:text-white'
            }`}
            title="Toggle Whiteboard"
          >
            <Edit3 className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          <button
            onClick={() => setShowPaletteModal(true)}
            className="w-8 sm:w-10 h-8 sm:h-10 rounded-2xl bg-[#1C1938]/80 backdrop-blur-md border border-[#2E2856] text-[#A78BFA] hover:text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition"
            title="Room Color Palette & Custom Wallpaper"
          >
            <Palette className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: effectiveAccent }} />
          </button>
        </div>
      </div>

      {/* 3b. DRAGGABLE MEMBER VIDEO STAGE CARD (Allows moving camera tiles anywhere on screen!) */}
      <DraggableVideoStage
        participants={roomParticipants}
        isLocalVideoOn={isVideoOn}
        isLocalMicOn={isMicOn}
        currentUserId={currentUser?.id}
        screenStream={localScreenStream}
        isScreenSharingActive={isScreenSharingActive}
        onStopScreenShare={stopScreenShare}
        rtcConnectionState={rtcConnectionState}
        reconnectAttemptCount={reconnectAttemptCount}
        onTriggerReconnect={triggerWebRTCReconnect}
        accentColor={effectiveAccent}
        isLead={!activeRoom || activeRoom.hostId === currentUser?.id}
        onNavigateProfile={onNavigateProfile}
        onNavigateDirectMessage={onNavigateDirectMessage}
        onMentionInChat={(u) => setChatInput((prev) => `${prev}@${u} `)}
        onUpdateRole={(userId, newRole) => {
          if (activeRoom?.id) {
            updateParticipantRole(activeRoom.id, userId, newRole);
          }
        }}
        onKickParticipant={(userId, reason) => {
          if (activeRoom?.id) {
            kickParticipant(activeRoom.id, userId, reason);
          }
        }}
        onRemoteMute={(userId, type) => {
          if (activeRoom?.id) {
            remoteMuteParticipant(activeRoom.id, userId, type);
          }
        }}
      />

      {/* 4. DESKTOP RIGHT SIDE ACCORDION WIDGETS DOCK (Hidden on mobile < md) */}
      <div
        className={`hidden md:flex absolute right-4 top-4 bottom-20 z-30 flex-col gap-3 overflow-y-auto pointer-events-auto scrollbar-none transition-all duration-300 ${
          isChatExpanded ? 'w-96 lg:w-[480px] xl:w-[560px]' : 'w-80 lg:w-96'
        }`}
      >
        {/* GROUP & PERSONAL TIMER ACCORDION */}
        <div className="bg-[#131129]/85 backdrop-blur-md border border-[#2E2856]/80 rounded-2xl p-4 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsTimerOpen(!isTimerOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#A78BFA] transition"
            >
              <span>{isPersonalPriority ? 'Personal Timer' : 'Room Pomodoro'}</span>
              {isTimerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowClockModal(true)}
                className="text-[#8E8AAB] hover:text-[#A78BFA] p-1 rounded-lg hover:bg-[#231F45] transition flex items-center gap-1 text-[11px]"
                title="Customize Clock Style, Sound & Priority"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold hidden lg:inline">Style</span>
              </button>
            </div>
          </div>

          {isTimerOpen && (
            <div className="space-y-4 pt-1">
              {/* Dynamic Visual Clock Face (Digital, Minimal, Ring, Flip, Analog) */}
              <div className="flex flex-col items-center justify-center gap-2">
                {/* Priority & Mode Tag */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setClockSettings((prev) => ({
                        ...prev,
                        priority: prev.priority === 'personal' ? 'group' : 'personal',
                      }));
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition hover:scale-105"
                    style={{
                      backgroundColor: isPersonalPriority ? `${effectiveAccent}25` : '#231F45',
                      borderColor: isPersonalPriority ? effectiveAccent : '#352F64',
                      color: isPersonalPriority ? effectiveAccent : '#A78BFA',
                    }}
                    title="Click to toggle Personal vs Room Timer Priority"
                  >
                    {isPersonalPriority ? (
                      <>
                        <User className="w-3 h-3" />
                        <span>👤 Personal Mode</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3" />
                        <span>👥 Room Synced</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E8AAB]">
                    {effectiveTimerMode === 'focus' ? '🎯 Focus' : '☕ Break'}
                  </span>
                </div>

                {/* Clock Face Styles */}
                {clockSettings.style === 'ring' ? (
                  <div className="relative flex items-center justify-center my-1">
                    <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke="#231F45"
                        strokeWidth="7"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        stroke={effectiveAccent}
                        strokeWidth="7"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={
                          2 *
                          Math.PI *
                          50 *
                          (1 -
                            Math.max(
                              0,
                              Math.min(
                                1,
                                effectiveTimeLeft /
                                  (effectiveTimerMode === 'focus'
                                    ? isPersonalPriority
                                      ? clockSettings.personalWorkMinutes * 60
                                      : 50 * 60
                                    : isPersonalPriority
                                    ? clockSettings.personalBreakMinutes * 60
                                    : 10 * 60)
                              )
                            ))
                        }
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="font-mono text-3xl font-black tracking-tight drop-shadow-md"
                        style={{ color: roomPalette.timerGlow ? effectiveAccent : '#FFFFFF' }}
                      >
                        {formatTime(effectiveTimeLeft)}
                      </span>
                    </div>
                  </div>
                ) : clockSettings.style === 'flip' ? (
                  <div className="flex items-center gap-1.5 my-1">
                    <div className="bg-[#171431] border border-[#2E2856] rounded-xl px-3 py-2 text-center shadow-lg relative overflow-hidden">
                      <span className="font-mono text-3xl font-black text-white">
                        {Math.floor(effectiveTimeLeft / 60)
                          .toString()
                          .padStart(2, '0')}
                      </span>
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/40" />
                    </div>
                    <span className="text-xl font-bold font-mono text-[#8E8AAB] animate-pulse">:</span>
                    <div className="bg-[#171431] border border-[#2E2856] rounded-xl px-3 py-2 text-center shadow-lg relative overflow-hidden">
                      <span
                        className="font-mono text-3xl font-black"
                        style={{ color: effectiveAccent }}
                      >
                        {(effectiveTimeLeft % 60).toString().padStart(2, '0')}
                      </span>
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/40" />
                    </div>
                  </div>
                ) : clockSettings.style === 'minimal' ? (
                  <div className="py-2 text-center">
                    <div
                      className="font-mono text-4xl sm:text-5xl font-light tracking-widest transition-colors"
                      style={{ color: roomPalette.timerGlow ? effectiveAccent : '#FFFFFF' }}
                    >
                      {formatTime(effectiveTimeLeft)}
                    </div>
                  </div>
                ) : clockSettings.style === 'analog' ? (
                  <div className="relative w-28 h-28 rounded-full bg-[#171431] border-2 border-[#2E2856] flex items-center justify-center shadow-inner my-1">
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                      <div
                        key={deg}
                        className="absolute w-1 h-1.5 bg-[#4A4375] rounded-full"
                        style={{
                          transform: `rotate(${deg}deg) translateY(-46px)`,
                        }}
                      />
                    ))}
                    <div
                      className="absolute w-0.5 h-10 origin-bottom rounded-full"
                      style={{
                        backgroundColor: effectiveAccent,
                        bottom: '50%',
                        transform: `rotate(${((effectiveTimeLeft % 60) / 60) * 360}deg)`,
                        transition: 'transform 0.5s cubic-bezier(0.4, 2, 0.5, 1)',
                      }}
                    />
                    <div className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-[#8B5CF6] z-10" />
                    <span className="absolute bottom-2 font-mono text-[10px] font-bold text-white/90">
                      {formatTime(effectiveTimeLeft)}
                    </span>
                  </div>
                ) : (
                  <div
                    className="text-center font-mono text-4xl sm:text-5xl font-black tracking-widest drop-shadow-md transition-colors py-1"
                    style={{ color: roomPalette.timerGlow ? effectiveAccent : '#FFFFFF' }}
                  >
                    {formatTime(effectiveTimeLeft)}
                  </div>
                )}

                {clockSettings.showLocalTime && (
                  <div className="flex items-center gap-1 text-[10px] text-[#8E8AAB] font-mono bg-[#0D0B1D]/60 px-2 py-0.5 rounded-md border border-[#231F45]">
                    <Clock className="w-2.5 h-2.5 text-[#A78BFA]" />
                    <span>Local Time: {localTimeStr}</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => resetTimer(effectiveTimerMode)}
                  className="w-9 h-9 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
                  title="Reset Timer"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={toggleTimer}
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center transition shadow-lg hover:scale-105"
                  style={{ backgroundColor: effectiveAccent }}
                  title={effectiveIsRunning ? 'Pause' : 'Start'}
                >
                  {effectiveIsRunning ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Mode Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => resetTimer('focus')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                    effectiveTimerMode === 'focus'
                      ? 'border text-white'
                      : 'bg-[#231F45]/50 border border-[#352F64] text-[#8E8AAB] hover:text-white'
                  }`}
                  style={
                    effectiveTimerMode === 'focus'
                      ? {
                          backgroundColor: `${effectiveAccent}33`,
                          borderColor: effectiveAccent,
                        }
                      : {}
                  }
                >
                  <span>🎂 Focus mode</span>
                </button>

                <button
                  onClick={() => resetTimer('break')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                    effectiveTimerMode === 'break'
                      ? 'border text-white'
                      : 'bg-[#231F45]/50 border border-[#352F64] text-[#8E8AAB] hover:text-white'
                  }`}
                  style={
                    effectiveTimerMode === 'break'
                      ? {
                          backgroundColor: `${effectiveAccent}33`,
                          borderColor: effectiveAccent,
                        }
                      : {}
                  }
                >
                  <span>😎 Break mode</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MY TASKS ACCORDION */}
        <div className="bg-[#131129]/85 backdrop-blur-md border border-[#2E2856]/80 rounded-2xl p-4 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsTasksOpen(!isTasksOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#A78BFA] transition"
            >
              <span>My tasks</span>
              {isTasksOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                🟢 {completedTasksCount}/{tasks.length}
              </span>
            </div>
          </div>

          {isTasksOpen && (
            <div className="space-y-3 pt-1">
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {tasks.length === 0 ? (
                  <p className="text-[11px] text-[#8E8AAB] italic text-center py-2">No tasks added yet.</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#1C1938]/60 border border-[#2E2856] group hover:border-[#8B5CF6] transition"
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="flex items-center gap-2.5 min-w-0 text-left flex-1"
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-[#4A4375] hover:border-[#8B5CF6]'
                          }`}
                        >
                          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs truncate ${
                            task.completed ? 'line-through text-[#8E8AAB]' : 'text-slate-200'
                          }`}
                        >
                          {task.text}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 p-1 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddTask} className="relative">
                <input
                  type="text"
                  placeholder="+ Add new task"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  className="w-full bg-[#1C1938]/80 border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#8E8AAB] focus:outline-none"
                />
              </form>
            </div>
          )}
        </div>

        {/* CHAT ACCORDION WITH IN-ROOM HOVER PROFILES */}
        <div
          className={`bg-[#131129]/85 backdrop-blur-md border border-[#2E2856]/80 rounded-2xl p-4 text-white shadow-xl space-y-3 flex-1 flex flex-col justify-between transition-all duration-300 ${
            isChatExpanded ? 'min-h-[380px]' : 'min-h-[220px]'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#A78BFA] transition"
            >
              <span>Room Chat</span>
              {isChatOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8E8AAB] hidden sm:inline">
                {isChatExpanded ? 'Expanded View' : 'Hover for profile'}
              </span>
              <button
                type="button"
                onClick={() => setIsChatExpanded(!isChatExpanded)}
                className="text-[#8E8AAB] hover:text-[#A78BFA] px-2 py-0.5 rounded-lg bg-[#1C1938] border border-[#2E2856] hover:border-[#8B5CF6] transition flex items-center gap-1 text-[11px]"
                title={isChatExpanded ? 'Collapse Chat Width' : 'Expand Chat Section'}
              >
                {isChatExpanded ? (
                  <>
                    <Minimize2 className="w-3 h-3 text-[#A78BFA]" />
                    <span className="text-[10px] font-semibold text-slate-200">Standard</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3 text-[#A78BFA]" />
                    <span className="text-[10px] font-semibold text-[#A78BFA]">Expand</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isChatOpen && (
            <div className="flex-1 flex flex-col justify-between gap-2 overflow-hidden">
              {/* Message Feed */}
              <div
                className={`flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin transition-all duration-300 ${
                  isChatExpanded ? 'max-h-[360px] lg:max-h-[440px]' : 'max-h-48'
                }`}
              >
                <div className="text-center py-1">
                  <span className="text-[10px] text-[#8E8AAB] bg-[#231F45]/50 px-2 py-0.5 rounded-full">
                    Welcome to the room chat!
                  </span>
                </div>

                {activeRoomMessages.map((msg) => (
                  <div key={msg.id} className="space-y-0.5 group">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={msg.senderName}
                        onClick={() => onNavigateProfile(msg.senderUsername || msg.senderName)}
                        className="w-4 h-4 rounded-full object-cover cursor-pointer hover:opacity-80 transition shrink-0"
                        title={`View @${msg.senderUsername || msg.senderName}'s profile`}
                      />
                      <UserProfileHoverCard
                        userId={msg.senderId}
                        username={msg.senderUsername || msg.senderName}
                        onNavigateProfile={onNavigateProfile}
                        onNavigateDirectMessage={onNavigateDirectMessage}
                        onMentionInChat={(u) => setChatInput((prev) => `${prev}@${u} `)}
                        align="left"
                      >
                        <button
                          type="button"
                          onClick={() => onNavigateProfile(msg.senderUsername || msg.senderName)}
                          className="text-[11px] font-bold text-[#A78BFA] hover:text-white hover:underline cursor-pointer transition text-left"
                          title={`Click to view @${msg.senderUsername || msg.senderName}'s profile`}
                        >
                          {msg.senderName}
                        </button>
                      </UserProfileHoverCard>

                      <span className="text-[8px] text-[#8E8AAB]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {msg.content.startsWith('[GIF] ') ? (
                      <div className="pt-1">
                        <img
                          src={msg.content.replace('[GIF] ', '')}
                          alt="GIF"
                          className="rounded-xl max-h-48 max-w-full object-contain bg-black/40 border border-[#2E2856] shadow-md"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-200 bg-[#1C1938]/70 p-2 rounded-xl border border-[#2E2856]/50">
                        {msg.content}
                      </p>
                    )}
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Field */}
              <form onSubmit={handleSendMessage} className="relative pt-2">
                <input
                  type="text"
                  placeholder="Say something (@ to mention)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full bg-[#1C1938]/90 border border-[#2E2856] focus:border-[#8B5CF6] rounded-xl pl-3 pr-20 py-2 text-xs text-white placeholder-[#8E8AAB] focus:outline-none"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGifPicker(!showGifPicker);
                      setShowEmojiPicker(false);
                    }}
                    className={`p-1 transition ${showGifPicker ? 'text-[#A78BFA]' : 'text-[#8E8AAB] hover:text-white'}`}
                    title="Search GIFs on Tenor"
                  >
                    <Film className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowGifPicker(false);
                    }}
                    className={`p-1 transition ${showEmojiPicker ? 'text-[#A78BFA]' : 'text-[#8E8AAB] hover:text-white'}`}
                    title="Emoji Picker"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="submit"
                    className="w-6 h-6 rounded-lg text-white flex items-center justify-center transition"
                    style={{ backgroundColor: effectiveAccent }}
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>

                {/* Emoji Mart Picker Popover */}
                {showEmojiPicker && (
                  <div className="absolute bottom-11 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-[#2E2856]">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: any) => {
                        setChatInput((prev) => prev + (emoji.native || ''));
                        setShowEmojiPicker(false);
                      }}
                      theme="dark"
                      previewPosition="none"
                      skinTonePosition="none"
                    />
                  </div>
                )}

                {/* Tenor GIF Search Picker Popover */}
                {showGifPicker && (
                  <div className="absolute bottom-11 right-0 w-80 bg-[#171431] border border-[#2E2856] rounded-2xl p-3 shadow-2xl z-50 space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#26214A]">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-[#A78BFA]" />
                        <span>Search Tenor GIFs</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGifPicker(false)}
                        className="text-[#8E8AAB] hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#8E8AAB] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search GIFs (e.g. study, cat, high five)..."
                        value={gifSearchQuery}
                        onChange={(e) => setGifSearchQuery(e.target.value)}
                        className="w-full bg-[#0D0B1D] border border-[#2E2856] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8E8AAB] focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>

                    {/* Quick Category Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                      {['study', 'celebrate', 'focus', 'funny', 'coffee', 'anime'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedGifCategory(cat);
                            setGifSearchQuery('');
                          }}
                          className={`px-2 py-0.5 rounded-lg capitalize font-medium transition whitespace-nowrap ${
                            selectedGifCategory === cat && !gifSearchQuery
                              ? 'bg-[#6D28D9] text-white font-bold'
                              : 'bg-[#0D0B1D] text-[#8E8AAB] hover:text-white border border-[#2E2856]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* GIF Grid */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-[#0D0B1D] rounded-xl border border-[#26214A]">
                      {tenorLoading ? (
                        <div className="col-span-2 py-8 text-center text-xs text-[#8E8AAB] animate-pulse">
                          Loading Tenor GIFs...
                        </div>
                      ) : tenorGifs.length === 0 ? (
                        <div className="col-span-2 py-8 text-center text-xs text-[#8E8AAB]">
                          No GIFs found.
                        </div>
                      ) : (
                        tenorGifs.map((gif) => (
                          <button
                            key={gif.id}
                            type="button"
                            onClick={() => {
                              if (activeRoom && currentUser) {
                                sendRoomMessage(activeRoom.id, `[GIF] ${gif.url}`);
                                setShowGifPicker(false);
                              }
                            }}
                            className="group relative rounded-lg overflow-hidden border border-[#2E2856] hover:border-[#8B5CF6] transition bg-black/40 aspect-video cursor-pointer"
                          >
                            <img src={gif.previewUrl} alt={gif.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 4b. MOBILE FLOATING ACCORDION / SLIDE-UP DRAWER (For Mobile < md) */}
      {mobileActivePanel !== 'none' && (
        <div className="md:hidden fixed inset-x-0 bottom-20 z-40 bg-[#131129]/95 backdrop-blur-xl border-t border-[#2E2856] rounded-t-3xl p-4 shadow-2xl max-h-[65vh] overflow-y-auto animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#26214A] mb-3">
            <h4 className="font-extrabold text-sm text-white capitalize flex items-center gap-2">
              {mobileActivePanel === 'timer' && <Clock className="w-4 h-4 text-[#A78BFA]" />}
              {mobileActivePanel === 'tasks' && <ListTodo className="w-4 h-4 text-[#A78BFA]" />}
              {mobileActivePanel === 'chat' && <MessageSquare className="w-4 h-4 text-[#A78BFA]" />}
              <span>
                {mobileActivePanel === 'chat'
                  ? 'Room Chat (Tap username for profile)'
                  : `${mobileActivePanel} Widget`}
              </span>
            </h4>
            <button
              onClick={() => setMobileActivePanel('none')}
              className="w-7 h-7 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Panel Content */}
          {mobileActivePanel === 'timer' && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setClockSettings((prev) => ({
                      ...prev,
                      priority: prev.priority === 'personal' ? 'group' : 'personal',
                    }));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: isPersonalPriority ? `${effectiveAccent}25` : '#231F45',
                    borderColor: isPersonalPriority ? effectiveAccent : '#352F64',
                    color: isPersonalPriority ? effectiveAccent : '#A78BFA',
                  }}
                >
                  {isPersonalPriority ? '👤 Personal Priority' : '👥 Room Pomodoro'}
                </button>

                <button
                  onClick={() => {
                    setMobileActivePanel('none');
                    setShowClockModal(true);
                  }}
                  className="text-xs text-[#A78BFA] font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#231F45]"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Clock Style</span>
                </button>
              </div>

              <div
                className="text-center font-mono text-5xl font-black tracking-widest text-white drop-shadow-md"
                style={{ color: roomPalette.timerGlow ? effectiveAccent : '#FFFFFF' }}
              >
                {formatTime(effectiveTimeLeft)}
              </div>

              {clockSettings.showLocalTime && (
                <div className="text-center text-xs font-mono text-[#8E8AAB]">
                  Local Clock: {localTimeStr}
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => resetTimer(effectiveTimerMode)}
                  className="w-10 h-10 rounded-xl bg-[#231F45] text-white flex items-center justify-center"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={toggleTimer}
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: effectiveAccent }}
                >
                  {effectiveIsRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => resetTimer('focus')}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    effectiveTimerMode === 'focus' ? 'bg-[#6D28D9] text-white' : 'bg-[#231F45] text-[#8E8AAB]'
                  }`}
                >
                  🎂 Focus Mode
                </button>
                <button
                  onClick={() => resetTimer('break')}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    effectiveTimerMode === 'break' ? 'bg-[#6D28D9] text-white' : 'bg-[#231F45] text-[#8E8AAB]'
                  }`}
                >
                  😎 Break Mode
                </button>
              </div>
            </div>
          )}

          {mobileActivePanel === 'tasks' && (
            <div className="space-y-3 py-2">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#1C1938] border border-[#2E2856]"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#4A4375]'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span
                        className={`text-xs ${
                          task.completed ? 'line-through text-[#8E8AAB]' : 'text-slate-200'
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-rose-400 p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddTask} className="pt-2">
                <input
                  type="text"
                  placeholder="+ Add task..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  className="w-full bg-[#1C1938] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8AAB]"
                />
              </form>
            </div>
          )}

          {mobileActivePanel === 'chat' && (
            <div className="space-y-3 py-1 flex flex-col max-h-60">
              <div className="overflow-y-auto space-y-2 flex-1 max-h-40 pr-1">
                {activeRoomMessages.map((msg) => (
                  <div key={msg.id} className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={msg.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={msg.senderName}
                        onClick={() => {
                          setMobileActivePanel('none');
                          onNavigateProfile(msg.senderUsername || msg.senderName);
                        }}
                        className="w-4 h-4 rounded-full object-cover cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMobileActivePanel('none');
                          onNavigateProfile(msg.senderUsername || msg.senderName);
                        }}
                        className="text-[11px] font-bold text-[#A78BFA] hover:text-white underline cursor-pointer"
                      >
                        {msg.senderName}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 bg-[#1C1938] p-2 rounded-xl">{msg.content}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Chat message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-[#1C1938] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-white placeholder-[#8E8AAB]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold"
                  style={{ backgroundColor: effectiveAccent }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 5. FLOATING WHITEBOARD OVERLAY */}
      {showWhiteboard && (
        <div className="absolute inset-2 sm:inset-6 lg:inset-12 z-40 bg-[#131129]/95 backdrop-blur-xl border border-[#2E2856] rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-[#26214A] pb-2 mb-2">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#A78BFA]" />
              <span>Collaborative Study Whiteboard</span>
            </h3>
            <button onClick={() => setShowWhiteboard(false)} className="text-[#8E8AAB] hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <RoomWhiteboard isHost={true} />
          </div>
        </div>
      )}

      {/* 6. BOTTOM FLOATING TOOLBAR DOCK (Responsive for mobile & desktop) */}
      <div className="absolute bottom-2 sm:bottom-4 inset-x-0 z-30 flex items-center justify-center px-1 sm:px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2.5 bg-[#131129]/90 backdrop-blur-md border border-[#2E2856]/80 px-2 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-2xl max-w-[96vw] sm:max-w-full overflow-x-auto scrollbar-none">
          {/* Mobile Widget Quick Triggers (visible on mobile < md) */}
          <div className="flex md:hidden items-center gap-1 pr-1 border-r border-[#2E2856]">
            <button
              onClick={() => setMobileActivePanel(mobileActivePanel === 'timer' ? 'none' : 'timer')}
              className={`p-2 rounded-xl text-xs font-bold transition ${
                mobileActivePanel === 'timer' ? 'bg-[#6D28D9] text-white' : 'bg-[#231F45] text-[#8E8AAB]'
              }`}
              title="Timer"
            >
              <Clock className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileActivePanel(mobileActivePanel === 'tasks' ? 'none' : 'tasks')}
              className={`p-2 rounded-xl text-xs font-bold transition ${
                mobileActivePanel === 'tasks' ? 'bg-[#6D28D9] text-white' : 'bg-[#231F45] text-[#8E8AAB]'
              }`}
              title="Tasks"
            >
              <ListTodo className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileActivePanel(mobileActivePanel === 'chat' ? 'none' : 'chat')}
              className={`p-2 rounded-xl text-xs font-bold transition ${
                mobileActivePanel === 'chat' ? 'bg-[#6D28D9] text-white' : 'bg-[#231F45] text-[#8E8AAB]'
              }`}
              title="Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {/* Background Song & Music Track Pill */}
          <div className="flex items-center bg-[#231F45]/80 hover:bg-[#352F64] rounded-xl border border-[#352F64] shrink-0 overflow-hidden transition">
            <button
              onClick={() => setShowMusicModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-white group max-w-[110px] sm:max-w-xs"
              title="Open Background Song & Music Player"
            >
              <Music
                className={`w-3.5 h-3.5 ${isPlayingAudio ? 'text-[#A78BFA] animate-pulse' : 'text-[#8E8AAB]'}`}
              />
              <span className="truncate">
                {CURATED_SONG_PLAYLIST[currentTrackIndex]?.title || customTrack?.title || 'Lofi Beats 🌿'}
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAudio();
              }}
              className="px-2 py-1.5 hover:bg-[#433B7A] text-[#8E8AAB] hover:text-white transition border-l border-[#352F64]"
              title={isPlayingAudio ? 'Pause Background Music' : 'Play Background Music'}
            >
              {isPlayingAudio ? (
                <Volume2 className="w-3.5 h-3.5 text-[#10B981]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              )}
            </button>
          </div>

          {/* Wallpaper Scene Gallery Button */}
          <button
            onClick={() => setShowBackgroundModal(true)}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#231F45]/80 hover:bg-[#352F64] text-[#8E8AAB] hover:text-white flex items-center justify-center transition border border-[#352F64] shrink-0"
            title="Change Wallpaper & Soundscape"
          >
            <ImageIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Color Palette Modal Opener Button */}
          <button
            onClick={() => setShowPaletteModal(true)}
            className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#231F45]/80 hover:bg-[#352F64] text-white flex items-center justify-center transition border border-[#352F64] shrink-0 relative group"
            title="Edit Room Color Palette & Wallpaper"
          >
            <Palette className="w-3.5 sm:w-4 h-3.5 sm:h-4" style={{ color: effectiveAccent }} />
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#131129]"
              style={{ backgroundColor: effectiveAccent }}
            />
          </button>

          <div className="w-px h-5 bg-[#2E2856] shrink-0" />

          {/* Camera Button */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
              isVideoOn
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
            title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
          >
            {isVideoOn ? (
              <Video className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            ) : (
              <VideoOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            )}
          </button>

          {/* Mic Button */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
              isMicOn
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <MicOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={async () => {
              if (isScreenSharingActive) {
                stopScreenShare();
              } else {
                await startScreenShare();
              }
            }}
            className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center transition shrink-0 ${
              isScreenSharingActive
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-900/40 ring-2 ring-purple-400'
                : 'bg-[#231F45]/80 hover:bg-[#352F64] text-[#8E8AAB] hover:text-white border border-[#352F64]'
            }`}
            title={isScreenSharingActive ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            {isScreenSharingActive ? (
              <Monitor className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-300" />
            ) : (
              <MonitorOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 7. ROOM COLOR PALETTE MODAL (Live Dynamic Tuning & Custom Background Image) */}
      <RoomColorPaletteModal
        isOpen={showPaletteModal}
        onClose={() => setShowPaletteModal(false)}
        currentPalette={roomPalette}
        onApplyPalette={(newPalette) => setRoomPalette(newPalette)}
      />

      {/* 7b. IN-ROOM EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />

      {/* 8. ROOM PARTICIPANTS & ROLE MANAGEMENT MODAL */}
      <RoomParticipantsManagerModal
        isOpen={showParticipantsModal}
        onClose={() => setShowParticipantsModal(false)}
        participants={
          activeRoom?.participants && activeRoom.participants.length > 0
            ? activeRoom.participants
            : roomParticipants.map((p) => ({
                userId: p.id,
                user: users.find((u) => u.id === p.id) || ({
                  id: p.id,
                  name: p.name,
                  username: p.username,
                  avatar: p.avatar,
                  status: 'studying',
                } as any),
                role: p.role,
                joinedAt: Date.now() - 60000,
                isAudioEnabled: !p.isMuted,
                isVideoEnabled: p.isVideo,
                isScreenSharing: false,
                isSpeaking: p.isSpeaking || false,
                audioLevel: p.isSpeaking ? 60 : 0,
              }))
        }
        room={activeRoom || undefined}
        currentUserId={currentUser?.id || 'user_alex'}
        hostId={activeRoom?.hostId || currentUser?.id || 'user_alex'}
        onUpdateRole={(userId, newRole) => {
          return updateParticipantRole(activeRoom?.id || 'room_cs61a', userId, newRole);
        }}
        onKickParticipant={(userId, reason) => {
          return kickParticipant(activeRoom?.id || 'room_cs61a', userId, reason);
        }}
        onRemoteMute={(userId, muteType) => {
          remoteMuteParticipant(activeRoom?.id || 'room_cs61a', userId, muteType);
        }}
        onInviteFriends={() => {
          setShowParticipantsModal(false);
          setShowInviteModal(true);
        }}
        onNavigateProfile={onNavigateProfile}
        onNavigateDirectMessage={onNavigateDirectMessage}
      />

      {/* 9. ADVANCED ROOM SETTINGS & RULES CUSTOMIZER MODAL */}
      <RoomSettingsCustomizerModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        room={
          activeRoom || {
            id: 'room_cs61a',
            code: 'ROOM-6101',
            title: currentScene.name,
            subject: 'Focused Study',
            description: 'Virtual study space',
            tags: ['focus', 'pomodoro'],
            hostId: currentUser?.id || 'user_alex',
            hostName: currentUser?.name || 'Alex Rivera',
            hostAvatar: currentUser?.avatar || '',
            participantsCount: roomParticipants.length,
            maxParticipants: 12,
            isPrivate: false,
            rules: {
              micRule: 'always_allowed',
              cameraRule: 'optional',
              chatRule: 'free_chat',
              screenShareRule: 'anyone',
              accessType: 'public',
              autoMuteOnJoin: false,
            },
            participants: [],
            createdAt: Date.now(),
          }
        }
        isLead={
          !activeRoom ||
          activeRoom.hostId === currentUser?.id ||
          roomParticipants.some((p) => p.id === currentUser?.id && (p.isHost || p.role === 'host' || p.role === 'co-host')) ||
          currentUser?.id === 'user_alex'
        }
        onDeleteRoom={(roomId) => {
          deleteRoom(roomId);
          setShowSettingsModal(false);
          onLeaveRoom();
        }}
        onSave={(updates) => {
          updateRoomSettings(activeRoom?.id || 'room_cs61a', updates);
          if (updates.rules?.accessType) {
            setRoomAccess(updates.rules.accessType === 'public' ? 'public' : 'private');
          }
        }}
        onUpdateSettings={(updates) => {
          updateRoomSettings(activeRoom?.id || 'room_cs61a', updates);
          if (updates.rules?.accessType) {
            setRoomAccess(updates.rules.accessType === 'public' ? 'public' : 'private');
          }
        }}
        onOpenPaletteModal={() => {
          setShowSettingsModal(false);
          setShowPaletteModal(true);
        }}
        onOpenBackgroundModal={() => {
          setShowSettingsModal(false);
          setShowBackgroundModal(true);
        }}
      />

      {/* 9b. CLOCK CUSTOMIZATION & TIMER PRIORITY MODAL */}
      <RoomClockCustomizerModal
        isOpen={showClockModal}
        onClose={() => setShowClockModal(false)}
        settings={clockSettings}
        isLead={!activeRoom || activeRoom.hostId === currentUser?.id}
        groupTimeLeft={activeRoom?.timer?.timeLeft || 1500}
        groupMode={activeRoom?.timer?.mode || 'focus'}
        onSaveSettings={(newSettings) => {
          setClockSettings(newSettings);
          if (newSettings.priority === 'personal') {
            setPersonalTimeLeft(
              personalMode === 'focus'
                ? newSettings.personalWorkMinutes * 60
                : newSettings.personalBreakMinutes * 60
            );
          }
        }}
        onUpdateSettings={(newSettings) => {
          setClockSettings(newSettings);
          if (newSettings.priority === 'personal') {
            setPersonalTimeLeft(
              personalMode === 'focus'
                ? newSettings.personalWorkMinutes * 60
                : newSettings.personalBreakMinutes * 60
            );
          }
        }}
        onTriggerSoundTest={(sound) => playTimerAlertSound(sound)}
      />

      {/* 10. BACKGROUNDS GALLERY MODAL */}
      {showBackgroundModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#171431] border border-[#2E2856] rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#26214A]">
              <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#A78BFA]" />
                <span>Choose Study Wallpaper & Soundscape</span>
              </h3>
              <button
                onClick={() => setShowBackgroundModal(false)}
                className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-36 sm:w-48 bg-[#0D0B1D] border-r border-[#26214A] p-2 sm:p-3 space-y-1 overflow-y-auto">
                {bgCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedBgCategory(cat)}
                    className={`w-full text-left px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition ${
                      selectedBgCategory === cat
                        ? 'bg-[#6D28D9] text-white shadow-xs'
                        : 'text-[#8E8AAB] hover:text-white hover:bg-[#1E1938]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <div className="pt-2 border-t border-[#26214A]">
                  <button
                    onClick={() => {
                      setShowBackgroundModal(false);
                      setShowPaletteModal(true);
                    }}
                    className="w-full text-left px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold text-[#A78BFA] hover:bg-[#1E1938] flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Custom Image...</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredScenes.map((scene) => {
                  const isSelected = currentScene.id === scene.id && !roomPalette.customBgUrl;
                  return (
                    <div
                      key={scene.id}
                      onClick={() => handleSelectScene(scene)}
                      className={`relative h-36 sm:h-40 rounded-2xl overflow-hidden cursor-pointer group border-2 transition-all shadow-lg ${
                        isSelected
                          ? 'border-[#8B5CF6] ring-4 ring-[#8B5CF6]/30'
                          : 'border-transparent hover:border-[#8B5CF6]/60'
                      }`}
                    >
                      <img
                        src={scene.imageUrl}
                        alt={scene.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <span className="font-bold text-xs text-white truncate block">{scene.name}</span>
                        <span className="text-[10px] text-[#A78BFA] capitalize flex items-center gap-1 mt-0.5">
                          <Music className="w-2.5 h-2.5" />
                          {scene.ambientSound} audio
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. INVITE FRIENDS MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#171431] border border-[#2E2856] rounded-3xl p-5 sm:p-6 w-full max-w-md space-y-5 text-slate-200 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#26214A] pb-3">
              <h3 className="text-lg font-extrabold text-white">Invite Friends</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full bg-[#231F45] text-[#8E8AAB] hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#8E8AAB] uppercase tracking-wider">
                Online Friends
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users
                  .filter((u) => u.id !== currentUser?.id)
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D0B1D] border border-[#26214A]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0D0B1D] ${
                              u.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-white block">{u.name}</span>
                          <span className="text-[10px] text-[#A78BFA]">@{u.username}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          inviteFriendToRoom(activeRoom?.id || 'room_cs61a', u.id);
                          setInvitedUserIds((prev) => [...prev, u.id]);
                        }}
                        disabled={invitedUserIds.includes(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1 ${
                          invitedUserIds.includes(u.id)
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-[#6D28D9] hover:bg-[#7C3AED] text-white'
                        }`}
                      >
                        {invitedUserIds.includes(u.id) ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Invited</span>
                          </>
                        ) : (
                          <span>Invite</span>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#26214A]">
              <span className="text-xs font-bold text-[#8E8AAB] uppercase tracking-wider">
                Share Room Link
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="flex-1 bg-[#0D0B1D] border border-[#2E2856] rounded-xl px-3 py-2 text-xs text-slate-300 select-all font-mono truncate"
                />

                <button
                  onClick={handleCopyRoomLink}
                  className="px-4 py-2 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/40 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. ROOM BACKGROUND MUSIC & SONG MODAL */}
      <RoomBackgroundMusicModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isPlayingAudio}
        volume={audioVolume}
        onSelectTrack={handleSelectSongTrack}
        onTogglePlay={handleToggleAudio}
        onVolumeChange={(vol) => {
          setAudioVolume(vol);
          ambientAudioService.setVolume(vol / 100);
        }}
        customTrack={customTrack}
        onSetCustomTrack={(track) => setCustomTrack(track)}
      />
    </div>
  );
};
