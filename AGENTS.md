# AGENTS.md

## Overview

This repository contains a privacy-preserving note-taker that runs
entirely in the browser. Notes can be text (with markdown formatting),
voice recordings or pictures.  They are stored locally (IndexedDB),
grouped into files, tagged, analysed and visualised. The app is a
fully static, offline-first web app: zero network calls, no server, no
analytics sent anywhere.

## Stack

- Vite + React + TypeScript
- Dexie (IndexedDB wrapper) for local persistence
- react-i18next + i18next (locales: English, Italian)
- react-markdown + remark-gfm (markdown rendering)
- Recharts (analytics charts; donut charts, not pie)
- lucide-react (icons)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint (eslint)
- `npm run test` — run tests (vitest)

Run `lint`, `test` and `build` after every task and confirm all pass before
finishing.

## Architecture & conventions

### Directory map

- `src/db/` — Dexie schema and repository modules (typed CRUD + search)
- `src/features/*/` — per-capability feature code (e.g. `editor`, `voice`,
  `picture`, `analytics`)
- `src/i18n/` — i18next setup; `src/i18n/locales/{en,it}.json` translation files
- `src/layout/` — app shell components (sidebar, note list, editor/viewer)
- `src/components/` — shared, reusable UI components

### Data model

Dexie tables:

- `notes` — `id`, `type` (`text` | `voice` | `picture`), `title`,
  `content` (markdown), `createdAt`, `updatedAt`, `tags[]`, `fileId?`
- `files` — `id`, `name`, `color`
- `blobs` — `id`, `mimeType`, `data` (Blob) for voice/image payloads

Media payloads live in `blobs`, keeping `notes` rows lean. Blob
lifecycle is tied to the owning note: deleting a note must delete its
blobs.

### i18n rules

- All UI strings go through `t()`; never hardcode user-facing text.
- When adding or changing a UI string, update both `en.json` and `it.json`
  together.
- When touching UI strings, verify the app in both locales.
- Note *content* is user data and is never translated.
- Dates/numbers use `Intl.DateTimeFormat` / `NumberFormat` with the
  active locale.

### Code style

- Components are PascalCase, in TypeScript, with strict typing.
- Follow existing conventions in neighbouring files (patterns,
  libraries, naming).
- Do not add code comments unless asked.

## Quality bar

- Types are used strictly; new code must typecheck, lint and pass tests.
- **Test-driven development**: write tests first (red → green →
  refactor) for new logic. Every repository/aggregation module must be
  covered before its feature is built.
- **Test selectors**: tests locate elements via stable test
  identifiers (e.g.  `data-testid`), never by visible UI strings or
  text, so i18n changes cannot break tests. String assertions are
  allowed only in locale-file tests (en/it consistency).
