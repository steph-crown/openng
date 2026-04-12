# OpenNG Web (`openng.dev`)

TanStack Start application: Vite, TanStack Router file routes under `src/routes/`, Nitro-backed SSR output for deployment.

## Commands

- `pnpm dev` — dev server on port **3001**
- `pnpm build` — production bundles with Nitro output for deployment
- `pnpm start` — run SSR server from `.output/server/index.mjs` (after `build`)
- `pnpm preview` — preview production client

`src/routeTree.gen.ts` is generated when you run `dev` or `build`; commit updates when routes change.
