# OpenNG documentation (`docs.openng.dev`)

Stack: [Next.js 16](https://nextjs.org) + [Fumadocs](https://fumadocs.dev) (same layout patterns as [fumadocs.dev/docs](https://fumadocs.dev/docs)).

## Local

```bash
pnpm --filter docs dev
```

Open [http://localhost:3002](http://localhost:3002). With `baseUrl: "/"`, the docs home is the **root** of the app (on production: `https://docs.openng.dev/`, not `/docs`).

## Content

- MDX: `content/docs/`
- Sidebar: `content/docs/meta.yaml`

## Build

```bash
pnpm --filter docs build
```

Fumadocs MDX writes generated output to `.source/` (gitignored).
