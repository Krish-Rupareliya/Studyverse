export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'blocked' | 'blocked_by';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface UserProfile {
  id: string;
  username: string; // unique, e.g. "alex_study"
  name: string;
  avatar: string;
  banner?: string;
  bio: string;
  university: string;
  major: string;
  year: string;
  joinedDate?: string;
  status: 'online' | 'studying' | 'away' | 'offline';
  currentRoomId?: string | null;
  currentRoomTitle?: string | null;
  lastSeen: number; // timestamp
  studyStats: {
    totalHours: number;
    weeklyHours: number;
    completedSessions: number;
    streakDays: number;
    level: number;
    xp: number;
    focusScore: number;
  };
  interests: string[];
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }[];
  privacySettings: {
    showStats: 'public' | 'friends_only' | 'private';
    showActivity: 'public' | 'friends_only' | 'private';
    allowDirectMessages: 'everyone' | 'friends_only';
    allowRoomInvites: 'everyone' | 'friends_only';
  };
}

export interface FriendRelationship {
  id: string;
  userId1: string;
  userId2: string;
  status: 'pending' | 'accepted' | 'blocked';
  actionUserId: string; // user who initiated the latest status change
  createdAt: number;
  updatedAt: number;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  type?: 'text' | 'room_invite' | 'note_share';
  roomInvite?: {
    roomId: string;
    roomCode: string;
    roomTitle: string;
    subject: string;
  };
}

export interface Conversation {
  id: string;
  participants: [string, string]; // two user IDs
  lastMessage?: DirectMessage;
  unreadCount: {
    [userId: string]: number;
  };
  updatedAt: number;
}

export type RoomParticipantRole = 'host' | 'co-host' | 'member' | 'observer';

export interface RoomParticipant {
  userId: string;
  user: UserProfile;
  role: RoomParticipantRole;
  joinedAt: number;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  pinned?: boolean;
}

export interface RoomChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  senderAvatar: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'system' | 'timer_event' | 'note_action';
  mentions?: string[]; // array of usernames
}

export interface RoomNote {
  id: string;
  roomId: string;
  title: string;
  content: string;
  updatedAt: number;
  lastEditedBy: string;
  tags: string[];
  isPinned: boolean;
}

export type RoomTheme = 'cozy_library' | 'lofi_cafe' | 'midnight_tokyo' | 'nature_forest' | 'minimal_slate' | 'cyber_grid';

export interface RoomCustomRules {
  micRule: 'always_allowed' | 'break_only' | 'host_only' | 'push_to_talk';
  cameraRule: 'optional' | 'recommended' | 'strictly_required';
  chatRule: 'free_chat' | 'break_only' | 'slow_mode' | 'disabled';
  screenShareRule: 'anyone' | 'host_cohost_only' | 'disabled';
  accessType: 'public' | 'unlisted' | 'private_passcode' | 'knock_to_enter';
  autoMuteOnJoin: boolean;
  targetFocusHours?: number;
  sessionMilestoneTopic?: string;
}

export type RoomRules = RoomCustomRules;

export interface StudyRoom {
  id: string;
  code: string; // e.g. "ROOM-4821"
  title: string;
  description: string;
  subject: string;
  category: 'Computer Science' | 'Medical & Bio' | 'Math & Physics' | 'Law & Humanities' | 'Language & Arts' | 'General Focus';
  hostId: string;
  isPrivate: boolean;
  passcode?: string;
  maxParticipants: number;
  tags?: string[];
  participants: RoomParticipant[];
  theme: RoomTheme;
  rules?: RoomCustomRules;
  timer: {
    mode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch';
    workDuration: number; // minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    timeRemainingSeconds: number;
    isRunning: boolean;
    currentCycle: number;
    totalCycles: number;
    lastUpdated: number;
    timeLeft?: number;
    focusDuration?: number;
    breakDuration?: number;
  };
  notes: RoomNote[];
  createdAt: number;
  activeNow: boolean;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderUser?: UserProfile;
  type: 'friend_request' | 'friend_accepted' | 'direct_message' | 'room_invite' | 'room_invite_accepted' | 'mention' | 'achievement' | 'streak_reminder';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  actionData?: {
    requestId?: string;
    roomId?: string;
    roomCode?: string;
    roomTitle?: string;
    conversationId?: string;
    username?: string;
  };
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  subject: string;
  dueDate?: string;
  estimatedMinutes?: number;
  createdAt: number;
}

export interface StudyGoal {
  id: string;
  userId: string;
  title: string;
  subject: string;
  targetHours: number;
  currentHours: number;
  deadline: string;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  createdAt: number;
}

export interface HabitItem {
  id: string;
  userId: string;
  title: string;
  frequency: 'daily' | 'weekdays' | 'weekends';
  streak: number;
  completedDates: string[]; // YYYY-MM-DD
  icon: string;
  createdAt: number;
}

export interface StudySessionRecord {
  id: string;
  userId: string;
  roomId?: string;
  roomTitle?: string;
  subject: string;
  durationMinutes: number;
  completedAt: number;
  sessionType: 'pomodoro' | 'deep_work' | 'group_study';
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  user: UserProfile;
  type: 'study_session_completed' | 'room_created' | 'streak_milestone' | 'achievement_unlocked' | 'note_shared';
  title: string;
  details: string;
  timestamp: number;
  likes: string[]; // array of userIds
  commentsCount: number;
  privacy: 'public' | 'friends_only';
}

export interface Flashcard {
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}
