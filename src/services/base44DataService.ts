/**
 * Base44 Data Service
 *
 * Provides a unified data access layer that uses Base44 entities when the SDK
 * is configured (VITE_BASE44_APP_ID is set), and falls back to localStorage
 * for local development / preview without a published app.
 *
 * All methods are async. Callers should use the loading state from the contexts.
 */

import { base44, isBase44Enabled } from '../api/base44Client';

// Storage keys (localStorage fallback)
const STORAGE_KEYS: Record<string, string> = {
  UserProfile: 'studyspace_all_users_v2',
  StudyRoom: 'studyspace_rooms_v2',
  RoomMessage: 'studyspace_room_messages_v2',
  DirectMessage: 'studyspace_messages_v2',
  Friendship: 'studyspace_friendships_v2',
  Notification: 'studyspace_notifications_v2',
  Task: 'studyspace_tasks_v2',
  Goal: 'studyspace_goals_v2',
  Habit: 'studyspace_habits_v2',
  StudySession: 'studyspace_sessions_v2',
  ActivityFeed: 'studyspace_feed_v2',
};

// In-memory cache for localStorage mode (so multiple components share state)
const memoryCache: Record<string, any[]> = {};

function lsRead<T>(entity: string): T[] {
  if (memoryCache[entity]) return memoryCache[entity] as T[];
  try {
    const key = STORAGE_KEYS[entity] || entity;
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : [];
    memoryCache[entity] = data;
    return data as T[];
  } catch {
    return [];
  }
}

function lsWrite<T>(entity: string, data: T[]) {
  memoryCache[entity] = data;
  try {
    const key = STORAGE_KEYS[entity] || entity;
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function lsCreate<T extends { id?: string }>(entity: string, record: T): T {
  const data = lsRead<T>(entity);
  const newRecord = { ...record, id: record.id || `ls_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` } as T;
  data.push(newRecord);
  lsWrite(entity, data);
  return newRecord;
}

function lsUpdate<T = any>(entity: string, id: string, updates: Partial<T>): T | null {
  const data = lsRead<T & { id: string }>(entity);
  const idx = data.findIndex(r => r.id === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates };
  lsWrite(entity, data);
  return data[idx];
}

function lsDelete(entity: string, id: string): boolean {
  const data = lsRead<{ id: string }>(entity);
  const filtered = data.filter(r => r.id !== id);
  lsWrite(entity, filtered);
  return filtered.length !== data.length;
}

function lsFilter<T>(entity: string, filter: Record<string, any>): T[] {
  const data = lsRead<T>(entity);
  if (!filter || Object.keys(filter).length === 0) return data;
  return data.filter(record => {
    return Object.entries(filter).every(([key, value]) => {
      if (value === null || value === undefined) return (record as any)[key] == null;
      if (Array.isArray(value)) return value.includes((record as any)[key]);
      return (record as any)[key] === value;
    });
  });
}

// ─── Public API ───────────────────────────────────────────────

const _persistTimers: Record<string, any> = {};
const _persistLastSync: Record<string, string> = {};

export const dataService = {
  enabled: isBase44Enabled(),

  async list<T = any>(entity: string, sort?: string, limit?: number): Promise<T[]> {
    if (isBase44Enabled() && base44) {
      try {
        return await base44.entities[entity].list(sort as any, limit) as T[];
      } catch (e) {
        console.warn(`Base44 list ${entity} failed, using localStorage:`, e);
      }
    }
    return lsRead<T>(entity);
  },

  async find<T = any>(entity: string, filter: Record<string, any>, sort?: string, limit?: number): Promise<T[]> {
    if (isBase44Enabled() && base44) {
      try {
        return await base44.entities[entity].filter(filter, sort as any, limit) as T[];
      } catch (e) {
        console.warn(`Base44 filter ${entity} failed, using localStorage:`, e);
      }
    }
    return lsFilter<T>(entity, filter);
  },

  async create<T = any>(entity: string, data: Partial<T>): Promise<T> {
    if (isBase44Enabled() && base44) {
      try {
        return await base44.entities[entity].create(data) as T;
      } catch (e) {
        console.warn(`Base44 create ${entity} failed, using localStorage:`, e);
      }
    }
    return lsCreate<T>(entity, data as T);
  },

  async update<T = any>(entity: string, id: string, updates: Partial<T>): Promise<T | null> {
    if (isBase44Enabled() && base44) {
      try {
        return await base44.entities[entity].update(id, updates) as T;
      } catch (e) {
        console.warn(`Base44 update ${entity} failed, using localStorage:`, e);
      }
    }
    return lsUpdate<T>(entity, id, updates);
  },

  async updateMany<T = any>(entity: string, filter: Record<string, any>, updates: Partial<T>): Promise<number> {
    if (isBase44Enabled() && base44) {
      try {
        const result = await base44.entities[entity].updateMany(filter, updates as any);
        return result.updated;
      } catch (e) {
        console.warn(`Base44 updateMany ${entity} failed, using localStorage:`, e);
      }
    }
    const records = lsFilter<{ id: string }>(entity, filter);
    records.forEach(r => lsUpdate(entity, r.id, updates));
    return records.length;
  },

  async remove(entity: string, id: string): Promise<boolean> {
    if (isBase44Enabled() && base44) {
      try {
        await base44.entities[entity].delete(id);
        return true;
      } catch (e) {
        console.warn(`Base44 delete ${entity} failed, using localStorage:`, e);
      }
    }
    return lsDelete(entity, id);
  },

  async deleteMany(entity: string, filter: Record<string, any>): Promise<number> {
    if (isBase44Enabled() && base44) {
      try {
        const result = await base44.entities[entity].deleteMany(filter);
        return result.deleted;
      } catch (e) {
        console.warn(`Base44 deleteMany ${entity} failed, using localStorage:`, e);
      }
    }
    const records = lsFilter<{ id: string }>(entity, filter);
    records.forEach(r => lsDelete(entity, r.id));
    return records.length;
  },

  // Persist an entire array to the backend (debounced reconciliation)
  async persist<T extends { id: string }>(entity: string, records: T[]): Promise<void> {
    // Always write to localStorage (for fallback + offline)
    lsWrite(entity, records);

    if (!isBase44Enabled() || !base44) return;

    // Debounce: clear previous timer, set new one
    if (_persistTimers[entity]) clearTimeout(_persistTimers[entity]);
    _persistTimers[entity] = setTimeout(async () => {
      try {
        const snapshot = JSON.stringify(records.map(r => r.id));
        if (_persistLastSync[entity] === snapshot) return; // no changes
        _persistLastSync[entity] = snapshot;

        const existing = await base44.entities[entity].list() as T[];
        const existingMap = new Map(existing.map(r => [r.id, r]));
        const currentIds = new Set(records.map(r => r.id));

        for (const record of records) {
          if (!existingMap.has(record.id)) {
            await base44.entities[entity].create(record as any);
          } else {
            const prev = existingMap.get(record.id)!;
            if (JSON.stringify(prev) !== JSON.stringify(record)) {
              await base44.entities[entity].update(record.id, record as any);
            }
          }
        }
        for (const old of existing) {
          if (!currentIds.has(old.id)) {
            await base44.entities[entity].delete(old.id);
          }
        }
      } catch (e) {
        console.warn(`Base44 persist ${entity} failed:`, e);
      }
    }, 2000);
  },

  // Real-time subscription (Base44 only; no-op in localStorage mode)
  subscribe<T = any>(entity: string, callback: (event: { type: string; data: T; id: string }) => void): () => void {
    if (isBase44Enabled() && base44) {
      try {
        return base44.entities[entity].subscribe(callback);
      } catch (e) {
        console.warn(`Base44 subscribe ${entity} failed:`, e);
      }
    }
    return () => {};
  },
};
