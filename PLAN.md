# Sofrito - Recipe Finder App

## Overview

A web app to search recipes using an LLM. Find recipes by ingredients, save your favorites, and mark ones you've made.

**App Name**: Sofrito
**Target Users**: Home cooks looking for recipe inspiration
**Platform**: Web (responsive, mobile-friendly)

---

## Tech Stack

| Component  | Technology                | Notes                   |
| ---------- | ------------------------- | ----------------------- |
| Framework  | Next.js 16 (App Router)   | React-based, full-stack |
| Styling    | Tailwind CSS v4           | Utility-first           |
| Storage    | localStorage              | MVP - no auth needed    |
| LLM        | OpenAI-compatible API     | Configurable provider   |
| Cache      | Upstash Redis (Vercel KV) | Share links, 30d TTL    |
| i18n       | next-intl                 | es (default) + en       |
| Deployment | Vercel                    | Free hobby tier         |

---

## Features

- **Search**: Enter ingredients/recipe name → LLM returns a recipe
- **Save**: Save recipes you want to cook
- **Made**: Mark recipes you've cooked
- **Share**: Short share links via Vercel KV
- **i18n**: Spanish (default) and English
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
# Required - LLM API key
LLM_API_KEY=your-api-key-here

# Optional: LLM provider
LLM_BASE_URL=https://opencode.ai/zen/v1
LLM_MODEL=big-pickle

# Vercel KV (Upstash Redis) - required for sharing
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token

```

---

## API Endpoints

| Endpoint      | Method | Description                   |
| ------------- | ------ | ----------------------------- |
| `/api/recipe` | POST   | Search via LLM                |
| `/api/share`  | POST   | Store recipe in KV, return ID |
| `/api/share`  | GET    | Fetch shared recipe by ID     |
| `/api/mock`   | GET    | Mock recipes (dev only)    |

---

## Development

```bash
# Install
pnpm install

# Development (uses mock data)
pnpm run dev

# Production build
pnpm run build

# Checks
pnpm run typecheck
pnpm run lint
pnpm run format
```

---

## LLM Configuration

| Provider               | baseURL                        | Model          |
| ---------------------- | ------------------------------ | -------------- |
| OpenCode Zen (default) | `https://opencode.ai/zen/v1`   | `big-pickle`   |
| MiniMax                | `https://api.minimax.io/v1`    | `MiniMax-M2.5` |
| Hypereal               | `https://hypereal.tech/api/v1` | `minimax-m2.5` |

---

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── [locale]/
│   │   ├── layout.tsx           # Root layout + i18n
│   │   ├── page.tsx             # Home + search
│   │   ├── recipes/page.tsx     # Recipe list (tabs)
│   │   ├── recipe/page.tsx      # Recipe detail (by id)
│   │   └── share/page.tsx       # Shared recipe view + save
│   └── api/
│       ├── recipe/route.ts      # LLM search
│       ├── share/route.ts       # KV-backed share
│       └── mock/route.ts        # Mock recipes (env-gated)
├── components/
│   ├── ActionButtons.tsx        # Save / Mark as made
│   ├── I18nProvider.tsx         # Client-side next-intl wrapper
│   ├── LangSwitcher.tsx         # ES/EN toggle
│   ├── RecipeCard.tsx           # Card in recipes list
│   ├── RecipeDetail.tsx         # Full recipe view
│   └── SearchBar.tsx            # Search input
├── i18n/
│   ├── request.ts               # next-intl config
│   └── messages/
│       ├── en.json              # 31 translation keys
│       └── es.json              # 31 translation keys
├── lib/
│   ├── types.ts                 # Recipe, Ingredient, RecipeStatus
│   ├── storage.ts               # localStorage CRUD
│   └── id.ts                    # cyrb53 hash + generateId
├── proxy.ts                     # next-intl middleware
└── routing.ts                   # Locale routing config
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
9. ⏳ Tests (future)

---

## Known Issues / TODO

### 1. Recipe status overwrites by name, not ID

`saveRecipe()` deduplicates by `r.name === recipe.name`. Different recipes with the same name would overwrite rather than coexist.

---

## Testing Strategy (Future)

- **Unit tests**: Test storage helpers, utility functions
- **Component tests**: Test RecipeCard, RecipeDetail render
- **E2E tests**: Test search → save → view → share flow
- Use: Vitest + Playwright

```bash
npm test        # unit
pnpm run e2e     # e2e
```

---

## Future Features

### 1. Comensales (servings adjustment)

**Description**: Allow users to specify the number of servings when searching for recipes. The LLM prompt should scale ingredients accordingly.

**Implementation**:

- Add a servings input/dropdown in SearchBar component
- Pass `servings: X` to the API
- Update LLM prompt to scale ingredients based on comensales

**Complexity**: Medium

---

### 2. Ingredient-based search

**Description**: Allow users to search by ingredients (e.g., "peas", "chicken") and get a list of 3-5 recipe options to browse and save.

**Implementation**:

- Add a new search mode toggle (by dish name vs by ingredients)
- Update API to return an array of recipes instead of a single recipe
- Create a new list view component to display multiple recipes
- Add "save" functionality directly from the list
- Use `locale` from feature #1 for recipe language

**Complexity**: High

---

### 3. Auth + Database (Vercel Postgres)

**Goal**: Add user accounts so recipes persist across devices and are tied to users.

**Stack**:

- **Database**: Vercel Postgres (Neon) - 512MB free
- **ORM**: Prisma or Drizzle
- **Auth**: Clerk (easier) or NextAuth (more control)

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

**Implementation**:

1. **Setup**
   - Create Vercel Postgres database
   - Add `POSTGRES_URL` environment variable
   - Set up Prisma schema

2. **Auth Integration**
   - Add Clerk/NextAuth
   - Create auth middleware to protect routes
   - Add sign-in/sign-up UI

3. **Data Migration**
   - Import existing localStorage recipes to new user account
   - Migrate share keys from `share:X` to `user:X:shares:X`

4. **Update Routes**
   - Replace localStorage with DB queries
   - Add user-scoped recipe queries

**Free Tier Limits**:

- Vercel Postgres: 512MB storage (~100k recipes)
- Clerk: 100 monthly active users free

**Complexity**: High

---

### 4. PWA (Progressive Web App)

**Goal**: Add to homescreen on mobile, hide URL bar, native app feel.

**Implementation**:

1. **Icons**
   - Generate 192x192 and 512x512 PNGs
   - Place in `public/icon-192.png` and `public/icon-512.png`

2. **Manifest** — Create `src/app/manifest.ts`:

   ```ts
   import { MetadataRoute } from "next";
   export default function manifest(): MetadataRoute.Manifest {
     return {
       name: "Sofrito",
       short_name: "Sofrito",
       description: "Recipe finder app",
       display: "standalone",
       start_url: "/",
       theme_color: "#d97706",
       background_color: "#fafafa",
       icons: [
         { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
         { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
       ],
     };
   }
   ```

3. **Metadata** — Add theme color + apple tags to `layout.tsx`

4. **Service Worker** (future)
   - Skip for MVP
   - Can add later for offline support

**Complexity**: Low

---

## License

MIT
