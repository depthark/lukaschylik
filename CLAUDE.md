# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built with Qwik framework featuring SSR, a blog with MDX support, and Shiki syntax highlighting. The site is in Slovak language.

## Commands

```bash
# Development (starts Vite + CSS watcher)
bun run start

# Build for production
bun run build

# Preview production build
bun run preview

# Linting & Formatting
bun run lint             # Lint JS/TS with oxlint, then knip (dead code/deps)
bun run lint:fix         # Lint and auto-fix
bun run knip             # Find unused files, exports, dependencies
bun run lint:ci          # CI check (oxlint --deny-warnings + oxfmt --check + knip)
bun run stylelint        # Lint SCSS files
bun run stylelint:fix    # Fix SCSS issues
bun run format           # Format with oxfmt
bun run format:check     # Check formatting without writing

# Fix all (runs stylelint:fix + format)
bun run fix

# Type checking
bun run build.types
```

## Architecture

### Framework & Routing
- **Qwik 2** (`@qwik.dev/core`) with **Qwik Router** (`@qwik.dev/router`, formerly Qwik City) for file-based routing and SSR
- Path alias: `~/` maps to `src/`
- SSG adapter (`ssgAdapter`) config in `adapters/static/` for deployment
- Custom 404 page in `src/routes/404.tsx` (emitted as `404.html` during SSG)
- Linting/formatting: **oxlint** (`.oxlintrc.json`) + **oxfmt** (`.oxfmtrc.json`); SCSS via Stylelint

### i18n
- Two locales: Slovak (default, unprefixed URLs) and English (under `/en` prefix)
- Locale utilities in `src/i18n/` (`useLocale()`, `localizePath()`, `getLocaleFromPathname()`); `src/i18n/core.ts` is Qwik-free for server scripts
- ALL user-visible strings live in colocated `*.i18n.json` files (shape `{"sk": ..., "en": ...}`) or MDX — never hardcoded in TSX
- English blog articles/GDPR are separate MDX files under `src/routes/en/` with the same slugs as Slovak
- hreflang/canonical alternates emitted by `router-head.tsx`; sitemap emits `xhtml:link` alternates; `LanguageSwitch` (flag toggle) sits before `ThemeSwitch` in the navigation

### Directory Structure
- `src/routes/` - File-based routing (Qwik City convention)
  - `layout.tsx` - Root layout with Navigation, Header, Footer, contexts
  - `blog/articles/` - Blog posts as MDX files with shared layout
- `src/sections/` - Page sections (Header, Footer, About, Services, References, Contact)
- `src/components/` - Reusable UI components
- `src/utils/` - Utilities including markdown processing and Shiki highlighting
- `src/services/` - Business logic services
- `src/styles/scss/` - SCSS organized by: abstracts, base, components, modules, utils

### Blog System
- Blog posts live in `src/routes/blog/articles/{slug}/index.mdx`
- Frontmatter parsed with `gray-matter`
- Code highlighting via Shiki with custom rehype plugin (`src/utils/rehype-shiki.ts`)
- Theme-aware dual-theme syntax highlighting (light/dark via CSS in `src/utils/shiki.ts`)

### Styling
- **Tailwind CSS 4** + **SCSS** hybrid approach
- SCSS compiles via `sass` to `src/styles/css/index.css`
- Tailwind output goes to `src/styles/css/tailwind.optimized.css`
- Nodemon watches SCSS changes and auto-rebuilds

### Contexts
- `AlertContext` - Global alert/notification system
- `DialogContext` - Reservation dialog management

## Code Conventions

- Use single quotes for strings
- No semicolons (only as needed)
- Add JSDoc for all components, types, and functions
- Maximum 2 nested if conditions per function; split if needed
- Don't create TS/ESLint ignore comments - solve the underlying problem
- Remove unused imports (Biome enforces this)
- No explanatory comments in code; keep custom comments intact
