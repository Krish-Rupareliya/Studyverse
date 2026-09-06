# StudySpace — Base44 Dev Environment

## What this is
A collaborative social-studying platform (React 19 + Vite 6 + Express + WebSocket). A single Express server (`server.ts`) serves the Vite dev frontend via middleware mode **and** the REST/WebSocket API, all on port 3000. Single-origin — no separate API port.

## Running it
```
docker compose -f docker-compose.base44.yml up -d
```
- Base image: `oven/bun:1` (project uses bun.lock). Deps install on every boot via `bun install`.
- Dev command: `bun run dev` → `tsx server.ts`. Vite runs in middleware mode inside Express.
- Health check: `GET /api/health` → `{"status":"ok"}`.

## Key setup notes
- **Vite `allowedHosts: true`** is required in `vite.config.ts` — the preview proxy hostname changes per environment and Vite blocks unknown hosts by default (403 "Blocked request"). Without this the preview is blank.
- **No live-reload for `server.ts`**: `tsx` runs the server once without file watching. Frontend HMR works (Vite middleware), but server-side edits require `docker compose -f docker-compose.base44.yml restart app`.
- **WebSocket** runs on the same port 3000 (upgraded from the Express http server). Real-time sync (rooms, presence, DMs, whiteboard) works over same-origin ws.

## Secrets
- `GEMINI_API_KEY` (optional): Google Gemini API key for AI study features (summarize notes, flashcards, quizzes, concept explainer, study plan). The app **boots and works without it** — server-side code returns mock/fallback data when the key is absent. Get it from https://aistudio.google.com/apikey. Delivered via `/run/base44/app.env`.
- `APP_URL`: set to `http://localhost:3000` as a default; not used by frontend code (all API calls are relative `/api/...`).

## Verifying it works
1. `curl -sf http://localhost:3000/api/health` returns ok.
2. `curl -sf -H "Host: 3000-$BASE44_PUBLIC_HOST_SUFFIX" http://localhost:3000/` returns the HTML with Vite dev scripts (not a production bundle).
3. Preview iframe loads the app (StudySpace home view).
