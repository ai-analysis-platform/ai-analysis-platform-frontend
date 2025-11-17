## Nebula IQ · AI Analytics Workspace

TypeScript-based Next.js 16 application that demonstrates a clean homepage scaffold for an AI data analytics platform. The stack blends Ant Design, Emotion, TanStack Query, Recoil, and a companion Vite playground so future product modules can iterate quickly while reusing the same providers.

### Stack

- `Next.js 16 (App Router, React 19, Suspense)`
- `Yarn 1.x` for dependency management
- `Ant Design 5` UI system with the official Next.js registry
- `Emotion` for SSR-safe theming and styled surfaces
- `@tanstack/react-query` + `ReactQueryDevtools` (ready for future data hooks)
- `Jotai` for lightweight client-side state experiments
- Dual runtime: `next dev` for the app, `vite dev` for component prototyping

### Quickstart (Yarn)

```bash
yarn install
yarn dev         # Next.js at http://localhost:3000
yarn dev:vite    # Vite playground at http://localhost:5173

yarn build       # Next.js production build
yarn start       # Next.js production server
yarn build:vite  # Static build of Vite preview
yarn preview:vite

yarn lint        # ESLint
yarn typecheck   # tsc --noEmit
```

### Project Highlights

- `src/core/providers.tsx` composes Jotai, React Query, Ant Design, and Emotion-friendly defaults.
- `src/page/home-page.tsx` hosts the example homepage (client component) that wires a hero section, metrics, and summary card.
- `src/components/home/*` contains small, focused UI pieces for the homepage.
- `src/hooks/use-workspace-info.ts` shows how to expose Jotai atoms through ergonomic hooks.
- `src/core/state/workspace.ts` is the single place for workspace-related atoms.
- `src/vite/main.tsx` + `index.html` boot the same page through Vite for quick visual tweaks.

### Next Steps

- Extend Jotai atoms with real workspace data contract.
- Add TanStack Query hooks when backend endpoints are connected.
- Create new route segments under `src/app` (e.g., `/workspaces/[id]/page.tsx`) as requirements grow.

Happy shipping! 🚀
