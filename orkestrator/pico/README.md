# pico

Простой клон [the-foundry](https://github.com/podlodka-ai-club/the-foundry).

Мини-оркестратор для автономного выполнения задач из GitHub Issues силами AI-агента: берёт issue с определённым лейблом, прогоняет его через пайплайн `fetch → plan → implement → verify → pr` и в конце открывает Pull Request с решением.

## Как это устроено

- **Backend**: Node.js + TypeScript, Express (REST API + SSE для стрима событий), SQLite (`better-sqlite3`) для хранения задач/событий/результатов стадий, Octokit для работы с GitHub, Anthropic SDK для вызова Claude.
- **Изоляция**: каждая задача выполняется в отдельном git worktree, чтобы можно было гонять несколько задач параллельно.
- **Frontend**: React + Vite, Mantine UI, TanStack Query — список задач и просмотр прогресса в реальном времени.

## Запуск

```bash
make install     # установка зависимостей (backend + web)
make all          # api + worker + web одновременно
```

Или по отдельности: `make api`, `make worker`, `make web`.

Конфигурация — через `.env` (см. `src/config.ts`): `GITHUB_TOKEN`, `GITHUB_REPO`, `ANTHROPIC_API_KEY`, `ISSUE_LABEL`, `BASE_BRANCH`, `DB_PATH`, `WORKTREE_ROOT`, `VERIFY_COMMAND`, `MAX_ATTEMPTS`, `PORT`.

Подробности по архитектуре и критериям — в `AGENTS.md`.
