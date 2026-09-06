import { UserProfile, StudyRoom, FriendRelationship, DirectMessage, AppNotification, TaskItem, StudyGoal, HabitItem, ActivityFeedItem } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_alex',
    username: 'alex_study',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80',
    bio: 'CS & AI @ UC Berkeley. Currently prepping for Algorithms & Machine Learning finals. Always down for 50/10 Pomodoro sessions! 💻 ☕',
    university: 'UC Berkeley',
    major: 'Computer Science & Data Science',
    year: 'Junior (Class of 2027)',
    joinedDate: 'September 2024',
    status: 'online',
    currentRoomId: 'room_cs61a',
    currentRoomTitle: 'CS61A Algorithms & System Design',
    lastSeen: Date.now(),
    studyStats: {
      totalHours: 142,
      weeklyHours: 18.5,
      completedSessions: 84,
      streakDays: 12,
      level: 7,
      xp: 3450,
      focusScore: 94,
    },
    interests: ['Algorithms', 'Distributed Systems', 'Machine Learning', 'Linear Algebra', 'Python'],
    badges: [
      { id: 'b1', title: 'Pomodoro Master', description: 'Completed 50+ Pomodoro sessions', icon: '⏱️', unlockedAt: '2026-07-10' },
      { id: 'b2', title: '10-Day Streak', description: 'Studied 10 consecutive days without breaking', icon: '🔥', unlockedAt: '2026-08-15' },
      { id: 'b3', title: 'Room Host Leader', description: 'Hosted study rooms for 20+ hours', icon: '👑', unlockedAt: '2026-08-01' },
      { id: 'b4', title: 'Night Owl', description: 'Logged 10 late-night focus sessions', icon: '🌙', unlockedAt: '2026-07-28' },
    ],
    privacySettings: {
      showStats: 'public',
      showActivity: 'public',
      allowDirectMessages: 'everyone',
      allowRoomInvites: 'everyone',
    },
  },
  {
    id: 'user_bella',
    username: 'bella_codes',
    name: 'Bella Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    bio: 'Software Eng & Applied Math @ Stanford. Building open-source web apps and grinding LeetCode & Graph Theory. 🚀 📚',
    university: 'Stanford University',
    major: 'Computer Science & Math',
    year: 'Senior (Class of 2026)',
    joinedDate: 'August 2024',
    status: 'online',
    currentRoomId: null,
    currentRoomTitle: null,
    lastSeen: Date.now() - 1000 * 60 * 3, // 3 mins ago
    studyStats: {
      totalHours: 189,
      weeklyHours: 22.0,
      completedSessions: 112,
      streakDays: 19,
      level: 9,
      xp: 5200,
      focusScore: 98,
    },
    interests: ['Graph Theory', 'Full Stack', 'Rust', 'Discrete Math', 'Competitive Programming'],
    badges: [
      { id: 'b1', title: 'Pomodoro Master', description: 'Completed 50+ Pomodoro sessions', icon: '⏱️', unlockedAt: '2026-06-20' },
      { id: 'b2', title: 'Streak Champion', description: '15+ days unbroken study streak', icon: '⚡', unlockedAt: '2026-08-12' },
      { id: 'b5', title: 'Note Prodigy', description: 'Shared 15+ community study notes', icon: '📝', unlockedAt: '2026-07-15' },
    ],
    privacySettings: {
      showStats: 'public',
      showActivity: 'public',
      allowDirectMessages: 'everyone',
      allowRoomInvites: 'everyone',
    },
  },
  {
    id: 'user_marcus',
    username: 'marcus_med',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
    bio: 'Pre-Med & Neurobiology @ Johns Hopkins. MCAT prep mode. Active recall + Anki enthusiast. 🧠 🩺',
    university: 'Johns Hopkins University',
    major: 'Neurobiology & Pre-Med',
    year: 'Senior (Class of 2026)',
    joinedDate: 'January 2025',
    status: 'studying',
    currentRoomId: 'room_mcat_prep',
    currentRoomTitle: 'MCAT Intensive & Biochem Review',
    lastSeen: Date.now(),
    studyStats: {
      totalHours: 235,
      weeklyHours: 27.5,
      completedSessions: 140,
      streakDays: 28,
      level: 11,
      xp: 7100,
      focusScore: 96,
    },
    interests: ['Neuroscience', 'Organic Chemistry', 'Biochemistry', 'Anatomy', 'MCAT'],
    badges: [
      { id: 'b2', title: 'Streak Legend', description: '25+ days unbroken study streak', icon: '🏆', unlockedAt: '2026-08-16' },
      { id: 'b4', title: 'Early Bird', description: 'Studied before 7:00 AM 15 times', icon: '🌅', unlockedAt: '2026-07-02' },
    ],
    privacySettings: {
      showStats: 'public',
      showActivity: 'public',
      allowDirectMessages: 'everyone',
      allowRoomInvites: 'everyone',
    },
  },
  {
    id: 'user_sophia',
    username: 'sophia_chem',
    name: 'Sophia Lin',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&auto=format&fit=crop&q=80',
    bio: 'Chemical Engineering @ MIT. Working on reaction kinetics and fluid dynamics. Coffee and whiteboards. ☕ ⚗️',
    university: 'MIT',
    major: 'Chemical Engineering',
    year: 'Sophomore (Class of 2028)',
    joinedDate: 'March 2025',
    status: 'away',
    currentRoomId: null,
    currentRoomTitle: null,
    lastSeen: Date.now() - 1000 * 60 * 25, // 25 mins ago
    studyStats: {
      totalHours: 110,
      weeklyHours: 14.0,
      completedSessions: 60,
      streakDays: 6,
      level: 5,
      xp: 2400,
      focusScore: 91,
    },
    interests: ['Thermodynamics', 'Reaction Engineering', 'Organic Synthesis', 'Calculus III'],
    badges: [
      { id: 'b1', title: 'Pomodoro Master', description: 'Completed 50+ Pomodoro sessions', icon: '⏱️', unlockedAt: '2026-08-05' },
    ],
    privacySettings: {
      showStats: 'public',
      showActivity: 'public',
      allowDirectMessages: 'everyone',
      allowRoomInvites: 'everyone',
    },
  },
  {
    id: 'user_david',
    username: 'david_law',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
    bio: 'Philosophy & Constitutional Law @ Harvard. Reading 200 pages a week. Deep focus sprints only. ⚖️ 📖',
    university: 'Harvard University',
    major: 'Government & Legal Philosophy',
    year: 'Junior (Class of 2027)',
    joinedDate: 'November 2024',
    status: 'offline',
    currentRoomId: null,
    currentRoomTitle: null,
    lastSeen: Date.now() - 1000 * 60 * 120, // 2 hours ago
    studyStats: {
      totalHours: 165,
      weeklyHours: 19.0,
      completedSessions: 95,
      streakDays: 14,
      level: 8,
      xp: 4100,
      focusScore: 92,
    },
    interests: ['Constitutional Law', 'Ethics', 'Legal Writing', 'History', 'Debate'],
    badges: [
      { id: 'b3', title: 'Focus Titan', description: 'Completed 4-hour single deep work sprint', icon: '🛡️', unlockedAt: '2026-07-20' },
    ],
    privacySettings: {
      showStats: 'public',
      showActivity: 'public',
      allowDirectMessages: 'everyone',
      allowRoomInvites: 'everyone',
    },
  }
];

export const INITIAL_FRIENDSHIPS: FriendRelationship[] = [
  {
    id: 'rel_alex_marcus',
    userId1: 'user_alex',
    userId2: 'user_marcus',
    status: 'accepted',
    actionUserId: 'user_alex',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'rel_alex_sophia',
    userId1: 'user_alex',
    userId2: 'user_sophia',
    status: 'accepted',
    actionUserId: 'user_sophia',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'rel_bella_marcus',
    userId1: 'user_bella',
    userId2: 'user_marcus',
    status: 'accepted',
    actionUserId: 'user_bella',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  }
  // Note: Alex & Bella are NOT friends yet by default, so you can test the exact flow:
  // Alex searches Bella -> opens profile -> sends friend request -> Bella receives notification -> Bella accepts -> friends!
];

export const INITIAL_ROOMS: StudyRoom[] = [
  {
    id: 'room_cs61a',
    code: 'ROOM-6101',
    title: 'CS61A Algorithms & System Design',
    description: 'Quiet collaborative focus room for graph algorithms, dynamic programming, and tree traversals. Screen share open for live problem debugging.',
    subject: 'Algorithms & Data Structures',
    category: 'Computer Science',
    hostId: 'user_alex',
    isPrivate: false,
    maxParticipants: 8,
    theme: 'lofi_cafe',
    timer: {
      mode: 'pomodoro',
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      timeRemainingSeconds: 21 * 60 + 40,
      isRunning: true,
      currentCycle: 2,
      totalCycles: 4,
      lastUpdated: Date.now(),
    },
    notes: [
      {
        id: 'note_1',
        roomId: 'room_cs61a',
        title: 'Dijkstra vs A* Shortest Path Complexity',
        content: `### 🎯 Dijkstra's Algorithm Overview
- **Time Complexity**: $O((V + E) \\log V)$ using Min-Heap priority queue.
- **Key Invariant**: Non-negative edge weights only!
- **Relaxation Step**: \`if dist[u] + weight(u, v) < dist[v]: dist[v] = dist[u] + weight(u, v)\`

### 🔍 A* Search Heuristic Condition
- Must be **Admissible**: $h(n) \\le h^*(n)$ (never overestimates true distance).
- Must be **Consistent / Monotonic**: $h(n) \\le c(n, p) + h(p)$.
- Euclidean distance works for 2D spatial navigation.`,
        updatedAt: Date.now() - 1000 * 60 * 15,
        lastEditedBy: 'Alex Rivera',
        tags: ['Algorithms', 'Graphs', 'Complexity'],
        isPinned: true,
      }
    ],
    participants: [
      {
        userId: 'user_alex',
        user: INITIAL_USERS[0],
        role: 'host',
        joinedAt: Date.now() - 1000 * 60 * 45,
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
        isSpeaking: false,
        audioLevel: 15,
      },
      {
        userId: 'user_sarah',
        user: INITIAL_USERS[1],
        role: 'co-host',
        joinedAt: Date.now() - 1000 * 60 * 30,
        isAudioEnabled: false,
        isVideoEnabled: true,
        isScreenSharing: false,
        isSpeaking: false,
        audioLevel: 0,
      },
      {
        userId: 'user_marcus',
        user: INITIAL_USERS[2],
        role: 'member',
        joinedAt: Date.now() - 1000 * 60 * 20,
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
        isSpeaking: false,
        audioLevel: 5,
      },
      {
        userId: 'user_elena',
        user: INITIAL_USERS[3],
        role: 'member',
        joinedAt: Date.now() - 1000 * 60 * 10,
        isAudioEnabled: false,
        isVideoEnabled: true,
        isScreenSharing: false,
        isSpeaking: false,
        audioLevel: 0,
      },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    activeNow: true,
  },
  {
    id: 'room_mcat_prep',
    code: 'ROOM-7782',
    title: 'MCAT Intensive & Biochem Review',
    description: 'Deep focus active recall for metabolic pathways, amino acid structures, and enzyme kinetics. Pomodoro 50/10 intervals.',
    subject: 'Biochemistry & Molecular Biology',
    category: 'Medical & Bio',
    hostId: 'user_marcus',
    isPrivate: false,
    maxParticipants: 6,
    theme: 'cozy_library',
    timer: {
      mode: 'pomodoro',
      workDuration: 50,
      shortBreakDuration: 10,
      longBreakDuration: 20,
      timeRemainingSeconds: 38 * 60 + 15,
      isRunning: true,
      currentCycle: 1,
      totalCycles: 3,
      lastUpdated: Date.now(),
    },
    notes: [
      {
        id: 'note_2',
        roomId: 'room_mcat_prep',
        title: 'Citric Acid Cycle (Krebs) Rate-Limiting Steps',
        content: `### 🧪 Key Enzymes & Regulators
1. **Citrate Synthase**: Oxaloacetate + Acetyl-CoA -> Citrate (Inhibited by ATP, NADH, Citrate)
2. **Isocitrate Dehydrogenase** (*Rate-Limiting*): Isocitrate -> alpha-Ketoglutarate + NADH + CO2 (Activated by ADP, NAD+; Inhibited by ATP, NADH)
3. **alpha-Ketoglutarate Dehydrogenase**: alpha-Ketoglutarate -> Succinyl-CoA + NADH + CO2 (Inhibited by Succinyl-CoA, NADH)

**Net Yield per Glucose (2 turns)**:
- 6 NADH
- 2 FADH2
- 2 GTP (ATP)
- 4 CO2`,
        updatedAt: Date.now() - 1000 * 60 * 30,
        lastEditedBy: 'Marcus Vance',
        tags: ['Biochem', 'MCAT', 'Metabolism'],
        isPinned: true,
      }
    ],
    participants: [
      {
        userId: 'user_marcus',
        user: INITIAL_USERS[2],
        role: 'host',
        joinedAt: Date.now() - 1000 * 60 * 30,
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
        isSpeaking: false,
        audioLevel: 10,
      }
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    activeNow: true,
  },
  {
    id: 'room_math_physics',
    code: 'ROOM-3141',
    title: 'Multivariable Calculus & Quantum Mechanics',
    description: 'Derivations, Stokes Theorem, Maxwell Equations, and wave functions. Camera on for whiteboard sharing.',
    subject: 'Applied Physics & Calc III',
    category: 'Math & Physics',
    hostId: 'user_sophia',
    isPrivate: false,
    maxParticipants: 6,
    theme: 'midnight_tokyo',
    timer: {
      mode: 'pomodoro',
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      timeRemainingSeconds: 14 * 60 + 20,
      isRunning: true,
      currentCycle: 3,
      totalCycles: 4,
      lastUpdated: Date.now(),
    },
    notes: [],
    participants: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 1,
    activeNow: true,
  }
];

export const INITIAL_MESSAGES: DirectMessage[] = [
  {
    id: 'dm_1',
    conversationId: 'conv_alex_marcus',
    senderId: 'user_marcus',
    receiverId: 'user_alex',
    content: 'Hey Alex! Are you ready for our study session later today?',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    isRead: true,
    type: 'text',
  },
  {
    id: 'dm_2',
    conversationId: 'conv_alex_marcus',
    senderId: 'user_alex',
    receiverId: 'user_marcus',
    content: 'Yes! Im in the CS61A room right now finishing up homework. Feel free to join anytime.',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    isRead: true,
    type: 'text',
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    recipientId: 'user_alex',
    senderId: 'user_marcus',
    type: 'streak_reminder',
    title: '🔥 12-Day Streak Active!',
    message: 'Log 25 more focus minutes today to maintain your 12-day study streak.',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    isRead: false,
  },
  {
    id: 'notif_2',
    recipientId: 'user_alex',
    senderId: 'user_sophia',
    type: 'friend_accepted',
    title: 'Friend Request Accepted',
    message: 'Sophia Lin accepted your friend request. You can now invite each other to study rooms!',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    isRead: true,
    actionData: {
      username: 'sophia_chem',
    }
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task_1',
    userId: 'user_alex',
    title: 'Complete LeetCode Graph Theory Problem Set (5 Mediums)',
    description: 'Focus on Topological Sort and BFS / DFS matrix traversal.',
    status: 'in_progress',
    priority: 'high',
    subject: 'Computer Science',
    dueDate: '2026-08-21',
    estimatedMinutes: 90,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'task_2',
    userId: 'user_alex',
    title: 'Review Lecture 14 Slides on Distributed Consensus & Raft',
    description: 'Take detailed notes for upcoming midterm review.',
    status: 'todo',
    priority: 'medium',
    subject: 'Systems',
    dueDate: '2026-08-22',
    estimatedMinutes: 60,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'task_3',
    userId: 'user_alex',
    title: 'Linear Algebra Eigenvalue & SVD Practice Exam',
    description: 'Score at least 85% on timed mock exam.',
    status: 'done',
    priority: 'high',
    subject: 'Mathematics',
    dueDate: '2026-08-19',
    estimatedMinutes: 120,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  }
];

export const INITIAL_GOALS: StudyGoal[] = [
  {
    id: 'goal_1',
    userId: 'user_alex',
    title: 'Master Algorithms & Data Structures Midterm',
    subject: 'Computer Science',
    targetHours: 35,
    currentHours: 24.5,
    deadline: '2026-08-30',
    milestones: [
      { id: 'm1', title: 'Dynamic Programming Patterns', completed: true },
      { id: 'm2', title: 'Graph Shortest Paths & MST', completed: true },
      { id: 'm3', title: 'NP-Completeness Reductions', completed: false },
      { id: 'm4', title: 'Timed Mock Midterm #1', completed: false },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: 'goal_2',
    userId: 'user_alex',
    title: 'Complete Deep Learning Specialization',
    subject: 'Machine Learning',
    targetHours: 40,
    currentHours: 18,
    deadline: '2026-09-15',
    milestones: [
      { id: 'm5', title: 'Neural Networks and Deep Learning', completed: true },
      { id: 'm6', title: 'Convolutional Neural Networks', completed: false },
      { id: 'm7', title: 'Transformers & Attention Mechanisms', completed: false },
    ],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  }
];

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'habit_1',
    userId: 'user_alex',
    title: 'Morning 25-min Pomodoro Sprint',
    frequency: 'daily',
    streak: 12,
    completedDates: ['2026-08-17', '2026-08-18', '2026-08-19'],
    icon: '☀️',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
  {
    id: 'habit_2',
    userId: 'user_alex',
    title: 'Review Anki / Active Recall Flashcards',
    frequency: 'daily',
    streak: 8,
    completedDates: ['2026-08-18', '2026-08-19'],
    icon: '📇',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: 'habit_3',
    userId: 'user_alex',
    title: 'Read 1 Research Paper / Case Study',
    frequency: 'weekdays',
    streak: 4,
    completedDates: ['2026-08-18'],
    icon: '📄',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  }
];

export const INITIAL_FEED: ActivityFeedItem[] = [
  {
    id: 'feed_1',
    userId: 'user_marcus',
    user: INITIAL_USERS[2],
    type: 'streak_milestone',
    title: 'Reached a 28-Day Study Streak! 🔥',
    details: 'Logged 3 hours of MCAT Biochemistry review in the study room.',
    timestamp: Date.now() - 1000 * 60 * 45,
    likes: ['user_alex', 'user_bella', 'user_sophia'],
    commentsCount: 4,
    privacy: 'public',
  },
  {
    id: 'feed_2',
    userId: 'user_alex',
    user: INITIAL_USERS[0],
    type: 'room_created',
    title: 'Opened Study Room: CS61A Algorithms & System Design 💻',
    details: 'Focusing on Graph Theory and Dynamic Programming. Come join!',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    likes: ['user_marcus', 'user_sophia'],
    commentsCount: 2,
    privacy: 'public',
  },
  {
    id: 'feed_3',
    userId: 'user_bella',
    user: INITIAL_USERS[1],
    type: 'study_session_completed',
    title: 'Completed 4 Pomodoro Cycles (100 mins focus) ⏱️',
    details: 'Solved 6 LeetCode Graph problems with 0 distractions.',
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    likes: ['user_alex', 'user_marcus'],
    commentsCount: 3,
    privacy: 'public',
  }
];
