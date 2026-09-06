import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  GripHorizontal,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  LayoutGrid,
  Scaling,
  ChevronDown,
  X,
  Sparkles,
  Crown,
  Key,
  Shield,
  UserMinus,
  Sliders,
  MoreVertical,
  MapPin,
  Tag,
  Grid3X3,
  Columns,
  Square,
  Ratio,
  Volume2,
  Laptop,
  Smartphone,
  Eye,
  RefreshCw,
  Monitor,
  StopCircle,
} from 'lucide-react';
import { UserProfileHoverCard } from '../common/UserProfileHoverCard';
import { RoomParticipantRole } from '../../types';
import { mediaService } from '../../services/mediaService';

export interface VideoParticipant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isHost: boolean;
  role?: RoomParticipantRole;
  isMuted: boolean;
  isVideo: boolean;
  isSpeaking?: boolean;
}

export type BadgeLocation = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type GridDensity = 'compact' | 'balanced' | 'comfortable';
export type VideoAspectRatio = 'auto' | '16:9' | '4:3' | '1:1';
export type StageSizePreset = 'compact' | 'medium' | 'large' | 'theater' | 'mobile_dock';

interface DraggableVideoStageProps {
  participants: VideoParticipant[];
  isLocalVideoOn: boolean;
  isLocalMicOn: boolean;
  currentUserId?: string;
  accentColor: string;
  isLead?: boolean;
  onNavigateProfile: (username: string) => void;
  onNavigateDirectMessage?: (userId: string) => void;
  onMentionInChat?: (username: string) => void;
  onUpdateRole?: (userId: string, newRole: RoomParticipantRole) => void;
  onKickParticipant?: (userId: string, reason?: string) => void;
  onRemoteMute?: (userId: string, type: 'audio' | 'video') => void;
  screenStream?: MediaStream | null;
  isScreenSharingActive?: boolean;
  onStopScreenShare?: () => void;
  rtcConnectionState?: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';
  reconnectAttemptCount?: number;
  onTriggerReconnect?: () => void;
}

export const ScreenShareStreamView: React.FC<{ stream: MediaStream | null; className?: string }> = ({
  stream,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream && stream.active) {
      video.srcObject = stream;
      video.play().catch(() => {});
    } else {
      if (video.srcObject) {
        video.pause();
        video.srcObject = null;
      }
    }

    return () => {
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream || !stream.active) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={className || "w-full h-full object-contain bg-[#0a0818] rounded-xl"}
    />
  );
};

const SIZE_PRESETS: Record<StageSizePreset, { width: number; height: number; label: string }> = {
  compact: { width: 300, height: 220, label: 'Compact (300px)' },
  medium: { width: 420, height: 290, label: 'Medium (420px)' },
  large: { width: 540, height: 370, label: 'Large (540px)' },
  theater: { width: 680, height: 450, label: 'Theater (680px)' },
  mobile_dock: { width: 340, height: 240, label: 'Mobile Fit' },
};

export const LocalCameraStreamView: React.FC<{ stream: MediaStream | null; className?: string }> = ({
  stream,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream && stream.active) {
      video.srcObject = stream;
      video.play().catch(() => {});
    } else {
      if (video.srcObject) {
        video.pause();
        video.srcObject = null;
      }
    }

    return () => {
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream || !stream.active) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className={className || "w-full h-full object-cover -scale-x-100"}
    />
  );
};

export const DraggableVideoStage: React.FC<DraggableVideoStageProps> = ({
  participants,
  isLocalVideoOn,
  isLocalMicOn,
  currentUserId,
  accentColor,
  isLead = true,
  onNavigateProfile,
  onNavigateDirectMessage,
  onMentionInChat,
  onUpdateRole,
  onKickParticipant,
  onRemoteMute,
  screenStream,
  isScreenSharingActive,
  onStopScreenShare,
  rtcConnectionState,
  reconnectAttemptCount,
  onTriggerReconnect,
}) => {
  // 1. Stage Sizing & Window Dimensions
  const [stagePreset, setStagePreset] = useState<StageSizePreset>('medium');
  const [customWidth, setCustomWidth] = useState<number>(420);
  const [customHeight, setCustomHeight] = useState<number>(290);
  const [isResizing, setIsResizing] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showBadgeMenu, setShowBadgeMenu] = useState(false);
  const [showDensityMenu, setShowDensityMenu] = useState(false);

  // 2. Host Grid Density & Aspect Ratio Controls
  const [gridDensity, setGridDensity] = useState<GridDensity>(() => {
    return (localStorage.getItem('studyspace_video_grid_density') as GridDensity) || 'balanced';
  });

  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(() => {
    return (localStorage.getItem('studyspace_video_aspect_ratio') as VideoAspectRatio) || '16:9';
  });

  // 3. Member Badge Location state
  const [badgeLocation, setBadgeLocation] = useState<BadgeLocation>(() => {
    return (localStorage.getItem('studyspace_camera_badge_location') as BadgeLocation) || 'bottom-left';
  });

  const handleSetBadgeLocation = (loc: BadgeLocation) => {
    setBadgeLocation(loc);
    localStorage.setItem('studyspace_camera_badge_location', loc);
    setShowBadgeMenu(false);
  };

  const handleSetGridDensity = (density: GridDensity) => {
    setGridDensity(density);
    localStorage.setItem('studyspace_video_grid_density', density);
    setShowDensityMenu(false);
  };

  const handleSetAspectRatio = (ratio: VideoAspectRatio) => {
    setAspectRatio(ratio);
    localStorage.setItem('studyspace_video_aspect_ratio', ratio);
  };

  // 4. Position & Responsive Positioning
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      return { x: 8, y: 58 };
    }
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    return { x: Math.max(16, winW - 440), y: 68 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focused' | 'strip'>('grid');
  const [selectedFocusId, setSelectedFocusId] = useState<string>(participants[0]?.id || 'user_alex');
  const [simulatedCount, setSimulatedCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  // Monitor window resize to prevent viewport clipping on mobile
  useEffect(() => {
    const handleWindowResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileViewport(mobile);
      // Auto adjust if overflowing right edge
      setPosition((prev) => {
        const maxX = Math.max(8, window.innerWidth - (mobile ? 320 : 420) - 8);
        const maxY = Math.max(50, window.innerHeight - 200);
        return {
          x: Math.min(Math.max(8, prev.x), maxX),
          y: Math.min(Math.max(50, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Simulated camera study peers for live testing with 1, 2, 3, 4, 6+ users
  const extraSimulatedUsers: VideoParticipant[] = useMemo(
    () => [
      {
        id: 'sim_charlie',
        name: 'Charlie K.',
        username: 'charlie_math',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        role: 'member',
        isMuted: false,
        isVideo: true,
        isSpeaking: true,
      },
      {
        id: 'sim_daisy',
        name: 'Daisy R.',
        username: 'daisy_med',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        role: 'co-host',
        isMuted: true,
        isVideo: true,
      },
      {
        id: 'sim_elena',
        name: 'Elena V.',
        username: 'elena_law',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        role: 'member',
        isMuted: false,
        isVideo: true,
      },
      {
        id: 'sim_kai',
        name: 'Kai Sato',
        username: 'kai_eng',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isHost: false,
        role: 'member',
        isMuted: true,
        isVideo: true,
      },
    ],
    []
  );

  const displayedParticipants = useMemo(() => {
    return [...participants, ...extraSimulatedUsers.slice(0, simulatedCount)];
  }, [participants, extraSimulatedUsers, simulatedCount]);

  const peerVideoBackgrounds: Record<string, string> = {
    user_alex: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    user_sarah: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    user_marcus: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    user_elena: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
    sim_charlie: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    sim_daisy: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    sim_elena: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    sim_kai: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number }>({
    startX: 0,
    startY: 0,
    startW: 420,
    startH: 290,
  });

  // Calculate safe responsive container width (prevents clipping on mobile viewports)
  const maxAvailableWidth = typeof window !== 'undefined' ? Math.max(260, window.innerWidth - 20) : customWidth;
  const effectiveWidth = Math.min(customWidth, maxAvailableWidth);

  const [activeLocalStream, setActiveLocalStream] = useState<MediaStream | null>(null);
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState<boolean>(false);
  const [localAudioLevel, setLocalAudioLevel] = useState<number>(0);

  // Peer Media Overrides for testing friend cameras & microphones in real time
  const [peerCameraOverrides, setPeerCameraOverrides] = useState<Record<string, boolean>>({});
  const [peerMuteOverrides, setPeerMuteOverrides] = useState<Record<string, boolean>>({});

  // Active Camera Filter (default: true -> remove participants whose camera is off)
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);

  const cameraActiveParticipants = useMemo(() => {
    return displayedParticipants.filter((p) => {
      const isMe = currentUserId ? p.id === currentUserId : p.id === 'user_alex';
      const isVideoActive = isMe
        ? Boolean(isLocalVideoOn && activeLocalStream && activeLocalStream.active && activeLocalStream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live'))
        : (peerCameraOverrides[p.id] ?? (p.isVideo !== false));
      return isVideoActive;
    });
  }, [displayedParticipants, currentUserId, isLocalVideoOn, activeLocalStream, peerCameraOverrides]);

  const visibleParticipants = useMemo(() => {
    if (!showActiveOnly) return displayedParticipants;
    return cameraActiveParticipants;
  }, [showActiveOnly, displayedParticipants, cameraActiveParticipants]);

  const togglePeerCameraState = (id: string, defaultIsVideo: boolean) => {
    setPeerCameraOverrides((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? defaultIsVideo),
    }));
    if (onRemoteMute) {
      onRemoteMute(id, 'video');
    }
  };

  const togglePeerMuteState = (id: string, defaultIsMuted: boolean) => {
    setPeerMuteOverrides((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? defaultIsMuted),
    }));
    if (onRemoteMute) {
      onRemoteMute(id, 'audio');
    }
  };

  const requestMediaAccess = useCallback(async () => {
    try {
      const { stream, isSimulated, error } = await mediaService.startCameraAndMic(
        true,
        isLocalVideoOn,
        isLocalMicOn
      );
      setActiveLocalStream(stream);
      mediaService.toggleVideo(isLocalVideoOn);
      mediaService.toggleAudio(isLocalMicOn);

      if (error) {
        setCameraNotice(error);
      } else if (isSimulated && isLocalVideoOn) {
        setCameraNotice('Camera preview stream active');
      } else {
        setCameraNotice(null);
      }
    } catch (err: any) {
      setCameraNotice('Media device access failed');
    }
  }, [isLocalVideoOn, isLocalMicOn]);

  // Attach local media stream and monitor live microphone level
  useEffect(() => {
    let stopAudioMonitor: (() => void) | null = null;

    if (isLocalVideoOn || isLocalMicOn) {
      requestMediaAccess();

      if (isLocalMicOn) {
        stopAudioMonitor = mediaService.monitorAudioLevel((level, isSpeaking) => {
          setIsLocalSpeaking(isSpeaking);
          setLocalAudioLevel(level);
        });
      } else {
        setIsLocalSpeaking(false);
        setLocalAudioLevel(0);
      }
    } else {
      mediaService.stopCameraAndMic();
      setActiveLocalStream(null);
      setCameraNotice(null);
      setIsLocalSpeaking(false);
      setLocalAudioLevel(0);
    }

    return () => {
      if (stopAudioMonitor) stopAudioMonitor();
    };
  }, [isLocalVideoOn, isLocalMicOn, requestMediaAccess]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isResizing) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.resize-handle') || target.closest('.user-hover-trigger')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const cardWidth = cardRef.current?.offsetWidth || effectiveWidth;
      const cardHeight = cardRef.current?.offsetHeight || customHeight;
      const maxX = Math.max(8, window.innerWidth - cardWidth - 8);
      const maxY = Math.max(50, window.innerHeight - cardHeight - 75);

      const newX = Math.min(Math.max(8, dragStartRef.current.posX + deltaX), maxX);
      const newY = Math.min(Math.max(50, dragStartRef.current.posY + deltaY), maxY);

      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartRef.current.startX;
      const deltaY = e.clientY - resizeStartRef.current.startY;

      const newW = Math.max(260, Math.min(window.innerWidth - 20, resizeStartRef.current.startW + deltaX));
      const newH = Math.max(180, Math.min(window.innerHeight - 100, resizeStartRef.current.startH + deltaY));

      setCustomWidth(newW);
      setCustomHeight(newH);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setIsResizing(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: customWidth,
      startH: customHeight,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const applySizePreset = (presetKey: StageSizePreset) => {
    const preset = SIZE_PRESETS[presetKey];
    setStagePreset(presetKey);
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
    setShowSizeMenu(false);
  };

  // 5. DYNAMIC CSS GRID LAYOUT CALCULATION
  // Balances columns & aspect ratios dynamically based on count, container width, and host density
  const count = visibleParticipants.length;

  const dynamicGridConfig = useMemo(() => {
    const isMobileStage = effectiveWidth < 360;

    let columns = 1;
    let gap = '6px';
    let autoRows = 'minmax(0, 1fr)';

    if (gridDensity === 'compact') {
      gap = '4px';
      if (isMobileStage) {
        columns = count >= 4 ? 2 : count >= 2 ? 2 : 1;
      } else {
        if (count >= 7) columns = 4;
        else if (count >= 5) columns = 3;
        else if (count >= 3) columns = 3;
        else if (count === 2) columns = 2;
        else columns = 1;
      }
    } else if (gridDensity === 'comfortable') {
      gap = '8px';
      if (isMobileStage) {
        columns = 1;
      } else {
        if (count >= 4) columns = 2;
        else if (count >= 2) columns = 2;
        else columns = 1;
      }
    } else {
      // Balanced (Default)
      gap = isMobileStage ? '5px' : '6px';
      if (isMobileStage) {
        columns = count >= 3 ? 2 : count === 2 ? 2 : 1;
      } else {
        if (count >= 7) columns = 4;
        else if (count >= 5) columns = 3;
        else if (count >= 3) columns = 2;
        else if (count === 2) columns = 2;
        else columns = 1;
      }
    }

    return {
      columns,
      gap,
      autoRows,
      isOddThree: count === 3 && columns === 2,
    };
  }, [count, effectiveWidth, gridDensity]);

  // Helper for video aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-4/3';
      case '1:1':
        return 'aspect-square';
      case 'auto':
      default:
        return 'aspect-auto h-full';
    }
  };

  // Helper to position participant badges
  const getBadgePositionClasses = (loc: BadgeLocation) => {
    switch (loc) {
      case 'top-left':
        return 'top-1.5 left-1.5';
      case 'top-right':
        return 'top-1.5 right-1.5';
      case 'bottom-right':
        return 'bottom-1.5 right-1.5';
      case 'bottom-left':
      default:
        return 'bottom-1.5 left-1.5';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 z-40 px-3.5 py-2 rounded-2xl bg-[#171431]/95 backdrop-blur-md border border-[#2E2856] text-white hover:border-[#8B5CF6] shadow-2xl flex items-center gap-2 text-xs font-bold transition hover:scale-105"
      >
        <Video className="w-4 h-4 text-emerald-400" />
        <span>Show Cameras ({visibleParticipants.length})</span>
      </button>
    );
  }

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: isMinimized ? 'auto' : `${effectiveWidth}px`,
        height: isMinimized ? 'auto' : `${customHeight}px`,
      }}
      className={`fixed top-0 left-0 z-40 select-none touch-none transition-shadow rounded-2xl bg-[#131129]/95 backdrop-blur-xl border border-[#2E2856] shadow-2xl flex flex-col overflow-visible ${
        isDragging ? 'cursor-grabbing ring-2 ring-[#8B5CF6]/50 shadow-purple-950/60' : 'cursor-grab'
      }`}
    >
      {/* 1. STAGE HEADER & HOST CONTROLS */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#26214A] bg-[#171431]/80 rounded-t-2xl">
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="w-4 h-4 text-[#8E8AAB] hover:text-white shrink-0" />
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>Cameras</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#231F45] text-[#A78BFA] font-mono">
                {visibleParticipants.length}
              </span>
            </h4>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Host Grid Density Selector */}
          {!isMinimized && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDensityMenu(!showDensityMenu);
                  setShowSizeMenu(false);
                  setShowBadgeMenu(false);
                }}
                className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition ${
                  gridDensity !== 'balanced'
                    ? 'bg-[#6D28D9]/40 border-[#8B5CF6] text-white'
                    : 'bg-[#231F45] border-transparent text-[#A78BFA] hover:text-white hover:bg-[#352F64]'
                }`}
                title="Host Grid Density & Layout Controls"
              >
                <Grid3X3 className="w-3 h-3 text-[#A78BFA]" />
                <span className="hidden xs:inline capitalize">{gridDensity}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {showDensityMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 w-48 bg-[#171431] border border-[#2E2856] rounded-xl p-2 shadow-2xl z-50 space-y-2 text-xs"
                >
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#8E8AAB] px-1 mb-1">
                      Grid Density ({isLead ? 'Host' : 'User'})
                    </div>
                    {[
                      { id: 'compact', label: '⚡ Compact (Dense)', desc: 'Max tiles per row, tighter gaps' },
                      { id: 'balanced', label: '⚖️ Balanced (Auto-Fit)', desc: 'Optimal aspect balance' },
                      { id: 'comfortable', label: '🎬 Comfortable (Spacious)', desc: 'Larger widescreen tiles' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSetGridDensity(d.id as GridDensity)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex flex-col transition mb-1 ${
                          gridDensity === d.id
                            ? 'bg-[#6D28D9] text-white'
                            : 'text-[#8E8AAB] hover:text-white hover:bg-[#231F45]'
                        }`}
                      >
                        <span className="font-bold">{d.label}</span>
                        <span className="text-[9px] opacity-75">{d.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-[#26214A]">
                    <div className="text-[9px] uppercase font-bold text-[#8E8AAB] px-1 mb-1">
                      Video Tile Aspect Ratio
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { id: '16:9', label: '16:9 Widescreen' },
                        { id: '4:3', label: '4:3 Standard' },
                        { id: '1:1', label: '1:1 Square' },
                        { id: 'auto', label: 'Auto Fill' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSetAspectRatio(r.id as VideoAspectRatio)}
                          className={`px-1.5 py-1 rounded-md text-[10px] font-bold text-center transition ${
                            aspectRatio === r.id
                              ? 'bg-[#8B5CF6] text-white'
                              : 'bg-[#231F45] text-[#8E8AAB] hover:text-white'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Member Badge Location Switcher */}
          {!isMinimized && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBadgeMenu(!showBadgeMenu);
                  setShowSizeMenu(false);
                  setShowDensityMenu(false);
                }}
                className="px-1.5 py-0.5 rounded-lg bg-[#231F45] hover:bg-[#352F64] text-[10px] font-bold text-[#A78BFA] hover:text-white flex items-center gap-1 transition"
                title="Change Camera Member Badge Location"
              >
                <Tag className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Badge</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {showBadgeMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 w-44 bg-[#171431] border border-[#2E2856] rounded-xl p-1.5 shadow-2xl z-50 space-y-1 text-xs"
                >
                  <div className="text-[9px] uppercase font-bold text-[#8E8AAB] px-2 py-0.5">
                    Member Badge Location
                  </div>
                  {[
                    { id: 'bottom-left', label: 'Bottom Left (Default)' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'top-right', label: 'Top Right' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleSetBadgeLocation(b.id as BadgeLocation)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                        badgeLocation === b.id
                          ? 'bg-[#6D28D9] text-white'
                          : 'text-[#8E8AAB] hover:text-white hover:bg-[#231F45]'
                      }`}
                    >
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Camera Filter Toggle (Active Cam vs All) */}
          {!isMinimized && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActiveOnly((prev) => !prev);
              }}
              className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition ${
                showActiveOnly
                  ? 'bg-[#6D28D9]/40 border-[#8B5CF6] text-emerald-300'
                  : 'bg-[#231F45] border-transparent text-[#8E8AAB] hover:text-white'
              }`}
              title={
                showActiveOnly
                  ? 'Active Cameras Only: Members with camera off are hidden (Click to show all)'
                  : 'Showing all members (Click to show active cameras only)'
              }
            >
              <Video className="w-3 h-3 text-emerald-400" />
              <span className="hidden xs:inline">{showActiveOnly ? 'Cam On' : 'All'}</span>
            </button>
          )}

          {/* Member Simulation Button for Grid Flexibility */}
          {!isMinimized && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSimulatedCount((prev) => (prev >= 4 ? 0 : prev + 1));
              }}
              className="px-1.5 py-0.5 rounded-lg bg-[#6D28D9]/40 hover:bg-[#6D28D9] text-[10px] font-bold text-[#A78BFA] hover:text-white transition flex items-center gap-1"
              title="Test dynamic grid layout with more camera members"
            >
              <Users className="w-3 h-3" />
              <span className="hidden xs:inline">{simulatedCount === 0 ? '+Cam' : `Cam:${visibleParticipants.length}`}</span>
            </button>
          )}

          {/* Size Preset Picker */}
          {!isMinimized && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizeMenu(!showSizeMenu);
                  setShowBadgeMenu(false);
                  setShowDensityMenu(false);
                }}
                className="px-1.5 py-0.5 rounded-lg bg-[#231F45] hover:bg-[#352F64] text-[10px] font-bold text-[#A78BFA] hover:text-white flex items-center gap-1 transition"
                title="Resize Camera Stage"
              >
                <Scaling className="w-3 h-3" />
                <span className="hidden sm:inline">{effectiveWidth}px</span>
              </button>

              {showSizeMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 w-38 bg-[#171431] border border-[#2E2856] rounded-xl p-1.5 shadow-2xl z-50 space-y-1 text-xs"
                >
                  <div className="text-[9px] uppercase font-bold text-[#8E8AAB] px-2 py-0.5">Stage Size</div>
                  {(Object.keys(SIZE_PRESETS) as StageSizePreset[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => applySizePreset(key)}
                      className={`w-full text-left px-2 py-1 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                        stagePreset === key
                          ? 'bg-[#6D28D9] text-white'
                          : 'text-[#8E8AAB] hover:text-white hover:bg-[#231F45]'
                      }`}
                    >
                      <span>{SIZE_PRESETS[key].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Layout Mode Switcher: Grid vs Spotlight */}
          {!isMinimized && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLayoutMode(layoutMode === 'grid' ? 'focused' : 'grid');
              }}
              className={`p-1 rounded-lg transition ${
                layoutMode === 'focused'
                  ? 'bg-[#6D28D9] text-white'
                  : 'bg-[#231F45] hover:bg-[#352F64] text-[#A78BFA] hover:text-white'
              }`}
              title={`Layout Mode: ${layoutMode === 'grid' ? 'Switch to Spotlight Focus' : 'Switch to Grid View'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Minimize / Expand Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 rounded-lg bg-[#231F45] hover:bg-[#352F64] text-[#8E8AAB] hover:text-white transition"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Stage */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="p-1 rounded-lg bg-[#231F45] hover:bg-rose-500/30 text-[#8E8AAB] hover:text-rose-400 transition"
            title="Hide Cameras"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MINIMIZED COMPACT BAR */}
      {isMinimized ? (
        <div className="p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {visibleParticipants.slice(0, 3).map((p) => (
              <img
                key={p.id}
                src={p.avatar}
                alt=""
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#8B5CF6]"
              />
            ))}
            <span className="text-[10px] font-bold text-slate-300">
              {visibleParticipants.length} Camera{visibleParticipants.length === 1 ? '' : 's'} Active
            </span>
          </div>
        </div>
      ) : (
        /* 3. EXPANDED CAMERA STAGE BODY WITH DYNAMIC CSS GRID */
        <div className="flex-1 p-2 flex flex-col min-h-0 overflow-hidden relative">
          {/* WebRTC Auto-Reconnecting Alert Banner */}
          {(rtcConnectionState === 'reconnecting' || rtcConnectionState === 'disconnected' || rtcConnectionState === 'failed') && (
            <div className="mb-2 px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs text-amber-200 shrink-0 animate-pulse z-30">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                <span className="font-semibold text-[11px]">
                  Network drop detected. WebRTC auto-reconnecting... {reconnectAttemptCount ? `(Attempt ${reconnectAttemptCount}/5)` : ''}
                </span>
              </div>
              {onTriggerReconnect && (
                <button
                  onClick={onTriggerReconnect}
                  className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-[10px] transition cursor-pointer shrink-0"
                >
                  Reconnect
                </button>
              )}
            </div>
          )}

          {/* Active Screen Sharing Feed Showcase Card */}
          {(isScreenSharingActive || screenStream) && (
            <div className="mb-2.5 rounded-xl overflow-hidden bg-[#0A0818] border border-[#8B5CF6]/60 shadow-2xl flex flex-col min-h-[180px] max-h-[320px] shrink-0">
              <div className="px-3 py-1.5 bg-[#171431] border-b border-[#2E2856] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Monitor className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span className="text-xs font-bold text-slate-200">
                    {isScreenSharingActive ? 'You are sharing screen' : 'Shared Screen Feed'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#231F45] text-slate-400 border border-[#352F64]">
                    1080p 60fps
                  </span>
                </div>
                {onStopScreenShare && isScreenSharingActive && (
                  <button
                    onClick={onStopScreenShare}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <StopCircle className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
              <div className="flex-1 relative bg-black flex items-center justify-center p-1 overflow-hidden min-h-0">
                <ScreenShareStreamView stream={screenStream || null} />
              </div>
            </div>
          )}

          {/* LAYOUT A: DYNAMIC ASPECT-BALANCED CSS GRID */}
          {layoutMode === 'grid' && (
            visibleParticipants.length === 0 ? (
              <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center bg-[#0B0918]/90 rounded-xl border border-dashed border-[#2E2856] p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#1A1635] border border-[#2E2856] flex items-center justify-center mb-3 text-[#A78BFA] shadow-lg">
                  <VideoOff className="w-6 h-6 text-slate-400" />
                </div>
                <h5 className="text-xs font-bold text-slate-200 mb-1">No Active Cameras</h5>
                <p className="text-[11px] text-[#8E8AAB] max-w-xs mb-4">
                  Participants with camera turned off are hidden from this slide. Turn on your camera or switch view filter to see members!
                </p>
                <div className="flex items-center gap-2">
                  {!isLocalVideoOn && (
                    <button
                      onClick={requestMediaAccess}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Turn On Camera</span>
                    </button>
                  )}
                  {showActiveOnly && (
                    <button
                      onClick={() => setShowActiveOnly(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#231F45] hover:bg-[#352F64] text-slate-200 text-xs font-semibold border border-[#352F64] transition cursor-pointer"
                    >
                      <span>Show All Members</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#2E2856] grid content-start"
                style={{
                  gridTemplateColumns: `repeat(${dynamicGridConfig.columns}, minmax(0, 1fr))`,
                  gap: dynamicGridConfig.gap,
                  gridAutoRows: dynamicGridConfig.autoRows,
                }}
              >
                {visibleParticipants.map((p, idx) => {
                  const isMe = currentUserId ? p.id === currentUserId : (p.id === 'user_alex');
                  const isPeerCameraOn = isMe ? isLocalVideoOn : (peerCameraOverrides[p.id] ?? (p.isVideo !== false));
                  const isPeerAudioOn = isMe ? isLocalMicOn : !(peerMuteOverrides[p.id] ?? (p.isMuted ?? false));
                  const showLiveVideo = isMe && isLocalVideoOn;
                  const isParticipantSpeaking = p.isSpeaking || (isMe && isLocalSpeaking);

                  // Handle balanced spanning for odd 3rd tile if needed
                  const isThirdOdd = dynamicGridConfig.isOddThree && idx === 2;

                  return (
                    <div
                      key={p.id}
                      className={`relative rounded-xl overflow-hidden bg-[#0D0B1D] border flex items-center justify-center group shadow-md transition-all ${
                        getAspectRatioClass()
                      } ${isThirdOdd ? 'col-span-2 max-w-[70%] mx-auto w-full' : 'w-full'} ${
                        isParticipantSpeaking
                          ? 'border-emerald-400 ring-2 ring-emerald-500/40'
                          : 'border-[#2E2856] hover:border-[#8B5CF6]/70'
                      }`}
                    >
                      {/* Live webcam feed or high quality study avatar/camera feed */}
                      {showLiveVideo ? (
                        <div className="relative w-full h-full">
                          <LocalCameraStreamView stream={activeLocalStream} />
                          {cameraNotice && (
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-amber-500/40 text-[10px] text-amber-300 flex items-center gap-1 z-20">
                              <span>{cameraNotice}</span>
                              <button
                                type="button"
                                onClick={requestMediaAccess}
                                className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[9px]"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </div>
                      ) : isPeerCameraOn ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={peerVideoBackgrounds[p.id] || p.avatar}
                            alt={p.name}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                      ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0B0918] p-3 text-center">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#2E2856] mb-1.5 shadow-lg">
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover grayscale opacity-70" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <VideoOff className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                          <span className="text-[10px] font-medium text-slate-300 truncate max-w-[100px]">{p.name.split(' ')[0]}</span>
                          <span className="text-[8px] font-semibold text-rose-400 bg-rose-950/70 border border-rose-500/30 px-1.5 py-0.5 rounded-full mt-0.5">Camera Off</span>
                        </div>
                      )}

                      {/* Speaking Soundwaves Visualizer */}
                      {isParticipantSpeaking && (
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-xs z-20">
                          <Volume2 className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                          <span className="text-[8px] font-bold text-emerald-300">Speaking</span>
                        </div>
                      )}

                      {/* DYNAMIC CUSTOMIZABLE MEMBER BADGE (Host configured location) */}
                      <div
                        className={`absolute ${getBadgePositionClasses(
                          badgeLocation
                        )} z-10 flex items-center gap-1 pointer-events-auto user-hover-trigger`}
                      >
                        <UserProfileHoverCard
                          userId={p.id}
                          username={p.username}
                          onNavigateProfile={onNavigateProfile}
                          onNavigateDirectMessage={onNavigateDirectMessage}
                          onMentionInChat={onMentionInChat}
                          isHost={p.isHost || p.role === 'host'}
                          isCoHost={p.role === 'co-host'}
                          role={p.role}
                          align="left"
                        >
                          <div className="flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded-md backdrop-blur-xs border border-white/10 max-w-[130px] cursor-pointer hover:border-[#8B5CF6] transition">
                            {p.isHost || p.role === 'host' ? (
                              <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" title="Lead Host" />
                            ) : p.role === 'co-host' ? (
                              <Key className="w-2.5 h-2.5 text-amber-300 shrink-0" title="Co-Host" />
                            ) : null}
                            <span className="text-[9px] font-bold text-white truncate">
                              {p.name.split(' ')[0]} {isMe && '(You)'}
                            </span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isPeerAudioOn ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                          </div>
                        </UserProfileHoverCard>
                      </div>

                      {/* Quick Tile Controls on Hover */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-20">
                        {!isMe && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePeerCameraState(p.id, p.isVideo !== false);
                            }}
                            className={`p-1 rounded-md text-[9px] transition ${
                              isPeerCameraOn
                                ? 'bg-black/75 hover:bg-emerald-600 text-emerald-300 hover:text-white'
                                : 'bg-rose-900/80 hover:bg-rose-600 text-rose-200 hover:text-white'
                            }`}
                            title={isPeerCameraOn ? 'Turn Friend Camera Off' : 'Turn Friend Camera On'}
                          >
                            {isPeerCameraOn ? <Video className="w-2.5 h-2.5" /> : <VideoOff className="w-2.5 h-2.5" />}
                          </button>
                        )}

                        {!isMe && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePeerMuteState(p.id, p.isMuted ?? false);
                            }}
                            className={`p-1 rounded-md text-[9px] transition ${
                              isPeerAudioOn
                                ? 'bg-black/75 hover:bg-emerald-600 text-emerald-300 hover:text-white'
                                : 'bg-rose-900/80 hover:bg-rose-600 text-rose-200 hover:text-white'
                            }`}
                            title={isPeerAudioOn ? 'Mute Friend Microphone' : 'Unmute Friend Microphone'}
                          >
                            {isPeerAudioOn ? <Mic className="w-2.5 h-2.5" /> : <MicOff className="w-2.5 h-2.5" />}
                          </button>
                        )}

                        {isLead && !isMe && onUpdateRole && (
                          <>
                            {!p.isHost && p.role !== 'host' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateRole(p.id, 'host');
                                }}
                                className="p-1 rounded-md bg-black/75 hover:bg-amber-600 text-amber-300 hover:text-white text-[9px] transition"
                                title="Make Lead Host"
                              >
                                <Crown className="w-2.5 h-2.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateRole(p.id, p.role === 'co-host' ? 'member' : 'co-host');
                              }}
                              className="p-1 rounded-md bg-black/75 hover:bg-purple-600 text-purple-300 hover:text-white text-[9px] transition"
                              title={p.role === 'co-host' ? 'Demote to Member' : 'Promote to Moderator'}
                            >
                              <Shield className="w-2.5 h-2.5" />
                            </button>
                          </>
                        )}

                        {isLead && !isMe && onKickParticipant && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Remove ${p.name} from this room?`)) {
                                onKickParticipant(p.id, 'Host action');
                              }
                            }}
                            className="p-1 rounded-md bg-black/75 hover:bg-rose-600 text-rose-300 hover:text-white text-[9px] transition"
                            title="Kick Member"
                          >
                            <UserMinus className="w-2.5 h-2.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFocusId(p.id);
                            setLayoutMode('focused');
                          }}
                          className="p-1 rounded-md bg-black/75 hover:bg-[#6D28D9] text-white text-[9px] transition"
                          title="Spotlight this camera"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* LAYOUT B: FOCUSED SPOTLIGHT VIEW */}
          {layoutMode === 'focused' && (
            <div className="flex flex-col h-full gap-2 min-h-0">
              {/* Main Spotlight Video Tile */}
              <div className="flex-1 relative rounded-xl overflow-hidden bg-[#0D0B1D] border border-[#2E2856] min-h-0 flex items-center justify-center">
                {((currentUserId && selectedFocusId === currentUserId) || (!currentUserId && selectedFocusId === 'user_alex')) && isLocalVideoOn ? (
                  <LocalCameraStreamView stream={activeLocalStream} />
                ) : (
                  <img
                    src={peerVideoBackgrounds[selectedFocusId] || visibleParticipants[0]?.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                <div className={`absolute ${getBadgePositionClasses(badgeLocation)} bg-black/80 px-2 py-0.5 rounded-md text-xs font-bold text-white flex items-center gap-1.5 backdrop-blur-xs border border-white/10`}>
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Spotlight: {visibleParticipants.find((p) => p.id === selectedFocusId)?.name || visibleParticipants[0]?.name || 'Member'}</span>
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 shrink-0 scrollbar-none">
                {visibleParticipants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedFocusId(p.id)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden border shrink-0 transition ${
                      selectedFocusId === p.id ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/60' : 'border-[#26214A] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-end p-0.5">
                      <span className="text-[8px] font-bold text-white truncate">{p.name.split(' ')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. DRAG RESIZE HANDLE */}
      {!isMinimized && (
        <div
          onPointerDown={handleResizeStart}
          className="resize-handle absolute bottom-0.5 right-0.5 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 opacity-60 hover:opacity-100 transition"
          title="Drag to resize camera window"
        >
          <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-[#A78BFA] rounded-br-sm" />
        </div>
      )}
    </div>
  );
};
