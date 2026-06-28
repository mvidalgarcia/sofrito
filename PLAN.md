# Sofrito - Recipe Finder App

## Overview

A web app to search recipes using an LLM. Find recipes by ingredients, save your favorites, and mark ones you've made.

**App Name**: Sofrito
**Target Users**: Home cooks looking for recipe inspiration
**Platform**: Web (responsive, mobile-friendly)

---

## Tech Stack

| Component  | Technology                | Notes                          |
| ---------- | ------------------------- | ------------------------------ |
| Framework  | Next.js 16 (App Router)   | React-based, full-stack        |
| Styling    | Tailwind CSS v4           | Utility-first                  |
| Storage    | localStorage              | MVP, future: Postgres          |
| Auth       | NextAuth.js (v5)          | Google SSO, JWT sessions       |
| LLM        | OpenAI-compatible API     | Groq (qwen/qwen3-32b)          |
| Cache      | Upstash Redis (Vercel KV) | Share links, 30d TTL           |
| Images     | Vercel Blob               | User recipe photos, 500MB free |
| i18n       | next-intl                 | es (default) + en              |
| PWA        | Service worker + manifest | Add to homescreen              |
| Deployment | Vercel                    | Free hobby tier                |

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
- **Create personal recipes**: Form to add your own recipes with name, ingredients, steps (no photos yet)
- **Source badges**: LLM/Manual badges on recipes to distinguish origin

---

## Pages Structure

| Route                  | Description               |
| ---------------------- | ------------------------- |
| `/[locale]`            | Home page with search     |
| `/[locale]/recipes`    | All saved/made recipes    |
| `/[locale]/recipe?id=` | Recipe detail             |
| `/[locale]/share?id=`  | Shared recipe (KV-backed) |
| `/[locale]/recipe/new` | Create manual recipe      |

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
  source?: "llm" | "manual"; // how the recipe was created
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
│   │   ├── recipe/new/page.tsx  # Create manual recipe
│   │   ├── recipe/edit/page.tsx # Edit manual recipe (pre-filled form)
│   │   └── share/page.tsx       # Shared recipe view + save
│   └── api/
│       ├── recipe/route.ts      # LLM search (single, scaled by servings)
│       ├── share/route.ts       # KV-backed share
│       ├── mock/route.ts        # Mock recipes (env-gated)
│       ├── recipes/route.ts     # Ingredient search, array, scaled by servings
│       └── upload/route.ts      # Image upload to Vercel Blob
├── components/
│   ├── ActionButtons.tsx        # Save / Mark as made
│   ├── I18nProvider.tsx         # Client-side next-intl wrapper
│   ├── IngredientInput.tsx      # Dynamic ingredient form fields
│   ├── IngredientSearch.tsx     # Ingredient search UI + servings + results
│   ├── LangSwitcher.tsx         # ES/EN toggle
│   ├── NameSearch.tsx           # Single recipe search UI + servings
│   ├── PwaRegister.tsx          # Service worker registration
│   ├── RecipeCard.tsx           # Card in recipes list
│   ├── RecipeDetail.tsx         # Full recipe view
│   ├── StepInput.tsx            # Dynamic step form fields
│   └── SearchBar.tsx            # Search input
├── i18n/
│   ├── request.ts               # next-intl config
│   └── messages/
│       ├── en.json              # ~46 translation keys
│       └── es.json              # ~46 translation keys
├── lib/
│   ├── constants.ts             # All runtime constants (single source of truth)
│   ├── types.ts                 # Recipe, Ingredient, RecipeStatus
│   ├── storage.ts               # localStorage CRUD
│   ├── scale-ingredient.ts      # Parse-and-skip amount rescaling
│   └── id.ts                    # cyrb53 hash + generateId
├── proxy.ts                     # next-intl middleware
└── routing.ts                   # Locale routing config

public/
├── manifest.json                # PWA manifest
├── icon.svg                     # PWA icon (SVG, maskable)
└── sw.js                        # Service worker (network-first)

tests/
└── e2e/
    ├── home.spec.ts             # 4 e2e tests (load, toggle, servings, navigation)
    ├── login.spec.ts            # 1 smoke test (login page renders)
    └── create-recipe.spec.ts    # 4 e2e tests (form, validation, full flow, reset)
    └── rescale-recipe.spec.ts   # 1 e2e test (parse-and-skip rescaling)

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
14. ✅ Manual recipe creation (form with dynamic ingredients/steps, source flag)
15. ✅ Rescale saved recipes (parse-and-skip, servings picker on detail view)

---

## Known Issues / TODO

### 1. Dynamic user timezone

`timeZone` is hardcoded to `Europe/Madrid` in `i18n/request.ts`. For users outside Spain (e.g., English speakers in the Americas), dates could show misleading times. Future improvement: detect timezone via cookie, browser API (`Intl.DateTimeFormat`), or user profile setting.

---

## Testing Strategy

| Layer           | Status    | Tool       | Notes                                             |
| --------------- | --------- | ---------- | ------------------------------------------------- |
| Unit tests      | ⏳ Future | Vitest     | storage, id, utils                                |
| Component tests | ⏳ Future | Vitest     | RecipeCard, RecipeDetail                          |
| E2E tests       | ✅ Done   | Playwright | 10 tests (home + login + create recipe + rescale) |

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

### 2. Rescale saved recipes ✅

**Status**: Done — `src/lib/scale-ingredient.ts`, servings picker in `RecipeDetail`, e2e test in `tests/e2e/rescale-recipe.spec.ts`.

**Goal**: Allow rescaling saved recipes directly from the recipe detail or saved list view, without re-querying the LLM.

**Approach**: Parse-and-skip — multiply ingredient amounts by a factor in the UI when a leading numeric value can be extracted; leave undetermined quantities unchanged.

**Scaling logic**:

1. Parse a leading number from each `amount` string (supports decimals, fractions like `1/2`, and unicode fractions like `¼`).
2. If a number is found, multiply it by the scale factor and rewrite the amount (e.g. `"2 cups"` × 2 → `"4 cups"`, `"1/2 tsp"` × 2 → `"1 tsp"`).
3. If no number is found, leave the amount unchanged (e.g. `"a pinch"`, `"to taste"`, `"q.b."`).

**UX for unscaled amounts**:

- Show unchanged amounts with muted styling or a `~` prefix so the user knows they were not auto-scaled and should use judgment.
- Pinch-sized or “to taste” amounts often should not scale anyway; leaving them alone is acceptable default behavior.

**Examples**:

| Original   | Factor | Result     | Notes     |
| ---------- | ------ | ---------- | --------- |
| `2 cups`   | 2      | `4 cups`   | scaled    |
| `1/2 tsp`  | 2      | `1 tsp`    | scaled    |
| `a pinch`  | 2      | `a pinch`  | unchanged |
| `to taste` | 2      | `to taste` | unchanged |
| `q.b.`     | 2      | `q.b.`     | unchanged |

**Implementation**:

1. Add a pure utility (e.g. `scaleIngredientAmount(amount, factor)` in `src/lib/`) for parse → multiply → format.
2. Add servings picker or scale factor control on recipe detail (and optionally saved list).
3. Display scaled ingredients in the UI only; do not persist rescaling unless the user explicitly saves (keeps original recipe intact).
4. i18n: label for unscaled amounts (e.g. “approximate” / “aproximado”).

**Out of scope for MVP**: LLM-assisted rescaling for ambiguous amounts; inline editing of amounts (possible follow-up).

**Complexity**: Low

---

### 3. Add photos to personal recipes

**Goal**: Add photo upload support for manually created recipes.

**Status**: Form ✅, source flag ✅, badges ✅, entry points ✅. Remaining: image upload.

**Stack**:

- **Images**: Vercel Blob (500MB free, object storage)
- **Storage**: localStorage (image URL only, not the blob itself)

**Remaining Implementation**:

1. **Upload endpoint** (`/api/upload`)
   - POST endpoint that accepts image → uploads to Vercel Blob → returns public URL
   - Cleanup blob on recipe deletion (future improvement)

2. **Form page** (`/[locale]/recipe/new`)
   - Add photo upload field (gallery picker, no camera shortcut)
   - On submit: upload image first (if any), then save recipe

3. **Edit page** (`/[locale]/recipe/edit?id=`)
   - Same form, pre-filled with existing recipe data
   - On submit: update recipe in localStorage

4. **UI updates**
   - RecipeCard and RecipeDetail: show image if `imageUrl` is present
   - Edit button on recipe detail page

5. **Edge cases**
   - Image upload errors: show toast, allow retry
   - localStorage quota: warn user if approaching limit
   - Recipe deletion: image URL dies with localStorage, blob orphaned

**Complexity**: Medium (Blob integration)

---

## License

MIT
