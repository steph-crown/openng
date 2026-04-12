# OpenNG Web (`openng.dev`)

TanStack Start application: Vite, TanStack Router file routes under `src/routes/`, SSR build to `dist/`.

## Commands

- `pnpm dev` — dev server on port **3001**
- `pnpm build` — production client + server bundles
- `pnpm start` — run SSR server from `dist/server/server.js` (after `build`)
- `pnpm preview` — preview production client

`src/routeTree.gen.ts` is generated when you run `dev` or `build`; commit updates when routes change.
