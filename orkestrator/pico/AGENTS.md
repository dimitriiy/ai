# orkestrator/pico - Agent Guide

## Tech Stack

**Backend:**

- Node.js + TypeScript (v7)
- Express 5 (REST API, CORS enabled)
- SQLite (better-sqlite3) — tasks, events, stage results
- Anthropic SDK (Claude API)
- Octokit (GitHub REST API)
- Port: 3001

**Frontend:**

- React 19 + Vite 7
- Mantine UI 9 + Tabler Icons
- TypeScript 7

**Architecture:**

- Event-driven pipeline (fetch → plan → implement → verify → pr)
- Stage caching in SQLite
- Worktree-based branch isolation
- SSE for real-time events (`/api/tasks/:id/events`)

## Acceptance Criteria

### Functional

**Pipeline Execution:**

- [ ] Task progresses through all stages: fetch → plan → implement → verify → pr
- [ ] Stage results cached in DB; retrieval skips re-execution
- [ ] Blocked tasks (needsHuman) stop at plan stage, status = "blocked"
- [ ] Failed verification retries up to `config.maxAttempts`
- [ ] Pre-implement failures (fetch/plan) reset task to "pending"
- [ ] Post-implement failures mark task as "failed" at current stage

**GitHub Integration:**

- [ ] Fetch: reads issue title + body + number
- [ ] PR: creates branch, pushes commits, opens PR, stores PR URL

**API Contracts:**

- [ ] `GET /api/tasks` returns task list
- [ ] `GET /api/tasks/:id` returns single task
- [ ] `GET /api/tasks/:id/events` streams SSE events
- [ ] Events: stage_started, stage_finished, stage_failed, agent_text, blocked

**Frontend:**

- [ ] Task list displays: id, issueNumber, status, stage, prUrl
- [ ] Task detail shows live events via SSE
- [ ] UI updates when status/stage changes

### Non-Functional

**Reliability:**

- [ ] SQLite transactions prevent partial writes
- [ ] Errors logged with task ID + stage + message
- [ ] Stage crash doesn't corrupt DB state

**Performance:**

- [ ] Concurrent tasks use separate worktrees (no GitLock)
- [ ] Frontend dev server hot-reloads changes <1s
- [ ] Backend typechecks in <5s (`yarn typecheck`)

**Code Quality:**

- [ ] TypeScript strict mode passes (`tsc --noEmit`)
- [ ] API types match DB schema (Task, TaskEvent)
- [ ] Frontend lints clean (`yarn lint`)

**Dev Experience:**

- [ ] `yarn dev:api` starts backend with watch mode
- [ ] `yarn dev:worker` runs worker separately (if needed)
- [ ] Frontend `yarn dev` proxies API to localhost:3001
- [ ] `.env` variables documented in `.env.example`

## Key Files

- `src/pipeline.ts` — main execution loop
- `src/stages/` — fetch, plan, implement, verify, pr
- `src/state.ts` — DB read/write (tasks, stage results)
- `src/events.ts` — event recording + SSE
- `web/src/` — React app
