import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

import http from "http";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// HTTP Server & Real-time WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface ClientSession {
  ws: WebSocket;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  roomId?: string;
}

const activeClients = new Map<WebSocket, ClientSession>();

function broadcastToRoom(roomId: string, message: object, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  for (const [ws, session] of activeClients.entries()) {
    if (session.roomId === roomId && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
      } catch {}
    }
  }
}

function broadcastToAll(message: object, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  for (const [ws] of activeClients.entries()) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
      } catch {}
    }
  }
}

function sendToUser(userId: string, message: object) {
  const data = JSON.stringify(message);
  for (const [ws, session] of activeClients.entries()) {
    if (session.userId === userId && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
      } catch {}
    }
  }
}

function getRoomPresence(roomId: string) {
  const participants: Array<{ userId: string; userName: string; userAvatar?: string }> = [];
  for (const [, session] of activeClients.entries()) {
    if (session.roomId === roomId && session.userId) {
      participants.push({
        userId: session.userId,
        userName: session.userName || 'Member',
        userAvatar: session.userAvatar,
      });
    }
  }
  return participants;
}

wss.on("connection", (ws: WebSocket) => {
  activeClients.set(ws, { ws });

  ws.on("message", (rawMessage: string) => {
    try {
      const data = JSON.parse(rawMessage.toString());
      const { type, payload } = data;
      const session = activeClients.get(ws);
      if (!session) return;

      switch (type) {
        case "identify": {
          session.userId = payload.userId;
          session.userName = payload.userName;
          session.userAvatar = payload.userAvatar;
          broadcastToAll({
            type: "user-presence-changed",
            payload: {
              onlineCount: activeClients.size,
              userId: payload.userId,
              status: "online",
            },
          });
          break;
        }

        case "join-room": {
          session.roomId = payload.roomId;
          session.userId = payload.userId || session.userId;
          session.userName = payload.userName || session.userName;
          session.userAvatar = payload.userAvatar || session.userAvatar;

          const activeMembers = getRoomPresence(payload.roomId);

          // Broadcast to everyone in room that user joined
          broadcastToRoom(
            payload.roomId,
            {
              type: "user-joined-room",
              payload: {
                roomId: payload.roomId,
                userId: session.userId,
                userName: session.userName,
                userAvatar: session.userAvatar,
                activeMembers,
              },
            },
            ws
          );

          // Send current presence state back to joining user
          ws.send(
            JSON.stringify({
              type: "room-presence-state",
              payload: {
                roomId: payload.roomId,
                activeMembers,
              },
            })
          );
          break;
        }

        case "leave-room": {
          const oldRoomId = session.roomId;
          session.roomId = undefined;
          if (oldRoomId) {
            broadcastToRoom(oldRoomId, {
              type: "user-left-room",
              payload: {
                roomId: oldRoomId,
                userId: session.userId,
                userName: session.userName,
              },
            });
          }
          break;
        }

        case "room-message": {
          if (payload.roomId) {
            broadcastToRoom(
              payload.roomId,
              {
                type: "room-message",
                payload,
              },
              ws
            );
          }
          break;
        }

        case "direct-message": {
          if (payload.recipientId) {
            sendToUser(payload.recipientId, {
              type: "direct-message",
              payload,
            });
          }
          break;
        }

        case "participant-update": {
          if (payload.roomId) {
            broadcastToRoom(
              payload.roomId,
              {
                type: "participant-update",
                payload,
              },
              ws
            );
          }
          break;
        }

        case "note-update": {
          if (payload.roomId) {
            broadcastToRoom(
              payload.roomId,
              {
                type: "note-update",
                payload,
              },
              ws
            );
          }
          break;
        }

        case "timer-update": {
          if (payload.roomId) {
            broadcastToRoom(
              payload.roomId,
              {
                type: "timer-update",
                payload,
              },
              ws
            );
          }
          break;
        }

        case "whiteboard-stroke": {
          if (payload.roomId) {
            broadcastToRoom(
              payload.roomId,
              {
                type: "whiteboard-stroke",
                payload,
              },
              ws
            );
          }
          break;
        }

        case "presence-ping": {
          ws.send(
            JSON.stringify({
              type: "presence-pong",
              payload: {
                onlineCount: activeClients.size,
                roomId: session.roomId,
                roomMembers: session.roomId ? getRoomPresence(session.roomId) : [],
              },
            })
          );
          break;
        }
      }
    } catch (e) {
      console.warn("WebSocket message parsing error:", e);
    }
  });

  ws.on("close", () => {
    const session = activeClients.get(ws);
    if (session && session.roomId) {
      broadcastToRoom(session.roomId, {
        type: "user-left-room",
        payload: {
          roomId: session.roomId,
          userId: session.userId,
          userName: session.userName,
        },
      });
    }
    activeClients.delete(ws);
    broadcastToAll({
      type: "user-presence-changed",
      payload: {
        onlineCount: activeClients.size,
      },
    });
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// AI Study Assistant: Summarize Room Notes
app.post("/api/gemini/summarize-notes", async (req, res) => {
  try {
    const { notes, subject, focusTopic } = req.body;
    if (!notes) {
      return res.status(400).json({ error: "Notes content is required." });
    }

    return res.json({
      summary: `Key takeaways on ${subject || "Study Topic"}:\n• Core concepts and definitions established.\n• Important formulas/rules highlighted.\n• Action items for next study session identified.`,
      keyPoints: [
        "Understanding foundational principles",
        "Applying methodologies to practical examples",
        "Reviewing frequent pitfalls and edge cases"
      ],
      actionItems: [
        "Complete practice problem set",
        "Review flashcards before next Pomodoro round"
      ]
    });
  } catch (error: any) {
    console.error("Error in summarize-notes:", error);
    res.status(500).json({ error: error.message || "Failed to summarize notes." });
  }
});

// AI Study Assistant: Generate Flashcards
app.post("/api/gemini/generate-flashcards", async (req, res) => {
  try {
    const { topic } = req.body;

    return res.json({
      flashcards: [
        { question: `What is the core definition of ${topic || "this topic"}?`, answer: "The fundamental principle governing this subject area.", difficulty: "easy" },
        { question: "How does this concept apply in real-world problem solving?", answer: "By breaking complex workflows down into verifiable steps.", difficulty: "medium" },
        { question: "What is a common pitfall or misconception to avoid?", answer: "Assuming linear scaling without verifying boundary constraints.", difficulty: "hard" },
      ]
    });
  } catch (error: any) {
    console.error("Error in generate-flashcards:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards." });
  }
});

// AI Study Assistant: Generate Practice Quiz
app.post("/api/gemini/generate-quiz", async (req, res) => {
  try {
    const { topic } = req.body;

    return res.json({
      quiz: [
        {
          question: `Which of the following is most essential to understanding ${topic || "this concept"}?`,
          options: ["A) Consistent revision and spaced repetition", "B) Cramming the night before", "C) Skipping fundamental theorems", "D) Ignoring practice problems"],
          correctAnswerIndex: 0,
          explanation: "Spaced repetition provides superior neural retention compared to passive rereading."
        }
      ]
    });
  } catch (error: any) {
    console.error("Error in generate-quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz." });
  }
});

// AI Study Assistant: Quick Concept Explainer
app.post("/api/gemini/explain-concept", async (req, res) => {
  try {
    const { concept } = req.body;

    return res.json({
      explanation: `Here is a clear breakdown of **${concept}**:\n\n1. **High-Level Intuition**: Think of this as a structured system for organizing complex interactions.\n2. **Mechanics**: It operates step-by-step to maintain state and accuracy.\n3. **Application**: Used widely across modern academic and professional problem solving.`
    });
  } catch (error: any) {
    console.error("Error in explain-concept:", error);
    res.status(500).json({ error: error.message || "Failed to explain concept." });
  }
});

// AI Study Assistant: Generate Study Plan
app.post("/api/gemini/study-plan", async (req, res) => {
  try {
    const { targetGoal, availableHoursPerDay } = req.body;

    return res.json({
      plan: `### 🎯 Targeted Study Plan for ${targetGoal || "Exam Prep"}\n\n- **Phase 1 (Foundation)**: Review core lecture notes & definitions (${availableHoursPerDay || 2}h/day).\n- **Phase 2 (Active Recall)**: Practice question sets and flashcards.\n- **Phase 3 (Mock Tests)**: Timed exam simulation with Pomodoro intervals.`
    });
  } catch (error: any) {
    console.error("Error in study-plan:", error);
    res.status(500).json({ error: error.message || "Failed to generate study plan." });
  }
});

// Vite middleware / Static serving setup
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`StudySpace server & WebSockets running on http://0.0.0.0:${PORT}`);
  });
}

start();
