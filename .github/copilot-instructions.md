<!-- GitHub Copilot / Agent guidance for this repository -->
# Repository guidance for AI coding agents

Purpose
- Provide concise, actionable conventions and entry points so an AI agent becomes productive quickly in this codebase.

Big picture
- Frontend: Next.js 16 App Router (React 19) is the production runtime. See [src/app/layout.tsx](src/app/layout.tsx).
- Prototyping/playground: A parallel Vite runtime exists for fast component iteration. See [src/vite/main.tsx](src/vite/main.tsx) and `dev:vite` script in [package.json](package.json).
- State & data: Jotai atoms (client state) in [src/core/state](src/core/state). React Query is used for server data fetching via [src/core/query-client.ts](src/core/query-client.ts).

Important conventions and patterns
- Dual runtime awareness: prefer making user-facing route changes under `src/app` (Next.js). Use the Vite playground only for quick UI prototyping — it boots `HomePage` directly.
- Path alias: imports use `@/` → configured in [tsconfig.json](tsconfig.json). Resolve imports accordingly.
- Client vs server components: files that interact with browser APIs, Jotai, or React state include the `"use client"` directive (example: [src/page/home-page.tsx](src/page/home-page.tsx)). Respect Next.js App Router rules when moving code between runtimes.
- Providers composition: global providers (Jotai, React Query, Ant Design theme, Emotion) live in [src/core/providers.tsx](src/core/providers.tsx). Modify theme tokens there.
- React Query defaults: the query client is created in [src/core/query-client.ts](src/core/query-client.ts) — note defaultOptions (staleTime, retry, gcTime). Use `createQueryClient()` for tests or non-standard instances.
- Data model for reports: LLM-friendly types and chart/table structures are defined in [src/core/state/report.ts](src/core/state/report.ts). Use `Report` and `ReportSection` shapes when producing or consuming report data.

Scripts & developer workflows
- Run Next dev server: `yarn dev` (Next at http://localhost:3000). (See `dev` in [package.json](package.json)).
- Run Vite playground: `yarn dev:vite` (Vite at http://localhost:5173).
- Build & start Next: `yarn build` then `yarn start`.
- Lint / typecheck / format: `yarn lint`, `yarn typecheck`, `yarn format`.

Integration points & external deps
- Ant Design 5 + Next registry — Antd reset CSS included in layout and Vite entry.
- Emotion SSR: [src/core/emotion-registry.tsx](src/core/emotion-registry.tsx) is used inside the root layout wrapper.
- React Query Devtools included by default in providers (remove in production if desired).

What to change and where (examples)
- Add a new page/route: create a new file under `src/app/<route>` using the App Router pattern. Wrap client-only parts with `"use client"`.
- Add global UI theming or tokens: update [src/core/providers.tsx](src/core/providers.tsx).
- Add a server data hook: create a TanStack Query hook that uses the `createQueryClient()` defaults and place hooks under `src/hooks`.
- Extend report schema for LLM tasks: update types in [src/core/state/report.ts](src/core/state/report.ts) and adapt components under [src/report](src/report).

Search and examples
- Look at `HomePage` for typical patterns: [src/page/home-page.tsx](src/page/home-page.tsx).
- Message/chat flows use atoms in [src/core/state/app.ts](src/core/state/app.ts) and components under [src/components/chat](src/components/chat).

Notes for agents
- Prefer referencing concrete files (links above) when making or suggesting code changes.
- Do not assume backend endpoints exist; the repo currently simulates report creation in-memory (see `handleKeywordsConfirm` in `HomePage`).
- Keep edits minimal and consistent with existing style (TypeScript, Emotion styled components, Ant Design components).

If anything here is unclear or you want tighter conventions (testing, commit hooks, API contracts), tell me which area to expand and I will iterate.
