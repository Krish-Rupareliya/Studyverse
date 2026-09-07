/**
 * StudySpace Entity Definitions for Base44
 *
 * These definitions describe the database tables (entities) that the Base44
 * platform creates when the app is published. Each entity has:
 *  - name: the entity/table name
 *  - fields: column definitions with type and options
 *  - permissions: who can read/create/update/delete records
 *
 * Permission values: "public" | "user" | "owner" | "admin"
 *  - "public": anyone (including unauthenticated)
 *  - "user": any authenticated user
 *  - "owner": only the user who created the record
 *  - "admin": only app admins
 */

// ─── UserProfile ──────────────────────────────────────────────
// Extends the built-in Base44 User entity with StudySpace-specific fields.
export const UserProfileEntity = {
  name: 'UserProfile',
  fields: {
    username:       { type: 'string',  required: true,  unique: true },
    name:           { type: 'string',  required: true },
    avatar:         { type: 'string',  required: false },
    banner:         { type: 'string',  required: false },
    bio:            { type: 'string',  required: false },
    university:     { type: 'string',  required: false },
    major:          { type: 'string',  required: false },
    year:           { type: 'string',  required: false },
    joinedDate:     { type: 'string',  required: false },
    status:         { type: 'string',  required: false, default: 'online' },
    currentRoomId:  { type: 'string',  required: false },
    currentRoomTitle: { type: 'string', required: false },
    lastSeen:       { type: 'number',  required: false },
    studyStats:     { type: 'json',    required: false },
    interests:      { type: 'array',   required: false, items: { type: 'string' } },
    badges:         { type: 'array',   required: false, items: { type: 'json' } },
    privacySettings: { type: 'json',   required: false },
  },
  permissions: {
    read:   'public',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── StudyRoom ─────────────────────────────────────────────────
export const StudyRoomEntity = {
  name: 'StudyRoom',
  fields: {
    code:           { type: 'string',  required: true },
    title:          { type: 'string',  required: true },
    description:    { type: 'string',  required: false },
    subject:        { type: 'string',  required: false },
    category:       { type: 'string',  required: false },
    hostId:         { type: 'string',  required: true },
    isPrivate:      { type: 'boolean', required: false, default: false },
    passcode:        { type: 'string',  required: false },
    maxParticipants: { type: 'number', required: false, default: 8 },
    tags:           { type: 'array',   required: false, items: { type: 'string' } },
    participants:   { type: 'array',   required: false, items: { type: 'json' } },
    theme:          { type: 'string',  required: false, default: 'cozy_library' },
    rules:          { type: 'json',    required: false },
    timer:          { type: 'json',    required: false },
    notes:          { type: 'array',   required: false, items: { type: 'json' } },
    activeNow:      { type: 'boolean', required: false, default: true },
  },
  permissions: {
    read:   'public',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── RoomMessage ──────────────────────────────────────────────
export const RoomMessageEntity = {
  name: 'RoomMessage',
  fields: {
    roomId:         { type: 'string',  required: true },
    senderId:       { type: 'string',  required: true },
    senderName:     { type: 'string',  required: false },
    senderUsername: { type: 'string',  required: false },
    senderAvatar:   { type: 'string',  required: false },
    content:        { type: 'string',  required: true },
    type:           { type: 'string',  required: false, default: 'chat' },
    mentions:       { type: 'array',   required: false, items: { type: 'string' } },
  },
  permissions: {
    read:   'public',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── DirectMessage ────────────────────────────────────────────
export const DirectMessageEntity = {
  name: 'DirectMessage',
  fields: {
    conversationId: { type: 'string',  required: true },
    senderId:       { type: 'string',  required: true },
    receiverId:     { type: 'string',  required: true },
    content:        { type: 'string',  required: true },
    isRead:         { type: 'boolean', required: false, default: false },
    type:           { type: 'string',  required: false, default: 'text' },
    roomInvite:     { type: 'json',    required: false },
  },
  permissions: {
    read:   'user',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── Friendship ───────────────────────────────────────────────
export const FriendshipEntity = {
  name: 'Friendship',
  fields: {
    userId1:       { type: 'string',  required: true },
    userId2:      { type: 'string',  required: true },
    status:       { type: 'string',  required: true, default: 'pending' },
    actionUserId: { type: 'string',  required: true },
  },
  permissions: {
    read:   'public',
    create: 'user',
    update: 'user',
    delete: 'user',
  },
};

// ─── Notification ─────────────────────────────────────────────
export const NotificationEntity = {
  name: 'Notification',
  fields: {
    recipientId: { type: 'string',  required: true },
    senderId:    { type: 'string',  required: false },
    type:        { type: 'string',  required: true },
    title:       { type: 'string',  required: true },
    message:     { type: 'string',  required: false },
    isRead:      { type: 'boolean', required: false, default: false },
    actionData:  { type: 'json',    required: false },
  },
  permissions: {
    read:   'owner',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── Task ──────────────────────────────────────────────────────
export const TaskEntity = {
  name: 'Task',
  fields: {
    userId:          { type: 'string',  required: true },
    title:           { type: 'string',  required: true },
    description:     { type: 'string',  required: false },
    status:          { type: 'string',  required: false, default: 'todo' },
    priority:        { type: 'string',  required: false, default: 'medium' },
    subject:         { type: 'string',  required: false },
    dueDate:         { type: 'string',  required: false },
    estimatedMinutes: { type: 'number', required: false },
  },
  permissions: {
    read:   'owner',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── Goal ──────────────────────────────────────────────────────
export const GoalEntity = {
  name: 'Goal',
  fields: {
    userId:       { type: 'string',  required: true },
    title:        { type: 'string',  required: true },
    subject:      { type: 'string',  required: false },
    targetHours:  { type: 'number', required: false, default: 0 },
    currentHours: { type: 'number', required: false, default: 0 },
    deadline:     { type: 'string',  required: false },
    milestones:   { type: 'array',   required: false, items: { type: 'json' } },
  },
  permissions: {
    read:   'owner',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── Habit ─────────────────────────────────────────────────────
export const HabitEntity = {
  name: 'Habit',
  fields: {
    userId:         { type: 'string',  required: true },
    title:          { type: 'string',  required: true },
    frequency:      { type: 'string',  required: false, default: 'daily' },
    streak:         { type: 'number',  required: false, default: 0 },
    completedDates: { type: 'array',   required: false, items: { type: 'string' } },
    icon:           { type: 'string',  required: false, default: '📚' },
  },
  permissions: {
    read:   'owner',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── StudySession ──────────────────────────────────────────────
export const StudySessionEntity = {
  name: 'StudySession',
  fields: {
    userId:          { type: 'string',  required: true },
    roomId:          { type: 'string',  required: false },
    roomTitle:       { type: 'string',  required: false },
    subject:         { type: 'string',  required: false },
    durationMinutes: { type: 'number',  required: true },
    sessionType:     { type: 'string',  required: false, default: 'pomodoro' },
  },
  permissions: {
    read:   'owner',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// ─── ActivityFeed ──────────────────────────────────────────────
export const ActivityFeedEntity = {
  name: 'ActivityFeed',
  fields: {
    userId:       { type: 'string',  required: true },
    type:         { type: 'string',  required: true },
    title:        { type: 'string',  required: true },
    details:      { type: 'string',  required: false },
    likes:        { type: 'array',   required: false, items: { type: 'string' } },
    commentsCount: { type: 'number', required: false, default: 0 },
    privacy:      { type: 'string',  required: false, default: 'public' },
  },
  permissions: {
    read:   'public',
    create: 'user',
    update: 'owner',
    delete: 'owner',
  },
};

// Export all entities for the platform to read
export const allEntities = [
  UserProfileEntity,
  StudyRoomEntity,
  RoomMessageEntity,
  DirectMessageEntity,
  FriendshipEntity,
  NotificationEntity,
  TaskEntity,
  GoalEntity,
  HabitEntity,
  StudySessionEntity,
  ActivityFeedEntity,
];
