# Sofrito - Recipe Finder App

## Overview

A web app to search recipes using an LLM. Find recipes by ingredients, save your favorites, and mark ones you've made.

**App Name**: Sofrito
**Target Users**: Home cooks looking for recipe inspiration
**Platform**: Web (responsive, mobile-friendly)

---

## Tech Stack

| Component  | Technology                | Notes                    |
| ---------- | ------------------------- | ------------------------ |
| Framework  | Next.js 16 (App Router)   | React-based, full-stack  |
| Styling    | Tailwind CSS v4           | Utility-first            |
| Storage    | localStorage              | MVP, future: Postgres    |
| Auth       | NextAuth.js (v5)          | Google SSO, JWT sessions |
| LLM        | OpenAI-compatible API     | Groq (qwen/qwen3-32b)    |
| Cache      | Upstash Redis (Vercel KV) | Share links, 30d TTL     |
| i18n       | next-intl                 | es (default) + en        |
| PWA        | Service worker + manifest | Add to homescreen        |
| Deployment | Vercel                    | Free hobby tier          |

---

## Features

- **Search by name**: Enter a recipe name → LLM returns a recipe
- **Search by ingredients**: Enter ingredients → LLM returns up to 3 suggestions
- **Servings adjustment**: Set servings (1-12) before searching; ingredients scale in prompt
- **Save**: Save recipes you want to cook
- **Made**: Mark recipes you've cooked
- **Share**: Short share links via Vercel KV
- **i18n**: Spanish (default) and English
- **PWA**: Add to homescreen, standalone display, service worker with network-first caching
- **Dark mode**: System preference-based
- **Responsive**: Works on mobile and desktop

---

## Pages Structure

| Route                  | Description               |
| ---------------------- | ------------------------- |
| `/[locale]`            | Home page with search     |
| `/[locale]/recipes`    | All saved/made recipes    |
| `/[locale]/recipe?id=` | Recipe detail             |
| `/[locale]/share?id=`  | Shared recipe (KV-backed) |

---

## Data Model

```typescript
type RecipeStatus = "saved" | "made";

interface Ingredient {
  item: string;
  amount: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  steps: string[];
  servings: number;
  prepTime: string;
  cookTime: string;
  searchQuery?: string;
  createdAt?: string;
  status?: RecipeStatus;
  locale?: string;
}
```

Storage key: `sofrito_recipes` (localStorage, capped at 100)

---

## Environment Variables

```env
# Required - LLM API key (Groq)
LLM_API_KEY=gsk_your-groq-key-here

# Optional: LLM provider (Groq)
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=qwen/qwen3-32b

# Vercel KV (Upstash Redis) - required for sharing
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
```

---

## API Endpoints

| Endpoint       | Method | Description                      |
| -------------- | ------ | -------------------------------- |
| `/api/recipe`  | POST   | Search via LLM (single recipe)   |
| `/api/recipes` | POST   | Search via LLM (up to 3 recipes) |
| `/api/share`   | POST   | Store recipe in KV, return ID    |
| `/api/share`   | GET    | Fetch shared recipe by ID        |
| `/api/mock`    | GET    | Mock recipes (dev only)          |

---

## Development

```bash
# Install
pnpm install

# Development (uses API by default)
pnpm run dev

# Production build
pnpm run build

# Checks
pnpm run typecheck
pnpm run lint
pnpm run format

# Tests
pnpm run test:e2e    # e2e with Playwright
```

---

## LLM Configuration

| Provider                | baseURL                          | Model            |
| ----------------------- | -------------------------------- | ---------------- |
| Groq (current)          | `https://api.groq.com/openai/v1` | `qwen/qwen3-32b` |
| OpenCode Zen (fallback) | `https://opencode.ai/zen/v1`     | `big-pickle`     |

---

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── [locale]/
│   │   ├── layout.tsx           # Root layout + i18n + PWA metadata
│   │   ├── page.tsx             # Home + search mode toggle
│   │   ├── recipes/page.tsx     # Recipe list (tabs)
│   │   ├── recipe/page.tsx      # Recipe detail (by id)
│   │   └── share/page.tsx       # Shared recipe view + save
│   └── api/
│       ├── recipe/route.ts      # LLM search (single, scaled by servings)
│       ├── share/route.ts       # KV-backed share
│       ├── mock/route.ts        # Mock recipes (env-gated)
│       └── recipes/route.ts     # Ingredient search, array, scaled by servings
├── components/
│   ├── ActionButtons.tsx        # Save / Mark as made
│   ├── I18nProvider.tsx         # Client-side next-intl wrapper
│   ├── IngredientSearch.tsx     # Ingredient search UI + servings + results
│   ├── LangSwitcher.tsx         # ES/EN toggle
│   ├── NameSearch.tsx           # Single recipe search UI + servings
│   ├── PwaRegister.tsx          # Service worker registration
│   ├── RecipeCard.tsx           # Card in recipes list
│   ├── RecipeDetail.tsx         # Full recipe view
│   └── SearchBar.tsx            # Search input
├── i18n/
│   ├── request.ts               # next-intl config
│   └── messages/
│       ├── en.json              # 37 translation keys
│       └── es.json              # 37 translation keys
├── lib/
│   ├── constants.ts             # All runtime constants (single source of truth)
│   ├── types.ts                 # Recipe, Ingredient, RecipeStatus
│   ├── storage.ts               # localStorage CRUD
│   └── id.ts                    # cyrb53 hash + generateId
├── proxy.ts                     # next-intl middleware
└── routing.ts                   # Locale routing config

public/
├── manifest.json                # PWA manifest
├── icon.svg                     # PWA icon (SVG, maskable)
└── sw.js                        # Service worker (network-first)

tests/
└── e2e/
    └── home.spec.ts             # 4 e2e tests (load, toggle, servings, navigation)

playwright.config.ts             # Playwright config
```

---

## Milestones

1. ✅ Next.js + Tailwind + autoskills
2. ✅ LLM integration with retry logic
3. ✅ Recipe search + save + made
4. ✅ Recipe list + detail pages
5. ✅ i18n (es/en)
6. ✅ Share via Vercel KV
7. ✅ Dark mode
8. ✅ CI/CD (GitHub Actions + Husky)
9. ✅ Ingredient-based search
10. ✅ Servings adjustment (Comensales)
11. ✅ E2E tests (Playwright, 4 tests)
12. ✅ PWA (manifest, service worker, register)
13. ✅ Google SSO (NextAuth.js v5, login gate, middleware)

---

## Known Issues / TODO

### 1. Dynamic user timezone

`timeZone` is hardcoded to `Europe/Madrid` in `i18n/request.ts`. For users outside Spain (e.g., English speakers in the Americas), dates could show misleading times. Future improvement: detect timezone via cookie, browser API (`Intl.DateTimeFormat`), or user profile setting.

---

## Testing Strategy

| Layer           | Status    | Tool       | Notes                    |
| --------------- | --------- | ---------- | ------------------------ |
| Unit tests      | ⏳ Future | Vitest     | storage, id, utils       |
| Component tests | ⏳ Future | Vitest     | RecipeCard, RecipeDetail |
| E2E tests       | ✅ Done   | Playwright | 4 tests on home page     |

```bash
pnpm run test:e2e     # e2e (local or against BASE_URL)
```

---

## Future Features

### 1. Persistence + Database (Vercel Postgres)

**Goal**: Replace localStorage with a database so recipes persist across devices.

**Status**: Auth gate done (NextAuth.js v5, Google SSO, JWT sessions). Remaining: DB integration.

**Stack**:

- **Database**: Vercel Postgres (Neon) - 512MB free
- **ORM**: Prisma or Drizzle
- **Auth**: NextAuth.js v5 ✅

**Schema (Prisma)**:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  recipes   Recipe[]
  createdAt DateTime @default(now())
}

model Recipe {
  id          String   @id
  name        String
  ingredients Json
  steps       String[]
  servings    Int
  prepTime    String
  cookTime    String
  status      String   @default("saved")
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
}
```

**Remaining Implementation**:

1. **Setup**
   - Create Vercel Postgres database
   - Add `POSTGRES_URL` environment variable
   - Set up Prisma schema

2. **Data Migration**
   - Import existing localStorage recipes to new user account
   - Migrate share keys from `share:X` to `user:X:shares:X`

3. **Update Routes**
   - Replace localStorage with DB queries
   - Add user-scoped recipe queries

**Free Tier Limits**:

- Vercel Postgres: 512MB storage (~100k recipes)

**Complexity**: Medium (auth done)

---

### 2. Rescale saved recipes

Allow rescaling saved recipes directly from the recipe detail or saved list view, without re-querying the LLM. This involves multiplying ingredient amounts by a factor within the UI.

**Complexity**: Low

---

## License

MIT
