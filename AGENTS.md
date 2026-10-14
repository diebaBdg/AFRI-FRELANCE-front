# AGENTS.md

## Project Context

AfriFreelance is a freelance marketplace frontend built with React + Vite.
The backend is a Spring Boot API served at `/api/v1`.

## Key Files

- `src/`: frontend application source.
- `src/api/client.js`: HTTP client (fetch wrapper, token management).
- `src/api/auth.js`: authentication endpoints (login, register, profile, password change).
- `src/api/entities.js`: CRUD entity endpoints (users, projects, contracts, etc.).
- `src/api/apiClient.js`: aggregates auth + entities into a single `api` export.
- `vite.config.js`: Vite config with proxy to `http://localhost:8082`.

## Working Notes

- Use `npm run dev` for local development. The Vite proxy forwards `/api` to the Spring Boot backend.
- The backend must be running on `http://localhost:8082` for the frontend to communicate with it.
- Run `npm run build`, `npm run lint`, and `npm run typecheck` before finishing code changes.
