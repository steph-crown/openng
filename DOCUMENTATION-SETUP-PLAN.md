# Documentation site — setup plan

**Status:** Fumadocs is integrated in `apps/docs`; run `pnpm --filter docs dev` and open `/docs`. Further work: real content, OpenAPI pipeline, and AI routes from `AI-AND-LLMS.md`.

**Precedence:** Where this differs from `prd.md` §15, this plan wins (e.g. **Vercel** for docs). PRD remains useful for IA and OpenAPI goals.

---

## 1. Goals

- Developer-grade docs aligned with [Fumadocs](https://fumadocs.dev/docs): sidebar, TOC, search (`⌘K`), MDX, light/dark.
- **AI- and LLM-friendly:** follow repo root **`AI-AND-LLMS.md`** (Fumadocs patterns: `getLLMText`, `includeProcessedMarkdown`, `/llms.txt`, optional `.mdx` routes, `Accept` negotiation).
- API reference eventually generated from OpenAPI (PRD §15).
- Dummy content only until a dedicated content pass.

---

## 2. Stack

- **`apps/docs`:** Next.js App Router + **Fumadocs MDX** + **fumadocs-ui** (see [Manual installation: Next.js](https://fumadocs.dev/docs/manual-installation/next)).
- **TanStack** is not used for the docs app; Fumadocs targets Next.js first.

---

## 3. PRD §15 (critique)

- Keep IA: Getting Started, Resources, API Reference (generated), Guides, Contributing, Changelog.
- Add an early **response envelope / errors** page.
- Document **webhooks** only when shipped.
- Prefer URLs under **`https://docs.openng.dev/...`**.

---

## 4. AI & LLMs

Implement in phases per **`AI-AND-LLMS.md`** (copy from Fumadocs upstream): `source.config.ts` postprocess, `lib/get-llm-text.ts`, `app/llms.txt/route.ts`, optional `llms-full.txt`, optional `llms.mdx` rewrites / `proxy.ts` for `Accept: text/markdown`.

---

## 5. Fumadocs UI

Default **DocsLayout** provides the same class of UI as [fumadocs.dev](https://fumadocs.dev/docs): **Copy Markdown**, **Open** (GitHub / markdown / ChatGPT / Claude / Cursor), search, theme toggle—enabled by upstream `fumadocs-ui` + content wiring.

---

## 6. Brand color (locked)

- **Primary accent (buttons, key interactive): `#F86128`** (orange‑red).
- Map to Fumadocs tokens via **`--color-fd-primary`** and **`--color-fd-primary-foreground`** in `app/globals.css` (see [Fumadocs theme](https://fumadocs.dev/docs/ui/theme)).
- Keep semantic colors distinct: errors **rose/red**, success **green**, so orange stays “brand,” not “warning.”

---

## 7. Typography (locked)

| Role | Font | Load |
|------|------|------|
| **Headings** | **Plus Jakarta Sans** | `next/font/google` → `--font-plus-jakarta` |
| **Body** | **Geist Sans** | `geist` package → `--font-geist-sans` |
| **Code** | **Fira Mono** | `next/font/google` → `--font-fira-mono` |

Applied in `app/layout.tsx` and `app/globals.css` (`--font-heading`, `--font-sans`, prose headings).

---

## 8. Hosting

- **Docs:** **Vercel** for `apps/docs` (Next.js native).
- **DNS / API:** Cloudflare remains appropriate for `api.openng.dev` and zone DNS; not a conflict with hosting the docs app on Vercel.

---

## 9. “Ask AI”

Prefer **Copy Markdown** + **Open in …** links; full embedded chat needs backend + policy (see earlier plan). Fumadocs’ **Ask AI** on their site is product-specific; parity is “good LLM ergonomics,” not necessarily identical vendor integration.

---

## 10. Automations

- `pnpm build:openapi` → `openapi.json` for the docs site (later).
- CI: `pnpm turbo build --filter=docs`, optional link checker, optional OpenAPI diff on PRs.

---

## 11. Implemented in repo

- `source.config.ts`, `next.config.mjs` (`createMDX`), Tailwind 4 + Fumadocs CSS presets.
- `lib/source.ts` imports generated `../.source/server` (required for Turbopack resolution during build).
- `app/docs/layout.tsx`, `app/docs/[[...slug]]/page.tsx`, `app/api/search/route.ts`, `components/mdx.tsx`.
- Placeholder pages: `content/docs/index.mdx`, `quickstart.mdx`, `meta.yaml`.
- `/` → `/docs` redirect.

---

## 12. Next (content + AI routes)

- Replace placeholder copy; add OpenAPI-driven API reference.
- Implement **`AI-AND-LLMS.md`** routes and `includeProcessedMarkdown` when ready.

---

*Group 10 (VPS/CD) deferred.*
