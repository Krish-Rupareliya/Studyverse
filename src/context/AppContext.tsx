import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  UserProfile,
  FriendRelationship,
  FriendshipStatus,
  DirectMessage,
  Conversation,
  StudyRoom,
  RoomChatMessage,
  RoomNote,
  RoomTheme,
  RoomParticipantRole,
  RoomCustomRules,
  RoomRules,
  AppNotification,
  TaskItem,
  StudyGoal,
  HabitItem,
  StudySessionRecord,
  ActivityFeedItem,
  ToastMessage,
} from '../types';
import {
  INITIAL_FRIENDSHIPS,
  INITIAL_ROOMS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TASKS,
  INITIAL_GOALS,
  INITIAL_HABITS,
  INITIAL_FEED,
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { mediaService } from '../services/mediaService';
import { realtimeSync, RealtimeMessage } from '../services/realtimeSyncService';

// Storage keys
const STORAGE_KEYS = {
  FRIENDSHIPS: 'studyspace_friendships_v2',
  ROOMS: 'studyspace_rooms_v2',
  MESSAGES: 'studyspace_messages_v2',
  NOTIFICATIONS: 'studyspace_notifications_v2',
  TASKS: 'studyspace_tasks_v2',
  GOALS: 'studyspace_goals_v2',
  HABITS: 'studyspace_habits_v2',
  SESSIONS: 'studyspace_sessions_v2',
  FEED: 'studyspace_feed_v2',
};

// Play short pleasant audio chimes via Web Audio API
export function playChime(type: 'notification' | 'timer_complete' | 'join' | 'leave' | 'chat') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'notification') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'timer_complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.36); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (type === 'join') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'leave') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {}
}

interface AppContextType {
  // Friends & Relationships
  getFriendshipStatus: (targetUserId: string) => FriendshipStatus;
  getRelationship: (userId1OrTarget: string, userId2?: string) => FriendshipStatus | 'me';
  sendFriendRequest: (targetUserId: string) => void;
  acceptFriendRequest: (targetUserId: string) => void;
  declineFriendRequest: (targetUserId: string) => void;
  cancelFriendRequest: (targetUserId: string) => void;
  removeFriend: (targetUserId: string) => void;
  unfriendUser: (targetUserId: string) => void;
  blockUser: (targetUserId: string) => void;
  unblockUser: (targetUserId: string) => void;
  getFriends: (userId?: string) => UserProfile[];
  getPendingReceived: (userId?: string) => { relationship: FriendRelationship; user: UserProfile }[];
  getPendingSent: (userId?: string) => { relationship: FriendRelationship; user: UserProfile }[];
  getBlockedUsers: (userId?: string) => UserProfile[];
  getMutualFriends: (userId1: string, userId2: string) => UserProfile[];

  // Direct Messages
  conversations: Conversation[];
  getConversationsForUser: (userId?: string) => { conversation: Conversation; otherUser: UserProfile }[];
  getMessagesForConversation: (conversationId: string) => DirectMessage[];
  getDirectMessages: (user1Id: string, user2Id: string) => DirectMessage[];
  sendMessage: (
    receiverId: string,
    content: string,
    type?: 'text' | 'room_invite' | 'note_share',
    roomInvite?: { roomId: string; roomCode: string; roomTitle: string; subject: string }
  ) => void;
  sendDirectMessage: (
    receiverId: string,
    content: string,
    type?: 'text' | 'room_invite' | 'note_share',
    roomInvite?: { roomId: string; roomCode: string; roomTitle: string; subject: string }
  ) => void;
  markConversationAsRead: (conversationId: string) => void;
  markDirectMessagesAsRead: (otherUserId: string) => void;
  getUnreadMessagesCount: (userId?: string) => number;

  // Study Rooms
  rooms: StudyRoom[];
  activeRoomId: string | null;
  activeRoom: StudyRoom | null;
  createRoom: (data: {
    title: string;
    description: string;
    subject: string;
    category: StudyRoom['category'];
    isPrivate: boolean;
    passcode?: string;
    maxParticipants: number;
    theme: RoomTheme;
    workDuration?: number;
    shortBreakDuration?: number;
    rules?: RoomRules;
  }) => StudyRoom;
  joinRoom: (roomIdOrCode: string, passcode?: string) => boolean;
  leaveRoom: (roomId: string) => void;
  deleteRoom: (roomId: string) => void;
  inviteFriendToRoom: (roomId: string, targetUserId: string) => void;
  updateRoomTheme: (roomId: string, theme: RoomTheme) => void;
  updateRoomTimer: (roomId: string, updates: Partial<StudyRoom['timer']>) => void;
  updateRoomSettings: (roomId: string, updates: Partial<StudyRoom>) => void;
  kickParticipant: (roomId: string, targetUserId: string, reason?: string) => boolean;
  updateParticipantRole: (roomId: string, targetUserId: string, newRole: RoomParticipantRole) => boolean;
  remoteMuteParticipant: (roomId: string, targetUserId: string, muteType: 'audio' | 'video') => void;
  updateParticipantMedia: (
    roomId: string,
    userId: string,
    updates: {
      isAudioEnabled?: boolean;
      isVideoEnabled?: boolean;
      isScreenSharing?: boolean;
      isSpeaking?: boolean;
      audioLevel?: number;
    }
  ) => void;
  roomMessages: { [roomId: string]: RoomChatMessage[] };
  sendRoomMessage: (roomId: string, content: string, type?: RoomChatMessage['type']) => void;
  addOrUpdateRoomNote: (roomId: string, note: Omit<RoomNote, 'id' | 'updatedAt' | 'lastEditedBy'> & { id?: string }) => void;
  deleteRoomNote: (roomId: string, noteId: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotifCount: number;
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notifId: string) => void;

  // Productivity
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, 'id' | 'userId' | 'createdAt'>) => void;
  updateTask: (taskId: string, updates: Partial<TaskItem>) => void;
  deleteTask: (taskId: string) => void;
  goals: StudyGoal[];
  addGoal: (goal: Omit<StudyGoal, 'id' | 'userId' | 'createdAt'>) => void;
  updateGoal: (goalId: string, updates: Partial<StudyGoal>) => void;
  deleteGoal: (goalId: string) => void;
  habits: HabitItem[];
  toggleHabitDate: (habitId: string, dateStr: string) => void;
  addHabit: (habit: Omit<HabitItem, 'id' | 'userId' | 'streak' | 'completedDates' | 'createdAt'>) => void;
  deleteHabit: (habitId: string) => void;
  studySessions: StudySessionRecord[];
  logStudySession: (session: Omit<StudySessionRecord, 'id' | 'userId' | 'completedAt'>) => void;

  // Activity Feed
  activityFeed: ActivityFeedItem[];
  toggleLikeActivity: (activityId: string) => void;
  addActivity: (activity: Omit<ActivityFeedItem, 'id' | 'userId' | 'user' | 'timestamp' | 'likes' | 'commentsCount'>) => void;

  // Media Stream & Permission State
  localMediaStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  isScreenSharingActive: boolean;
  mediaPermissions: { camera: 'granted' | 'denied' | 'prompt'; microphone: 'granted' | 'denied' | 'prompt' };
  requestUserMedia: (options?: { video?: boolean; audio?: boolean }) => Promise<{ stream: MediaStream; isSimulated: boolean; error?: string }>;
  stopUserMedia: () => void;
  toggleLocalVideoTrack: (enabled: boolean) => boolean;
  toggleLocalAudioTrack: (enabled: boolean) => boolean;
  startScreenShare: () => Promise<{ stream: MediaStream; isSimulated: boolean }>;
  stopScreenShare: () => void;

  // WebRTC Connection & Auto-Reconnection State
  rtcConnectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';
  rtcIceCandidateCount: number;
  reconnectAttemptCount: number;
  triggerWebRTCReconnect: () => Promise<void>;

  // Toast Feedback System
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning' | 'error', duration?: number) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers, getUserById, updateCurrentUserProfile } = useAuth();

  // Toast Feedback System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, description?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', duration = 3500) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { id, title, description, type, duration };
      setToasts((prev) => [...prev.slice(-4), newToast]);
      playChime('notification');

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // State initialization with localStorage persistence
  const [friendships, setFriendships] = useState<FriendRelationship[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.FRIENDSHIPS);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_FRIENDSHIPS;
  });

  const [rooms, setRooms] = useState<StudyRoom[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.ROOMS);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_ROOMS;
  });

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Media Stream & Permissions State
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharingActive, setIsScreenSharingActive] = useState<boolean>(false);

  const [mediaPermissions, setMediaPermissions] = useState<{
    camera: 'granted' | 'denied' | 'prompt';
    microphone: 'granted' | 'denied' | 'prompt';
  }>({ camera: 'prompt', microphone: 'prompt' });

  // WebRTC Connection & Auto-Reconnection state
  const [rtcConnectionState, setRtcConnectionState] = useState<
    'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'
  >('connected');
  const [rtcIceCandidateCount, setRtcIceCandidateCount] = useState<number>(0);
  const [reconnectAttemptCount, setReconnectAttemptCount] = useState<number>(0);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const isReconnectingRef = useRef<boolean>(false);

  // Query browser permissions for camera and microphone if supported
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'camera' as PermissionName })
        .then((res) => {
          setMediaPermissions((prev) => ({ ...prev, camera: res.state as any }));
          res.onchange = () => {
            setMediaPermissions((prev) => ({ ...prev, camera: res.state as any }));
          };
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((res) => {
          setMediaPermissions((prev) => ({ ...prev, microphone: res.state as any }));
          res.onchange = () => {
            setMediaPermissions((prev) => ({ ...prev, microphone: res.state as any }));
          };
        })
        .catch(() => {});
    }
  }, []);

  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [roomMessages, setRoomMessages] = useState<{ [roomId: string]: RoomChatMessage[] }>({});

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_TASKS;
  });

  const [goals, setGoals] = useState<StudyGoal[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_GOALS;
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_HABITS;
  });

  const [studySessions, setStudySessions] = useState<StudySessionRecord[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });

  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.FEED);
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_FEED;
  });

  // Cross-Tab & WebSockets Real-time Listener
  useEffect(() => {
    if (currentUser) {
      realtimeSync.connect(currentUser.id, currentUser.name, currentUser.avatar);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = realtimeSync.addListener((msg: RealtimeMessage) => {
      const { type, payload } = msg;

      switch (type) {
        case 'room-message': {
          if (payload?.roomId && payload?.message) {
            const rId = payload.roomId;
            const newMsg = payload.message;
            setRoomMessages((prev) => {
              const roomMsgs = prev[rId] || [];
              if (roomMsgs.some((m) => m.id === newMsg.id)) return prev;
              return {
                ...prev,
                [rId]: [...roomMsgs, newMsg],
              };
            });
            playChime('chat');
          }
          break;
        }

        case 'direct-message': {
          if (payload?.message) {
            const newMsg = payload.message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            playChime('chat');
          }
          break;
        }

        case 'participant-update': {
          if (payload?.roomId && payload?.participant) {
            const rId = payload.roomId;
            const pData = payload.participant;
            setRooms((prev) =>
              prev.map((r) => {
                if (r.id === rId) {
                  const newHostId = pData.newHostId || (pData.role === 'host' ? pData.userId : r.hostId);
                  return {
                    ...r,
                    hostId: newHostId,
                    participants: (r.participants || []).map((p) => {
                      if (p.userId === pData.userId) {
                        return { ...p, ...pData, role: pData.role || p.role };
                      }
                      if (pData.role === 'host' && (p.role === 'host' || p.userId === r.hostId)) {
                        return { ...p, role: 'co-host' };
                      }
                      return p;
                    }),
                  };
                }
                return r;
              })
            );
          }
          break;
        }

        case 'room-update': {
          if (payload?.roomId && payload?.updates) {
            const rId = payload.roomId;
            const updates = payload.updates;
            setRooms((prev) =>
              prev.map((r) => {
                if (r.id === rId) {
                  const targetAccessType =
                    updates.rules?.accessType ||
                    (updates.isPrivate ? 'private_passcode' : updates.isPrivate === false ? 'public' : r.rules?.accessType || 'public');

                  const isPrivate = targetAccessType === 'private_passcode' || targetAccessType === 'unlisted';
                  const passcode = targetAccessType === 'private_passcode' ? (updates.passcode || r.passcode || '1234') : undefined;

                  const mergedRules = {
                    ...(r.rules || {
                      micRule: 'always_allowed',
                      cameraRule: 'optional',
                      chatRule: 'free_chat',
                      screenShareRule: 'anyone',
                      accessType: 'public',
                      autoMuteOnJoin: false,
                    }),
                    ...(updates.rules || {}),
                    accessType: targetAccessType,
                  };

                  return {
                    ...r,
                    ...updates,
                    isPrivate,
                    passcode,
                    rules: mergedRules,
                    timer: updates.timer ? { ...(r.timer || {}), ...updates.timer } : r.timer,
                  };
                }
                return r;
              })
            );
          }
          break;
        }

        case 'user-joined-room': {
          if (payload?.roomId && payload?.userId) {
            const rId = payload.roomId;
            const joiningUserId = payload.userId;
            const joiningUserObj = allUsers.find((u) => u.id === joiningUserId) || {
              id: joiningUserId,
              name: payload.userName || 'Study Partner',
              username: payload.userName?.toLowerCase().replace(/\s+/g, '') || 'partner',
              avatar: payload.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              status: 'studying',
            };

            setRooms((prev) =>
              prev.map((r) => {
                if (r.id === rId) {
                  const alreadyIn = (r.participants || []).some((p) => p.userId === joiningUserId);
                  if (alreadyIn) return r;
                  return {
                    ...r,
                    participants: [
                      ...(r.participants || []),
                      {
                        userId: joiningUserId,
                        user: joiningUserObj as any,
                        role: r.hostId === joiningUserId ? 'host' : 'member',
                        joinedAt: Date.now(),
                        isAudioEnabled: true,
                        isVideoEnabled: true,
                        isScreenSharing: false,
                        isSpeaking: false,
                        audioLevel: 10,
                      },
                    ],
                  };
                }
                return r;
              })
            );
          }
          break;
        }

        case 'user-left-room': {
          if (payload?.roomId && payload?.userId) {
            const rId = payload.roomId;
            const leavingUserId = payload.userId;
            setRooms((prev) =>
              prev.map((r) => {
                if (r.id === rId) {
                  return {
                    ...r,
                    participants: (r.participants || []).filter((p) => p.userId !== leavingUserId),
                  };
                }
                return r;
              })
            );
          }
          break;
        }

        case 'note-update': {
          if (payload?.roomId && payload?.note) {
            const rId = payload.roomId;
            const noteData = payload.note;
            setRooms((prev) =>
              prev.map((r) => {
                if (r.id === rId) {
                  const existingNote = r.notes.find((n) => n.id === noteData.id);
                  if (existingNote) {
                    return {
                      ...r,
                      notes: r.notes.map((n) => (n.id === noteData.id ? { ...n, ...noteData } : n)),
                    };
                  } else {
                    return { ...r, notes: [...r.notes, noteData] };
                  }
                }
                return r;
              })
            );
          }
          break;
        }

        case 'timer-update': {
          if (payload?.roomId && payload?.timer) {
            const rId = payload.roomId;
            const timerData = payload.timer;
            setRooms((prev) =>
              prev.map((r) => {
                if (r.id === rId) {
                  return {
                    ...r,
                    timer: { ...r.timer, ...timerData, lastUpdated: Date.now() },
                  };
                }
                return r;
              })
            );
          }
          break;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [allUsers]);

  // Cross-Tab BroadcastChannel synchronization
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('studyspace_sync_bus');
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SYNC_ALL') {
          if (payload.friendships) setFriendships(payload.friendships);
          if (payload.rooms) setRooms(payload.rooms);
          if (payload.messages) setMessages(payload.messages);
          if (payload.notifications) setNotifications(payload.notifications);
          if (payload.feed) setActivityFeed(payload.feed);
        }
      };
    } catch {}

    return () => {
      if (channel) channel.close();
    };
  }, []);

  const broadcastState = useCallback(
    (key: string, data: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        const channel = new BroadcastChannel('studyspace_sync_bus');
        channel.postMessage({
          type: 'SYNC_ALL',
          payload: {
            friendships,
            rooms,
            messages,
            notifications,
            feed: activityFeed,
            [key.replace('studyspace_', '').replace('_v2', '')]: data,
          },
        });
        channel.close();
      } catch {}
    },
    [friendships, rooms, messages, notifications, activityFeed]
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIENDSHIPS, JSON.stringify(friendships));
  }, [friendships]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(studySessions));
  }, [studySessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEED, JSON.stringify(activityFeed));
  }, [activityFeed]);

  // Pomodoro Room Timer Interval Engine
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (!room.timer.isRunning) return room;

          if (room.timer.timeRemainingSeconds <= 1) {
            // Timer completed!
            playChime('timer_complete');

            let nextMode: StudyRoom['timer']['mode'] = 'short_break';
            let nextDuration = room.timer.shortBreakDuration * 60;
            let nextCycle = room.timer.currentCycle;

            if (room.timer.mode === 'pomodoro') {
              if (room.timer.currentCycle >= room.timer.totalCycles) {
                nextMode = 'long_break';
                nextDuration = room.timer.longBreakDuration * 60;
                nextCycle = 1;
              } else {
                nextMode = 'short_break';
                nextDuration = room.timer.shortBreakDuration * 60;
                nextCycle = room.timer.currentCycle + 1;
              }
            } else {
              nextMode = 'pomodoro';
              nextDuration = room.timer.workDuration * 60;
            }

            return {
              ...room,
              timer: {
                ...room.timer,
                mode: nextMode,
                timeRemainingSeconds: nextDuration,
                currentCycle: nextCycle,
                lastUpdated: Date.now(),
              },
            };
          }

          return {
            ...room,
            timer: {
              ...room.timer,
              timeRemainingSeconds: room.timer.timeRemainingSeconds - 1,
              lastUpdated: Date.now(),
            },
          };
        })
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // --- FRIENDSHIP & RELATIONSHIP LOGIC ---

  const getFriendshipStatus = useCallback(
    (targetUserId: string): FriendshipStatus => {
      if (!currentUser || currentUser.id === targetUserId) return 'none';

      const rel = friendships.find(
        (f) =>
          (f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
          (f.userId1 === targetUserId && f.userId2 === currentUser.id)
      );

      if (!rel) return 'none';

      if (rel.status === 'blocked') {
        return rel.actionUserId === currentUser.id ? 'blocked' : 'blocked_by';
      }

      if (rel.status === 'accepted') {
        return 'accepted';
      }

      if (rel.status === 'pending') {
        return rel.actionUserId === currentUser.id ? 'pending_sent' : 'pending_received';
      }

      return 'none';
    },
    [currentUser, friendships]
  );

  const getRelationship = useCallback(
    (userId1OrTarget: string, userId2?: string): FriendshipStatus | 'me' => {
      if (!currentUser) return 'none';
      const targetId = userId2 ? (userId1OrTarget === currentUser.id ? userId2 : userId1OrTarget) : userId1OrTarget;
      if (targetId === currentUser.id) return 'me';
      return getFriendshipStatus(targetId);
    },
    [currentUser, getFriendshipStatus]
  );

  const sendFriendRequest = useCallback(
    (targetUserId: string) => {
      if (!currentUser || currentUser.id === targetUserId) return;

      const existingIndex = friendships.findIndex(
        (f) =>
          (f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
          (f.userId1 === targetUserId && f.userId2 === currentUser.id)
      );

      const newRel: FriendRelationship = {
        id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId1: currentUser.id,
        userId2: targetUserId,
        status: 'pending',
        actionUserId: currentUser.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (existingIndex >= 0) {
        setFriendships((prev) => {
          const next = [...prev];
          next[existingIndex] = newRel;
          return next;
        });
      } else {
        setFriendships((prev) => [...prev, newRel]);
      }

      // Create Notification for target user
      const notif: AppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        recipientId: targetUserId,
        senderId: currentUser.id,
        senderUser: currentUser,
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${currentUser.name} (@${currentUser.username}) sent you a friend request.`,
        timestamp: Date.now(),
        isRead: false,
        actionData: {
          requestId: newRel.id,
          username: currentUser.username,
        },
      };

      setNotifications((prev) => [notif, ...prev]);
      playChime('notification');
    },
    [currentUser, friendships]
  );

  const acceptFriendRequest = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;

      setFriendships((prev) =>
        prev.map((f) => {
          if (
            (f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
            (f.userId1 === targetUserId && f.userId2 === currentUser.id)
          ) {
            return {
              ...f,
              status: 'accepted',
              actionUserId: currentUser.id,
              updatedAt: Date.now(),
            };
          }
          return f;
        })
      );

      // Notify the requester
      const notif: AppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        recipientId: targetUserId,
        senderId: currentUser.id,
        senderUser: currentUser,
        type: 'friend_accepted',
        title: 'Friend Request Accepted 🎉',
        message: `${currentUser.name} (@${currentUser.username}) accepted your friend request! You can now chat and study together.`,
        timestamp: Date.now(),
        isRead: false,
        actionData: {
          username: currentUser.username,
        },
      };

      setNotifications((prev) => [notif, ...prev]);
      playChime('notification');
    },
    [currentUser]
  );

  const declineFriendRequest = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;
      setFriendships((prev) =>
        prev.filter(
          (f) =>
            !(
              ((f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
                (f.userId1 === targetUserId && f.userId2 === currentUser.id)) &&
              f.status === 'pending'
            )
        )
      );
    },
    [currentUser]
  );

  const cancelFriendRequest = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;
      setFriendships((prev) =>
        prev.filter(
          (f) =>
            !(
              ((f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
                (f.userId1 === targetUserId && f.userId2 === currentUser.id)) &&
              f.status === 'pending' &&
              f.actionUserId === currentUser.id
            )
        )
      );
    },
    [currentUser]
  );

  const removeFriend = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;
      setFriendships((prev) =>
        prev.filter(
          (f) =>
            !(
              (f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
              (f.userId1 === targetUserId && f.userId2 === currentUser.id)
            )
        )
      );
    },
    [currentUser]
  );

  const blockUser = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;
      setFriendships((prev) => {
        const filtered = prev.filter(
          (f) =>
            !(
              (f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
              (f.userId1 === targetUserId && f.userId2 === currentUser.id)
            )
        );
        return [
          ...filtered,
          {
            id: `rel_block_${Date.now()}`,
            userId1: currentUser.id,
            userId2: targetUserId,
            status: 'blocked',
            actionUserId: currentUser.id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];
      });
    },
    [currentUser]
  );

  const unblockUser = useCallback(
    (targetUserId: string) => {
      if (!currentUser) return;
      setFriendships((prev) =>
        prev.filter(
          (f) =>
            !(
              ((f.userId1 === currentUser.id && f.userId2 === targetUserId) ||
                (f.userId1 === targetUserId && f.userId2 === currentUser.id)) &&
              f.status === 'blocked' &&
              f.actionUserId === currentUser.id
            )
        )
      );
    },
    [currentUser]
  );

  // Dynamically compute users study status from rooms to ensure friend status is completely dynamic in real time
  const allUsersWithRoomStatus = useMemo(() => {
    return allUsers.map((u) => {
      // Check if user is in any active room
      const foundRoom = rooms.find((r) => r.participants?.some((p) => p.userId === u.id));
      if (foundRoom) {
        return {
          ...u,
          status: 'studying' as const,
          currentRoomId: foundRoom.id,
          currentRoomTitle: foundRoom.title,
        };
      }
      return {
        ...u,
        status: u.id === currentUser?.id ? (u.status === 'studying' ? 'online' : u.status) : (u.status === 'studying' ? 'online' : u.status),
        currentRoomId: null,
        currentRoomTitle: null,
      };
    });
  }, [allUsers, rooms, currentUser]);

  const getFriends = useCallback(
    (userId = currentUser?.id): UserProfile[] => {
      if (!userId) return [];
      const accepted = friendships.filter(
        (f) => (f.userId1 === userId || f.userId2 === userId) && f.status === 'accepted'
      );
      const friendIds = accepted.map((f) => (f.userId1 === userId ? f.userId2 : f.userId1));
      return allUsersWithRoomStatus.filter((u) => friendIds.includes(u.id));
    },
    [currentUser, friendships, allUsersWithRoomStatus]
  );

  const getPendingReceived = useCallback(
    (userId = currentUser?.id) => {
      if (!userId) return [];
      return friendships
        .filter((f) => f.status === 'pending' && f.actionUserId !== userId && (f.userId1 === userId || f.userId2 === userId))
        .map((f) => {
          const senderId = f.actionUserId;
          const user = getUserById(senderId) || allUsersWithRoomStatus.find((u) => u.id === senderId)!;
          return { relationship: f, user };
        })
        .filter((item) => !!item.user);
    },
    [currentUser, friendships, getUserById, allUsersWithRoomStatus]
  );

  const getPendingSent = useCallback(
    (userId = currentUser?.id) => {
      if (!userId) return [];
      return friendships
        .filter((f) => f.status === 'pending' && f.actionUserId === userId)
        .map((f) => {
          const receiverId = f.userId1 === userId ? f.userId2 : f.userId1;
          const user = getUserById(receiverId) || allUsersWithRoomStatus.find((u) => u.id === receiverId)!;
          return { relationship: f, user };
        })
        .filter((item) => !!item.user);
    },
    [currentUser, friendships, getUserById, allUsersWithRoomStatus]
  );

  const getBlockedUsers = useCallback(
    (userId = currentUser?.id): UserProfile[] => {
      if (!userId) return [];
      const blocked = friendships.filter(
        (f) => f.status === 'blocked' && f.actionUserId === userId
      );
      const targetIds = blocked.map((f) => (f.userId1 === userId ? f.userId2 : f.userId1));
      return allUsersWithRoomStatus.filter((u) => targetIds.includes(u.id));
    },
    [currentUser, friendships, allUsersWithRoomStatus]
  );

  const getMutualFriends = useCallback(
    (userId1: string, userId2: string): UserProfile[] => {
      const friends1 = getFriends(userId1).map((u) => u.id);
      const friends2 = getFriends(userId2).map((u) => u.id);
      const mutualIds = friends1.filter((id) => friends2.includes(id));
      return allUsersWithRoomStatus.filter((u) => mutualIds.includes(u.id));
    },
    [getFriends, allUsersWithRoomStatus]
  );

  // --- DIRECT MESSAGES ---

  const conversations = React.useMemo<Conversation[]>(() => {
    if (!currentUser) return [];

    const map = new Map<string, DirectMessage[]>();

    messages.forEach((msg) => {
      const pair = [msg.senderId, msg.receiverId].sort();
      const convId = `conv_${pair[0]}_${pair[1]}`;
      if (!map.has(convId)) {
        map.set(convId, []);
      }
      map.get(convId)!.push(msg);
    });

    const list: Conversation[] = [];

    map.forEach((msgList, convId) => {
      msgList.sort((a, b) => a.timestamp - b.timestamp);
      const last = msgList[msgList.length - 1];
      const p1 = last.senderId;
      const p2 = last.receiverId;

      const unreadCount: { [uid: string]: number } = { [p1]: 0, [p2]: 0 };
      msgList.forEach((m) => {
        if (!m.isRead) {
          unreadCount[m.receiverId] = (unreadCount[m.receiverId] || 0) + 1;
        }
      });

      list.push({
        id: convId,
        participants: [p1, p2].sort() as [string, string],
        lastMessage: last,
        unreadCount,
        updatedAt: last.timestamp,
      });
    });

    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [currentUser, messages]);

  const getConversationsForUser = useCallback(
    (userId = currentUser?.id) => {
      if (!userId) return [];
      return conversations
        .filter((c) => c.participants.includes(userId))
        .map((c) => {
          const otherId = c.participants.find((id) => id !== userId)!;
          const otherUser = getUserById(otherId) || allUsers.find((u) => u.id === otherId)!;
          return { conversation: c, otherUser };
        })
        .filter((item) => !!item.otherUser);
    },
    [currentUser, conversations, getUserById, allUsers]
  );

  const getMessagesForConversation = useCallback(
    (conversationId: string): DirectMessage[] => {
      return messages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.timestamp - b.timestamp);
    },
    [messages]
  );

  const getDirectMessages = useCallback(
    (user1Id: string, user2Id: string): DirectMessage[] => {
      const pair = [user1Id, user2Id].sort();
      const convId = `conv_${pair[0]}_${pair[1]}`;
      return messages
        .filter(
          (m) =>
            m.conversationId === convId ||
            (m.senderId === user1Id && m.receiverId === user2Id) ||
            (m.senderId === user2Id && m.receiverId === user1Id)
        )
        .sort((a, b) => a.timestamp - b.timestamp);
    },
    [messages]
  );

  const sendMessage = useCallback(
    (
      receiverId: string,
      content: string,
      type: 'text' | 'room_invite' | 'note_share' = 'text',
      roomInvite?: { roomId: string; roomCode: string; roomTitle: string; subject: string }
    ) => {
      if (!currentUser || !content.trim()) return;

      const pair = [currentUser.id, receiverId].sort();
      const convId = `conv_${pair[0]}_${pair[1]}`;

      const newMsg: DirectMessage = {
        id: `dm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        conversationId: convId,
        senderId: currentUser.id,
        receiverId,
        content: content.trim(),
        timestamp: Date.now(),
        isRead: false,
        type,
        roomInvite,
      };

      setMessages((prev) => [...prev, newMsg]);

      // Broadcast over real-time multi-user service
      realtimeSync.sendDirectMessage(receiverId, newMsg);

      // Notification for receiver
      const notif: AppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        recipientId: receiverId,
        senderId: currentUser.id,
        senderUser: currentUser,
        type: type === 'room_invite' ? 'room_invite' : 'direct_message',
        title: type === 'room_invite' ? 'Study Room Invitation 📚' : `Message from ${currentUser.name}`,
        message: type === 'room_invite' ? `${currentUser.name} invited you to study in "${roomInvite?.roomTitle}".` : content.trim(),
        timestamp: Date.now(),
        isRead: false,
        actionData: {
          conversationId: convId,
          roomId: roomInvite?.roomId,
          roomCode: roomInvite?.roomCode,
          roomTitle: roomInvite?.roomTitle,
          username: currentUser.username,
        },
      };

      setNotifications((prev) => [notif, ...prev]);
      playChime('notification');
    },
    [currentUser]
  );

  const markConversationAsRead = useCallback(
    (conversationId: string) => {
      if (!currentUser) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.conversationId === conversationId && m.receiverId === currentUser.id && !m.isRead) {
            return { ...m, isRead: true };
          }
          return m;
        })
      );
    },
    [currentUser]
  );

  const markDirectMessagesAsRead = useCallback(
    (otherUserId: string) => {
      if (!currentUser) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.senderId === otherUserId && m.receiverId === currentUser.id && !m.isRead) {
            return { ...m, isRead: true };
          }
          return m;
        })
      );
    },
    [currentUser]
  );

  const getUnreadMessagesCount = useCallback(
    (userId = currentUser?.id) => {
      if (!userId) return 0;
      return messages.filter((m) => m.receiverId === userId && !m.isRead).length;
    },
    [currentUser, messages]
  );

  // --- STUDY ROOMS ---

  const activeRoom = React.useMemo(() => {
    if (activeRoomId) {
      const found = rooms.find((r) => r.id === activeRoomId);
      if (found) return found;
    }
    return rooms[0] || null;
  }, [activeRoomId, rooms]);

  const sendRoomMessage = useCallback(
    (roomId: string, content: string, type: RoomChatMessage['type'] = 'chat') => {
      if (!currentUser || !content.trim()) return;

      // Check for user mentions
      const mentionMatches = content.match(/@(\w+)/g);
      const mentions = mentionMatches ? mentionMatches.map((m) => m.replace('@', '')) : [];

      const newMsg: RoomChatMessage = {
        id: `rm_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        roomId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderUsername: currentUser.username,
        senderAvatar: currentUser.avatar,
        content: content.trim(),
        timestamp: Date.now(),
        type,
        mentions,
      };

      setRoomMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMsg],
      }));

      // Broadcast over real-time multi-user service
      realtimeSync.sendRoomMessage(roomId, newMsg);

      // Notify mentioned users
      if (mentions.length > 0) {
        mentions.forEach((uname) => {
          const target = allUsers.find((u) => u.username.toLowerCase() === uname.toLowerCase());
          if (target && target.id !== currentUser.id) {
            const notif: AppNotification = {
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              recipientId: target.id,
              senderId: currentUser.id,
              senderUser: currentUser,
              type: 'mention',
              title: 'Mentioned in Study Room',
              message: `${currentUser.name} mentioned you in study room chat: "${content.slice(0, 80)}"`,
              timestamp: Date.now(),
              isRead: false,
              actionData: { roomId, username: currentUser.username },
            };
            setNotifications((prev) => [notif, ...prev]);
          }
        });
      }
    },
    [currentUser, allUsers]
  );

  const createRoom = useCallback(
    (data: {
      title: string;
      description: string;
      subject: string;
      category: StudyRoom['category'];
      isPrivate: boolean;
      passcode?: string;
      maxParticipants: number;
      theme: RoomTheme;
      workDuration?: number;
      shortBreakDuration?: number;
      rules?: RoomRules;
    }): StudyRoom => {
      if (!currentUser) throw new Error('Must be logged in to create room');

      const roomCode = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
      const isPriv = data.isPrivate || data.rules?.accessType === 'private_passcode' || data.rules?.accessType === 'unlisted';

      const initialRules: RoomRules = {
        micRule: 'always_allowed',
        cameraRule: 'optional',
        chatRule: 'free_chat',
        screenShareRule: 'anyone',
        accessType: isPriv ? (data.rules?.accessType || 'private_passcode') : 'public',
        autoMuteOnJoin: false,
        ...(data.rules || {}),
      };

      const newRoom: StudyRoom = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        code: roomCode,
        title: data.title.trim(),
        description: data.description.trim(),
        subject: data.subject.trim(),
        category: data.category,
        hostId: currentUser.id,
        isPrivate: isPriv,
        passcode: data.passcode,
        rules: initialRules,
        maxParticipants: data.maxParticipants || 8,
        theme: data.theme || 'cozy_library',
        timer: {
          mode: 'pomodoro',
          workDuration: data.workDuration || 25,
          shortBreakDuration: data.shortBreakDuration || 5,
          longBreakDuration: 15,
          timeRemainingSeconds: (data.workDuration || 25) * 60,
          isRunning: false,
          currentCycle: 1,
          totalCycles: 4,
          lastUpdated: Date.now(),
        },
        notes: [
          {
            id: `note_${Date.now()}`,
            roomId: '',
            title: `${data.subject} - Session Notes`,
            content: `### 📚 ${data.title}\n\n- **Host**: ${currentUser.name}\n- **Date**: ${new Date().toLocaleDateString()}\n\nWrite your collaborative notes here...`,
            updatedAt: Date.now(),
            lastEditedBy: currentUser.name,
            tags: [data.subject],
            isPinned: true,
          },
        ],
        participants: [
          {
            userId: currentUser.id,
            user: currentUser,
            role: 'host',
            joinedAt: Date.now(),
            isAudioEnabled: true,
            isVideoEnabled: true,
            isScreenSharing: false,
            isSpeaking: false,
            audioLevel: 10,
          },
        ],
        createdAt: Date.now(),
        activeNow: true,
      };

      newRoom.notes[0].roomId = newRoom.id;

      // Condition: One user can ONLY join ONE room at the same time (remove from all other rooms)
      setRooms((prev) => [
        newRoom,
        ...prev.map((r) => ({
          ...r,
          participants: (r.participants || []).filter((p) => p.userId !== currentUser.id),
        })),
      ]);

      setActiveRoomId(newRoom.id);
      updateCurrentUserProfile({ currentRoomId: newRoom.id, currentRoomTitle: newRoom.title, status: 'studying' });
      playChime('join');

      // Add to activity feed
      const feedItem: ActivityFeedItem = {
        id: `feed_${Date.now()}`,
        userId: currentUser.id,
        user: currentUser,
        type: 'room_created',
        title: `Opened Study Room: ${newRoom.title}`,
        details: `${newRoom.subject} • Join Code: ${newRoom.code}`,
        timestamp: Date.now(),
        likes: [],
        commentsCount: 0,
        privacy: 'public',
      };
      setActivityFeed((prev) => [feedItem, ...prev]);

      return newRoom;
    },
    [currentUser, updateCurrentUserProfile]
  );

  const joinRoom = useCallback(
    (roomIdOrCode: string, passcode?: string): boolean => {
      if (!currentUser) return false;

      const room = rooms.find(
        (r) =>
          r.id.toLowerCase() === roomIdOrCode.toLowerCase() ||
          r.code.toLowerCase() === roomIdOrCode.toLowerCase()
      );

      if (!room) return false;

      const isHost = room.hostId === currentUser.id;
      const isAlreadyMember = (room.participants || []).some((p) => p.userId === currentUser.id);

      const effectiveAccessType = room.rules?.accessType || (room.isPrivate ? 'private_passcode' : 'public');
      const isPasscodeProtected =
        (room.isPrivate || effectiveAccessType === 'private_passcode') &&
        effectiveAccessType !== 'public' &&
        Boolean(room.passcode) &&
        room.passcode.trim() !== '';

      // Validate passcode for private / locked rooms if user is not already host or member
      if (isPasscodeProtected && !isHost && !isAlreadyMember) {
        if (!passcode || passcode.trim() !== room.passcode?.trim()) {
          return false;
        }
      }

      // Validate room capacity
      if (
        room.maxParticipants &&
        (room.participants || []).length >= room.maxParticipants &&
        !isAlreadyMember &&
        !isHost
      ) {
        return false;
      }

      // Condition: One user can ONLY join ONE room at the same time (remove from all other rooms)
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === room.id) {
            const alreadyIn = (r.participants || []).some((p) => p.userId === currentUser.id);
            if (alreadyIn) return r;

            const newParticipant = {
              userId: currentUser.id,
              user: currentUser,
              role: (r.hostId === currentUser.id ? 'host' : 'member') as 'host' | 'member',
              joinedAt: Date.now(),
              isAudioEnabled: true,
              isVideoEnabled: true,
              isScreenSharing: false,
              isSpeaking: false,
              audioLevel: 10,
            };

            return {
              ...r,
              participants: [...(r.participants || []), newParticipant],
            };
          } else {
            // Remove user from any other room they were previously in
            return {
              ...r,
              participants: (r.participants || []).filter((p) => p.userId !== currentUser.id),
            };
          }
        })
      );

      setActiveRoomId(room.id);
      updateCurrentUserProfile({ currentRoomId: room.id, currentRoomTitle: room.title, status: 'studying' });
      playChime('join');

      // Send join event over real-time multi-user service
      realtimeSync.joinRoom(room.id, currentUser.id, currentUser.name, currentUser.avatar);

      // Add system message
      sendRoomMessage(room.id, `${currentUser.name} joined the study room.`, 'system');

      return true;
    },
    [currentUser, rooms, updateCurrentUserProfile, sendRoomMessage]
  );

  const leaveRoom = useCallback(
    (roomId: string) => {
      if (!currentUser) return;

      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === roomId) {
            const remaining = (r.participants || []).filter((p) => p.userId !== currentUser.id);
            let nextHostId = r.hostId;

            // If the departing user was the lead host, automatically transfer lead host to remaining member
            if (r.hostId === currentUser.id && remaining.length > 0) {
              const coHost = remaining.find((p) => p.role === 'co-host');
              const nextHost = coHost || remaining[0];
              nextHostId = nextHost.userId;

              const updatedParticipants = remaining.map((p) =>
                p.userId === nextHostId ? { ...p, role: 'host' as RoomParticipantRole } : p
              );

              realtimeSync.updateParticipant(roomId, {
                userId: nextHostId,
                role: 'host',
                newHostId: nextHostId,
              });

              sendRoomMessage(
                roomId,
                `👑 Lead Host transferred to ${nextHost.user?.name || nextHost.userId} as previous host left.`,
                'system'
              );

              return {
                ...r,
                hostId: nextHostId,
                participants: updatedParticipants,
              };
            }

            return {
              ...r,
              hostId: nextHostId,
              participants: remaining,
            };
          }
          return r;
        })
      );

      if (activeRoomId === roomId) {
        setActiveRoomId(null);
      }

      updateCurrentUserProfile({ currentRoomId: null, currentRoomTitle: null, status: 'online' });
      playChime('leave');
      sendRoomMessage(roomId, `${currentUser.name} left the room.`, 'system');

      // Send leave event over real-time multi-user service
      realtimeSync.leaveRoom(roomId, currentUser.id, currentUser.name);
    },
    [currentUser, activeRoomId, updateCurrentUserProfile]
  );

  const deleteRoom = useCallback(
    (roomId: string) => {
      if (!currentUser) return;
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
      }
      updateCurrentUserProfile({ currentRoomId: null, currentRoomTitle: null, status: 'online' });
    },
    [currentUser, activeRoomId, updateCurrentUserProfile]
  );

  const inviteFriendToRoom = useCallback(
    (roomIdOrTargetUserId: string, optionalTargetUserId?: string) => {
      if (!currentUser) return;
      let targetRoomId = roomIdOrTargetUserId;
      let targetUserId = optionalTargetUserId;

      if (!targetUserId) {
        targetUserId = roomIdOrTargetUserId;
        targetRoomId = activeRoomId || rooms[0]?.id || '';
      }

      const room = rooms.find((r) => r.id === targetRoomId) || rooms.find((r) => r.id === activeRoomId) || rooms[0];
      if (!room || !targetUserId) return;

      // Send direct message with invite card
      sendMessage(
        targetUserId,
        `Hey! Come join my study room: "${room.title}" (${room.subject}). Room code: ${room.code}`,
        'room_invite',
        {
          roomId: room.id,
          roomCode: room.code,
          roomTitle: room.title,
          subject: room.subject,
        }
      );

      // Create notification for invited user
      const notif: AppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        recipientId: targetUserId,
        senderId: currentUser.id,
        senderUser: currentUser,
        type: 'room_invite',
        title: 'Study Room Invite',
        message: `${currentUser.name} invited you to join study room "${room.title}"`,
        timestamp: Date.now(),
        isRead: false,
        actionData: { roomId: room.id, roomCode: room.code, roomTitle: room.title },
      };
      setNotifications((prev) => [notif, ...prev]);

      playChime('notification');
    },
    [currentUser, activeRoomId, rooms, sendMessage]
  );

  const updateRoomTheme = useCallback((roomId: string, theme: RoomTheme) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return { ...r, theme };
        }
        return r;
      })
    );
  }, []);

  const updateRoomSettings = useCallback((roomId: string, updates: Partial<StudyRoom>) => {
    const targetRoomId = roomId || activeRoomId || rooms[0]?.id;
    if (!targetRoomId) return;

    let computedIsPrivate = false;
    let computedPasscode: string | undefined = undefined;
    let updatedRules: RoomCustomRules | undefined = undefined;

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === targetRoomId) {
          // Explicitly calculate desired accessType
          const accessType =
            updates.rules?.accessType !== undefined
              ? updates.rules.accessType
              : updates.isPrivate !== undefined
              ? updates.isPrivate
                ? 'private_passcode'
                : 'public'
              : r.rules?.accessType || (r.isPrivate ? 'private_passcode' : 'public');

          computedIsPrivate = accessType === 'private_passcode' || accessType === 'unlisted';

          computedPasscode =
            accessType === 'private_passcode'
              ? updates.passcode !== undefined && updates.passcode !== ''
                ? updates.passcode
                : r.passcode || '1234'
              : undefined;

          updatedRules = {
            ...(r.rules || {
              micRule: 'always_allowed',
              cameraRule: 'optional',
              chatRule: 'free_chat',
              screenShareRule: 'anyone',
              accessType: 'public',
              autoMuteOnJoin: false,
            }),
            ...(updates.rules || {}),
            accessType,
          };

          return {
            ...r,
            ...updates,
            isPrivate: computedIsPrivate,
            passcode: computedPasscode,
            rules: updatedRules,
          };
        }
        return r;
      })
    );

    const fullUpdates = {
      ...updates,
      isPrivate: computedIsPrivate,
      passcode: computedPasscode,
      rules: updatedRules,
    };

    realtimeSync.updateRoom(targetRoomId, fullUpdates);

    sendRoomMessage(
      targetRoomId,
      `⚙️ Room Access Updated: ${
        computedIsPrivate
          ? `🔒 Private Mode Enabled (${computedPasscode ? 'PIN Protection Active' : 'Unlisted Link'})`
          : '🌐 Public Mode Enabled (Open Access)'
      }.`,
      'system'
    );
  }, [activeRoomId, rooms, sendRoomMessage]);

  const updateParticipantRole = useCallback(
    (roomId: string, targetUserId: string, newRole: RoomParticipantRole): boolean => {
      if (!currentUser) return false;
      const targetRoomId = roomId || activeRoomId || rooms[0]?.id;
      if (!targetRoomId) return false;

      const room = rooms.find((r) => r.id === targetRoomId);
      if (!room) return false;

      const myParticipant = room.participants?.find((p) => p.userId === currentUser.id);
      const isLead = room.hostId === currentUser.id || myParticipant?.role === 'host';
      const isMod = myParticipant?.role === 'co-host';

      if (!isLead && !isMod) {
        return false; // Only host or co-host can manage roles
      }

      // Only Lead Host can transfer or assign Lead Host role
      if (newRole === 'host' && !isLead) {
        return false;
      }

      const targetUserObj = allUsers.find((u) => u.id === targetUserId);

      let nextHostId = room.hostId;
      if (newRole === 'host') {
        nextHostId = targetUserId;
      }

      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === targetRoomId) {
            const currentParticipants = r.participants || [];
            const exists = currentParticipants.some((p) => p.userId === targetUserId);

            let updatedParticipants;
            if (exists) {
              updatedParticipants = currentParticipants.map((p) => {
                if (p.userId === targetUserId) {
                  return { ...p, role: newRole };
                }
                // If transferring host, downgrade existing host(s) to co-host
                if (newRole === 'host' && (p.userId === r.hostId || p.role === 'host')) {
                  return { ...p, role: 'co-host' as RoomParticipantRole };
                }
                return p;
              });
            } else {
              // Dynamically track the newly assigned user
              const newP = {
                userId: targetUserId,
                user: targetUserObj || {
                  id: targetUserId,
                  name: targetUserId,
                  username: targetUserId,
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                  status: 'studying',
                } as any,
                role: newRole,
                joinedAt: Date.now(),
                isAudioEnabled: true,
                isVideoEnabled: true,
                isScreenSharing: false,
                isSpeaking: false,
                audioLevel: 10,
              };

              const mapped = currentParticipants.map((p) => {
                if (newRole === 'host' && (p.userId === r.hostId || p.role === 'host')) {
                  return { ...p, role: 'co-host' as RoomParticipantRole };
                }
                return p;
              });

              updatedParticipants = [...mapped, newP];
            }

            return {
              ...r,
              hostId: nextHostId,
              participants: updatedParticipants,
            };
          }
          return r;
        })
      );

      // Broadcast role update in real-time
      realtimeSync.updateParticipant(targetRoomId, {
        userId: targetUserId,
        role: newRole,
        newHostId: nextHostId,
      });

      // Broadcast system notice
      sendRoomMessage(
        targetRoomId,
        `👑 Role Assigned: ${targetUserObj?.name || targetUserId} is now ${
          newRole === 'host' ? 'Lead Host' : newRole === 'co-host' ? 'Moderator (Co-Host)' : 'Member'
        }.`,
        'system'
      );

      playChime('notification');
      return true;
    },
    [currentUser, activeRoomId, rooms, allUsers, sendRoomMessage]
  );

  const kickParticipant = useCallback(
    (roomId: string, targetUserId: string, reason?: string): boolean => {
      if (!currentUser) return false;
      const targetRoomId = roomId || activeRoomId || rooms[0]?.id;
      if (!targetRoomId) return false;

      const room = rooms.find((r) => r.id === targetRoomId);
      if (!room) return false;

      const myParticipant = room.participants?.find((p) => p.userId === currentUser.id);
      const isLead = room.hostId === currentUser.id || myParticipant?.role === 'host';
      const isMod = myParticipant?.role === 'co-host';

      // Only host or co-host can kick
      if (!isLead && !isMod) {
        return false;
      }

      const targetP = room.participants?.find((p) => p.userId === targetUserId);
      const isTargetLead = room.hostId === targetUserId || targetP?.role === 'host';
      const isTargetMod = targetP?.role === 'co-host';

      // Host cannot be kicked by anyone! Co-host cannot kick another co-host or host!
      if (isTargetLead) {
        return false;
      }
      if (isMod && isTargetMod) {
        return false;
      }

      const targetName = targetP?.user?.name || allUsers.find((u) => u.id === targetUserId)?.name || 'Member';

      // Remove from room
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === targetRoomId) {
            return {
              ...r,
              participants: (r.participants || []).filter((p) => p.userId !== targetUserId),
            };
          }
          return r;
        })
      );

      // If active user is the kicked user, leave
      if (currentUser.id === targetUserId) {
        setActiveRoomId(null);
        updateCurrentUserProfile({ currentRoomId: null, currentRoomTitle: null, status: 'online' });
      }

      // Add system message
      sendRoomMessage(
        targetRoomId,
        `🚪 Moderation: ${targetName} was removed from the room${reason ? ` (${reason})` : ''}.`,
        'system'
      );

      playChime('leave');
      return true;
    },
    [currentUser, activeRoomId, rooms, allUsers, sendRoomMessage, updateCurrentUserProfile]
  );

  const remoteMuteParticipant = useCallback(
    (roomId: string, targetUserId: string, muteType: 'audio' | 'video') => {
      if (!currentUser) return;
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;

      const myParticipant = room.participants.find((p) => p.userId === currentUser.id);
      const isAuth = room.hostId === currentUser.id || myParticipant?.role === 'host' || myParticipant?.role === 'co-host';
      if (!isAuth) return;

      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === roomId) {
            return {
              ...r,
              participants: r.participants.map((p) => {
                if (p.userId === targetUserId) {
                  const newAudioState = muteType === 'audio' ? !p.isAudioEnabled : p.isAudioEnabled;
                  const newVideoState = muteType === 'video' ? !p.isVideoEnabled : p.isVideoEnabled;
                  return {
                    ...p,
                    isAudioEnabled: newAudioState,
                    isVideoEnabled: newVideoState,
                    isSpeaking: newAudioState ? p.isSpeaking : false,
                  };
                }
                return p;
              }),
            };
          }
          return r;
        })
      );

      const targetParticipant = room.participants.find((p) => p.userId === targetUserId);
      const isNowEnabled = muteType === 'audio' ? !targetParticipant?.isAudioEnabled : !targetParticipant?.isVideoEnabled;

      sendRoomMessage(
        roomId,
        `📷 ${muteType === 'audio' ? 'Microphone' : 'Camera'} for ${targetParticipant?.user?.name || 'Member'} was ${isNowEnabled ? 'enabled' : 'disabled'}.`,
        'system'
      );
    },
    [currentUser, rooms, sendRoomMessage]
  );

  const updateRoomTimer = useCallback((roomId: string, updates: Partial<StudyRoom['timer']>) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            timer: { ...r.timer, ...updates, lastUpdated: Date.now() },
          };
        }
        return r;
      })
    );

    // Broadcast timer update over real-time multi-user service
    realtimeSync.updateTimer(roomId, updates);
  }, []);

  const updateParticipantMedia = useCallback(
    (
      roomId: string,
      userId: string,
      updates: {
        isAudioEnabled?: boolean;
        isVideoEnabled?: boolean;
        isScreenSharing?: boolean;
        isSpeaking?: boolean;
        audioLevel?: number;
      }
    ) => {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === roomId) {
            return {
              ...r,
              participants: r.participants.map((p) => {
                if (p.userId === userId) {
                  return { ...p, ...updates };
                }
                return p;
              }),
            };
          }
          return r;
        })
      );

      // Broadcast participant media update over real-time multi-user service
      realtimeSync.updateParticipant(roomId, { userId, ...updates });
    },
    []
  );

  const requestUserMedia = useCallback(
    async (options?: { video?: boolean; audio?: boolean }) => {
      const wantVideo = options?.video !== false;
      const wantAudio = options?.audio !== false;

      const result = await mediaService.startCameraAndMic(true, wantVideo, wantAudio);
      setLocalMediaStream(result.stream);

      if (!result.isSimulated) {
        setMediaPermissions({
          camera: wantVideo ? 'granted' : 'prompt',
          microphone: wantAudio ? 'granted' : 'prompt',
        });
      } else if (result.error) {
        setMediaPermissions((prev) => ({
          camera: result.error?.includes('Camera') ? 'denied' : prev.camera,
          microphone: result.error?.includes('Microphone') ? 'denied' : prev.microphone,
        }));
      }

      if (activeRoomId && currentUser) {
        const hasVideoTrack = result.stream.getVideoTracks().some((t) => t.enabled);
        const hasAudioTrack = result.stream.getAudioTracks().some((t) => t.enabled);
        updateParticipantMedia(activeRoomId, currentUser.id, {
          isVideoEnabled: hasVideoTrack,
          isAudioEnabled: hasAudioTrack,
        });
      }

      return result;
    },
    [activeRoomId, currentUser, updateParticipantMedia]
  );

  const stopUserMedia = useCallback(() => {
    mediaService.stopCameraAndMic();
    setLocalMediaStream(null);
    if (activeRoomId && currentUser) {
      updateParticipantMedia(activeRoomId, currentUser.id, {
        isVideoEnabled: false,
        isAudioEnabled: false,
        isSpeaking: false,
      });
    }
  }, [activeRoomId, currentUser, updateParticipantMedia]);

  const toggleLocalVideoTrack = useCallback(
    (enabled: boolean) => {
      const res = mediaService.toggleVideo(enabled);
      if (activeRoomId && currentUser) {
        updateParticipantMedia(activeRoomId, currentUser.id, { isVideoEnabled: res });
      }
      return res;
    },
    [activeRoomId, currentUser, updateParticipantMedia]
  );

  const toggleLocalAudioTrack = useCallback(
    (enabled: boolean) => {
      const res = mediaService.toggleAudio(enabled);
      if (activeRoomId && currentUser) {
        updateParticipantMedia(activeRoomId, currentUser.id, {
          isAudioEnabled: res,
          isSpeaking: res ? undefined : false,
        });
      }
      return res;
    },
    [activeRoomId, currentUser, updateParticipantMedia]
  );

  // Screen Sharing Management
  const startScreenShare = useCallback(async () => {
    const result = await mediaService.startScreenShare(true);
    setLocalScreenStream(result.stream);
    setIsScreenSharingActive(true);

    const videoTrack = result.stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        stopScreenShare();
      };
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.addTrack(videoTrack, result.stream);
        } catch {}
      }
    }

    if (activeRoomId && currentUser) {
      updateParticipantMedia(activeRoomId, currentUser.id, {
        isScreenSharing: true,
      });
      sendRoomMessage(activeRoomId, `🖥️ ${currentUser.name} started sharing their screen.`, 'system');
    }

    return result;
  }, [activeRoomId, currentUser, updateParticipantMedia, sendRoomMessage]);

  const stopScreenShare = useCallback(() => {
    mediaService.stopScreenShare();
    setLocalScreenStream(null);
    setIsScreenSharingActive(false);

    if (activeRoomId && currentUser) {
      updateParticipantMedia(activeRoomId, currentUser.id, {
        isScreenSharing: false,
      });
      sendRoomMessage(activeRoomId, `🛑 ${currentUser.name} stopped screen sharing.`, 'system');
    }
  }, [activeRoomId, currentUser, updateParticipantMedia, sendRoomMessage]);

  // WebRTC Peer Connection Engine & Auto-Reconnection Handler
  const createWebRTCPeerConnection = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.RTCPeerConnection) {
        return null;
      }

      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch {}
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      });

      peerConnectionRef.current = pc;
      setRtcConnectionState('connecting');

      if (localMediaStream) {
        localMediaStream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, localMediaStream);
          } catch {}
        });
      }

      if (localScreenStream) {
        localScreenStream.getTracks().forEach((track) => {
          try {
            pc.addTrack(track, localScreenStream);
          } catch {}
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          setRtcIceCandidateCount((prev) => prev + 1);
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === 'connected') {
          setRtcConnectionState('connected');
          setReconnectAttemptCount(0);
          isReconnectingRef.current = false;
        } else if (state === 'connecting') {
          setRtcConnectionState('connecting');
        } else if (state === 'disconnected' || state === 'failed') {
          setRtcConnectionState('reconnecting');
          triggerAutoReconnect();
        }
      };

      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState;
        if (iceState === 'disconnected' || iceState === 'failed') {
          setRtcConnectionState('reconnecting');
          triggerAutoReconnect();
        } else if (iceState === 'connected' || iceState === 'completed') {
          setRtcConnectionState('connected');
          setReconnectAttemptCount(0);
          isReconnectingRef.current = false;
        }
      };

      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          setRtcConnectionState('connected');
        })
        .catch(() => {});

      return pc;
    } catch (e) {
      console.warn('WebRTC peer connection setup:', e);
      return null;
    }
  }, [localMediaStream, localScreenStream]);

  // Exponential Backoff Auto-Reconnection Handler
  const triggerAutoReconnect = useCallback(async () => {
    if (isReconnectingRef.current) return;
    isReconnectingRef.current = true;

    setReconnectAttemptCount((prevAttempt) => {
      const nextAttempt = prevAttempt + 1;
      const backoffDelay = Math.min(5000, Math.pow(1.5, nextAttempt) * 1000);

      if (activeRoomId) {
        sendRoomMessage(
          activeRoomId,
          `⚡ Network connection drop detected. Auto-reconnecting WebRTC stream (Attempt ${nextAttempt}/5)...`,
          'system'
        );
      }

      setTimeout(() => {
        try {
          if (peerConnectionRef.current && typeof peerConnectionRef.current.restartIce === 'function') {
            peerConnectionRef.current.restartIce();
          } else {
            createWebRTCPeerConnection();
          }

          if (peerConnectionRef.current) {
            peerConnectionRef.current
              .createOffer({ iceRestart: true })
              .then((offer) => peerConnectionRef.current?.setLocalDescription(offer))
              .then(() => {
                setRtcConnectionState('connected');
                isReconnectingRef.current = false;
                if (activeRoomId) {
                  sendRoomMessage(activeRoomId, '✅ WebRTC peer connection successfully restored!', 'system');
                }
              })
              .catch(() => {
                isReconnectingRef.current = false;
              });
          }
        } catch {
          isReconnectingRef.current = false;
        }
      }, backoffDelay);

      return nextAttempt;
    });
  }, [activeRoomId, createWebRTCPeerConnection, sendRoomMessage]);

  const triggerWebRTCReconnect = useCallback(async () => {
    setRtcConnectionState('reconnecting');
    await triggerAutoReconnect();
  }, [triggerAutoReconnect]);

  // Initialize WebRTC Peer Connection
  useEffect(() => {
    createWebRTCPeerConnection();
    return () => {
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch {}
      }
    };
  }, []);

  const addOrUpdateRoomNote = useCallback(
    (roomId: string, note: Omit<RoomNote, 'id' | 'updatedAt' | 'lastEditedBy'> & { id?: string }) => {
      if (!currentUser) return;
      let finalNote: RoomNote | null = null;

      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === roomId) {
            const existing = r.notes.find((n) => n.id === note.id);
            if (existing) {
              finalNote = {
                ...existing,
                title: note.title,
                content: note.content,
                tags: note.tags,
                isPinned: note.isPinned,
                updatedAt: Date.now(),
                lastEditedBy: currentUser.name,
              };
              return {
                ...r,
                notes: r.notes.map((n) => (n.id === note.id ? finalNote! : n)),
              };
            } else {
              finalNote = {
                id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                roomId,
                title: note.title,
                content: note.content,
                tags: note.tags || [],
                isPinned: note.isPinned || false,
                updatedAt: Date.now(),
                lastEditedBy: currentUser.name,
              };
              return { ...r, notes: [...r.notes, finalNote] };
            }
          }
          return r;
        })
      );

      if (finalNote) {
        realtimeSync.updateNote(roomId, finalNote);
      }
    },
    [currentUser]
  );

  const deleteRoomNote = useCallback((roomId: string, noteId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return { ...r, notes: r.notes.filter((n) => n.id !== noteId) };
        }
        return r;
      })
    );
  }, []);

  // --- NOTIFICATIONS ---

  const unreadNotifCount = React.useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter((n) => n.recipientId === currentUser.id && !n.isRead).length;
  }, [currentUser, notifications]);

  const markNotificationAsRead = useCallback((notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.recipientId === currentUser.id ? { ...n, isRead: true } : n))
    );
  }, [currentUser]);

  const deleteNotification = useCallback((notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
  }, []);

  // --- PRODUCTIVITY: TASKS, GOALS, HABITS, SESSIONS ---

  const addTask = useCallback(
    (taskData: Omit<TaskItem, 'id' | 'userId' | 'createdAt'>) => {
      if (!currentUser) return;
      const newTask: TaskItem = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: currentUser.id,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [currentUser]
  );

  const updateTask = useCallback((taskId: string, updates: Partial<TaskItem>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const addGoal = useCallback(
    (goalData: Omit<StudyGoal, 'id' | 'userId' | 'createdAt'>) => {
      if (!currentUser) return;
      const newGoal: StudyGoal = {
        ...goalData,
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: currentUser.id,
        createdAt: Date.now(),
      };
      setGoals((prev) => [newGoal, ...prev]);
    },
    [currentUser]
  );

  const updateGoal = useCallback((goalId: string, updates: Partial<StudyGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g))
    );
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  const toggleHabitDate = useCallback((habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const exists = h.completedDates.includes(dateStr);
          const nextDates = exists
            ? h.completedDates.filter((d) => d !== dateStr)
            : [...h.completedDates, dateStr];

          return {
            ...h,
            completedDates: nextDates,
            streak: nextDates.length,
          };
        }
        return h;
      })
    );
  }, []);

  const addHabit = useCallback(
    (habitData: Omit<HabitItem, 'id' | 'userId' | 'streak' | 'completedDates' | 'createdAt'>) => {
      if (!currentUser) return;
      const newHabit: HabitItem = {
        ...habitData,
        id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: currentUser.id,
        streak: 0,
        completedDates: [],
        createdAt: Date.now(),
      };
      setHabits((prev) => [newHabit, ...prev]);
    },
    [currentUser]
  );

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }, []);

  const logStudySession = useCallback(
    (sessionData: Omit<StudySessionRecord, 'id' | 'userId' | 'completedAt'>) => {
      if (!currentUser) return;
      const newSession: StudySessionRecord = {
        ...sessionData,
        id: `sess_${Date.now()}`,
        userId: currentUser.id,
        completedAt: Date.now(),
      };
      setStudySessions((prev) => [newSession, ...prev]);

      // Update user stats
      const hours = sessionData.durationMinutes / 60;
      updateCurrentUserProfile({
        studyStats: {
          ...currentUser.studyStats,
          totalHours: Number((currentUser.studyStats.totalHours + hours).toFixed(1)),
          weeklyHours: Number((currentUser.studyStats.weeklyHours + hours).toFixed(1)),
          completedSessions: currentUser.studyStats.completedSessions + 1,
          xp: currentUser.studyStats.xp + Math.round(sessionData.durationMinutes * 5),
        },
      });

      // Add to feed
      const feedItem: ActivityFeedItem = {
        id: `feed_${Date.now()}`,
        userId: currentUser.id,
        user: currentUser,
        type: 'study_session_completed',
        title: `Logged ${sessionData.durationMinutes} mins of study! ⏱️`,
        details: `${sessionData.subject} • ${sessionData.sessionType}`,
        timestamp: Date.now(),
        likes: [],
        commentsCount: 0,
        privacy: 'public',
      };
      setActivityFeed((prev) => [feedItem, ...prev]);
    },
    [currentUser, updateCurrentUserProfile]
  );

  // --- ACTIVITY FEED ---

  const toggleLikeActivity = useCallback(
    (activityId: string) => {
      if (!currentUser) return;
      setActivityFeed((prev) =>
        prev.map((item) => {
          if (item.id === activityId) {
            const hasLiked = item.likes.includes(currentUser.id);
            return {
              ...item,
              likes: hasLiked
                ? item.likes.filter((id) => id !== currentUser.id)
                : [...item.likes, currentUser.id],
            };
          }
          return item;
        })
      );
    },
    [currentUser]
  );

  const addActivity = useCallback(
    (activityData: Omit<ActivityFeedItem, 'id' | 'userId' | 'user' | 'timestamp' | 'likes' | 'commentsCount'>) => {
      if (!currentUser) return;
      const newFeed: ActivityFeedItem = {
        ...activityData,
        id: `feed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: currentUser.id,
        user: currentUser,
        timestamp: Date.now(),
        likes: [],
        commentsCount: 0,
      };
      setActivityFeed((prev) => [newFeed, ...prev]);
    },
    [currentUser]
  );

  return (
    <AppContext.Provider
      value={{
        getFriendshipStatus,
        getRelationship,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        cancelFriendRequest,
        removeFriend,
        unfriendUser: removeFriend,
        blockUser,
        unblockUser,
        getFriends,
        getPendingReceived,
        getPendingSent,
        getBlockedUsers,
        getMutualFriends,
        conversations,
        getConversationsForUser,
        getMessagesForConversation,
        getDirectMessages,
        sendMessage,
        sendDirectMessage: sendMessage,
        markConversationAsRead,
        markDirectMessagesAsRead,
        getUnreadMessagesCount,
        rooms,
        activeRoomId,
        activeRoom,
        createRoom,
        joinRoom,
        leaveRoom,
        deleteRoom,
        inviteFriendToRoom,
        updateRoomTheme,
        updateRoomTimer,
        updateRoomSettings,
        kickParticipant,
        updateParticipantRole,
        remoteMuteParticipant,
        updateParticipantMedia,
        roomMessages,
        sendRoomMessage,
        addOrUpdateRoomNote,
        deleteRoomNote,
        notifications,
        unreadNotifCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        habits,
        toggleHabitDate,
        addHabit,
        deleteHabit,
        studySessions,
        logStudySession,
        activityFeed,
        toggleLikeActivity,
        addActivity,
        localMediaStream,
        localScreenStream,
        isScreenSharingActive,
        mediaPermissions,
        requestUserMedia,
        stopUserMedia,
        toggleLocalVideoTrack,
        toggleLocalAudioTrack,
        startScreenShare,
        stopScreenShare,
        rtcConnectionState,
        rtcIceCandidateCount,
        reconnectAttemptCount,
        triggerWebRTCReconnect,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
