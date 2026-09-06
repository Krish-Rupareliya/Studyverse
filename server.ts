import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

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

    const ai = getAI();
    if (!ai) {
      // Fallback summary if API key is not configured yet
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
    }

    const prompt = `You are an elite academic study partner and tutor. 
Subject: ${subject || "General Study"}
Focus Topic: ${focusTopic || "Comprehensive Review"}

Analyze and summarize the following study notes concisely in markdown format with:
1. Executive Summary (2-3 sentences)
2. Core Takeaways (bullet points)
3. Mnemonics or Memory Anchors (if applicable)
4. Recommended Next Steps / Practice Focus

Study Notes:
${notes}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Error in summarize-notes:", error);
    res.status(500).json({ error: error.message || "Failed to summarize notes." });
  }
});

// AI Study Assistant: Generate Flashcards
app.post("/api/gemini/generate-flashcards", async (req, res) => {
  try {
    const { topic, notes, count = 5 } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        flashcards: [
          { question: `What is the core definition of ${topic || "this topic"}?`, answer: "The fundamental principle governing this subject area.", difficulty: "easy" },
          { question: "How does this concept apply in real-world problem solving?", answer: "By breaking complex workflows down into verifiable steps.", difficulty: "medium" },
          { question: "What is a common pitfall or misconception to avoid?", answer: "Assuming linear scaling without verifying boundary constraints.", difficulty: "hard" },
        ]
      });
    }

    const prompt = `Generate ${count} high-yield active-recall study flashcards on the topic "${topic || "Study Notes"}".
Notes context (if any): ${notes || "None provided"}

Format the response as pure JSON with an array of objects with keys: "question", "answer", "difficulty" (one of "easy", "medium", "hard").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let data;
    try {
      data = JSON.parse(response.text?.trim() || "[]");
    } catch {
      data = [];
    }

    res.json({ flashcards: Array.isArray(data) ? data : data.flashcards || [] });
  } catch (error: any) {
    console.error("Error in generate-flashcards:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards." });
  }
});

// AI Study Assistant: Generate Practice Quiz
app.post("/api/gemini/generate-quiz", async (req, res) => {
  try {
    const { topic, notes, questionCount = 3 } = req.body;
    const ai = getAI();

    if (!ai) {
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
    }

    const prompt = `Generate ${questionCount} multiple choice practice quiz questions on the subject/topic: "${topic}".
Context notes: ${notes || "General domain knowledge"}

Return valid JSON with the format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Clear explanation why this is correct."
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let data;
    try {
      data = JSON.parse(response.text?.trim() || "[]");
    } catch {
      data = [];
    }

    res.json({ quiz: Array.isArray(data) ? data : data.quiz || [] });
  } catch (error: any) {
    console.error("Error in generate-quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz." });
  }
});

// AI Study Assistant: Quick Concept Explainer
app.post("/api/gemini/explain-concept", async (req, res) => {
  try {
    const { concept, level = "college" } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        explanation: `Here is a clear breakdown of **${concept}**:\n\n1. **High-Level Intuition**: Think of this as a structured system for organizing complex interactions.\n2. **Mechanics**: It operates step-by-step to maintain state and accuracy.\n3. **Application**: Used widely across modern academic and professional problem solving.`
      });
    }

    const prompt = `Explain the academic concept "${concept}" clearly for a ${level} student. Use the Feynman technique: intuitive analogy, rigorous definition, common real-world application, and 1 quick check-your-understanding question.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Error in explain-concept:", error);
    res.status(500).json({ error: error.message || "Failed to explain concept." });
  }
});

// AI Study Assistant: Generate Study Plan
app.post("/api/gemini/study-plan", async (req, res) => {
  try {
    const { targetGoal, examDate, availableHoursPerDay, subjects } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        plan: `### 🎯 Targeted Study Plan for ${targetGoal || "Exam Prep"}\n\n- **Phase 1 (Foundation)**: Review core lecture notes & definitions (${availableHoursPerDay || 2}h/day).\n- **Phase 2 (Active Recall)**: Practice question sets and flashcards.\n- **Phase 3 (Mock Tests)**: Timed exam simulation with Pomodoro intervals.`
      });
    }

    const prompt = `Create an optimized, structured study plan for a student:
Target Goal: ${targetGoal}
Subjects: ${JSON.stringify(subjects || [])}
Exam/Deadline: ${examDate || "In 2 weeks"}
Available Daily Study Time: ${availableHoursPerDay || 3} hours

Provide actionable daily/weekly milestones, recommended Pomodoro breakdowns, and review cycles.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ plan: response.text });
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
