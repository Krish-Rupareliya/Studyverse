/**
 * Real-time Multi-User Sync Service
 * Connects via WebSocket to server and BroadcastChannel for seamless cross-tab / multi-user sync.
 */

export interface RealtimeMessage {
  type:
    | 'identify'
    | 'join-room'
    | 'leave-room'
    | 'room-message'
    | 'direct-message'
    | 'participant-update'
    | 'room-update'
    | 'note-update'
    | 'timer-update'
    | 'whiteboard-stroke'
    | 'presence-ping'
    | 'presence-pong'
    | 'user-joined-room'
    | 'user-left-room'
    | 'room-presence-state'
    | 'user-presence-changed';
  payload: any;
}

type MessageListener = (msg: RealtimeMessage) => void;

class RealtimeSyncService {
  private ws: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<MessageListener> = new Set();
  private isConnected: boolean = false;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private currentUserId: string | null = null;
  private currentRoomId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('studyspace_realtime_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.notifyListeners(event.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted', e);
      }
    }
  }

  public connect(userId?: string, userName?: string, userAvatar?: string) {
    if (typeof window === 'undefined') return;

    this.currentUserId = userId || null;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (userId) {
        this.send({
          type: 'identify',
          payload: { userId, userName, userAvatar },
        });
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        if (userId) {
          this.send({
            type: 'identify',
            payload: { userId, userName, userAvatar },
          });
        }

        if (this.currentRoomId) {
          this.send({
            type: 'join-room',
            payload: { roomId: this.currentRoomId, userId, userName, userAvatar },
          });
        }

        // Start ping interval to keep connection alive
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          this.send({ type: 'presence-ping', payload: {} });
        }, 15000);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: RealtimeMessage = JSON.parse(event.data);
          this.notifyListeners(msg);
        } catch (e) {
          console.warn('Invalid WebSocket JSON payload:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Realtime WebSocket error:', err);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.scheduleReconnect(userId, userName, userAvatar);
      };
    } catch (e) {
      console.warn('Failed to construct WebSocket connection:', e);
      this.scheduleReconnect(userId, userName, userAvatar);
    }
  }

  private scheduleReconnect(userId?: string, userName?: string, userAvatar?: string) {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(userId, userName, userAvatar);
    }, 3000);
  }

  public send(msg: RealtimeMessage) {
    // Send over WebSocket if available
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (e) {
        console.warn('WebSocket send error:', e);
      }
    }

    // Also broadcast to cross-tab channel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (e) {
        console.warn('BroadcastChannel postMessage error:', e);
      }
    }
  }

  public joinRoom(roomId: string, userId?: string, userName?: string, userAvatar?: string) {
    this.currentRoomId = roomId;
    this.send({
      type: 'join-room',
      payload: { roomId, userId, userName, userAvatar },
    });
  }

  public leaveRoom(roomId: string, userId?: string, userName?: string) {
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
    this.send({
      type: 'leave-room',
      payload: { roomId, userId, userName },
    });
  }

  public sendRoomMessage(roomId: string, message: any) {
    this.send({
      type: 'room-message',
      payload: { roomId, message },
    });
  }

  public sendDirectMessage(recipientId: string, message: any) {
    this.send({
      type: 'direct-message',
      payload: { recipientId, message },
    });
  }

  public updateParticipant(roomId: string, participantData: any) {
    this.send({
      type: 'participant-update',
      payload: { roomId, participant: participantData },
    });
  }

  public updateRoom(roomId: string, roomUpdates: any) {
    this.send({
      type: 'room-update',
      payload: { roomId, updates: roomUpdates },
    });
  }

  public updateNote(roomId: string, noteData: any) {
    this.send({
      type: 'note-update',
      payload: { roomId, note: noteData },
    });
  }

  public updateTimer(roomId: string, timerData: any) {
    this.send({
      type: 'timer-update',
      payload: { roomId, timer: timerData },
    });
  }

  public addListener(listener: MessageListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: RealtimeMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('Error in realtime sync listener:', e);
      }
    });
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      currentRoomId: this.currentRoomId,
    };
  }
}

export const realtimeSync = new RealtimeSyncService();
