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
| Styling    | Tailwind CSS              | Built-in with Next.js   |
| Storage    | localStorage              | MVP - no auth needed    |
| LLM        | Big Pickle (OpenCode Zen) | Free, unlimited         |
| Deployment | Vercel                    | Free hobby tier         |

---

## Features

- **Search**: Enter ingredients/recipe name → LLM returns a recipe
- **Save**: Save recipes you want to cook
- **Made**: Mark recipes you've cooked
- **Responsive**: Works on mobile and desktop

---

## Pages Structure

| Route         | Description            |
| ------------- | ---------------------- |
| `/`           | Home page with search  |
| `/recipes`    | All saved/made recipes |
| `/recipe?id=` | Recipe detail          |

---

## Data Model

```typescript
type RecipeStatus = "saved" | "made";

interface Recipe {
  id: string;
  name: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  servings: number;
  prepTime: string;
  cookTime: string;
  status: RecipeStatus;
  createdAt: string;
}
```

Storage key: `sofrito_recipes`

---

## Environment Variables

```env
# Required - LLM API key
LLM_API_KEY=your-api-key-here

# Optional: LLM provider
LLM_BASE_URL=https://opencode.ai/zen/v1
LLM_MODEL=big-pickle
```

---

## API Endpoints

| Endpoint      | Method | Description             |
| ------------- | ------ | ----------------------- |
| `/api/recipe` | POST   | Search via LLM          |
| `/api/mock`   | GET    | Dev mode - mock recipes |

---

## Development

```bash
# Install
npm install

# Development (uses mock data)
npm run dev

# Production build
npm run build
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
│   ├── page.tsx           # Home + search
│   ├── recipes/page.tsx    # Recipe list
│   ├── recipe/page.tsx    # Recipe detail
│   └── api/
│       ├── recipe/route.ts
│       └── mock/route.ts
├── components/
│   ├── ActionButtons.tsx
│   ├── RecipeCard.tsx
│   ├── RecipeDetail.tsx
│   └── SearchBar.tsx
└── lib/
    ├── types.ts
    ├── storage.ts
    └── id.ts
```

---

## Milestones

1. ✅ Next.js + Tailwind + autoskills
2. ✅ LLM integration with retry logic
3. ✅ Recipe search + save + made
4. ✅ Recipe list + detail pages
5. ✅ Documentation
6. ⏳ CI/CD (in progress)
7. ⏳ Tests (future)

---

## Testing Strategy (Future)

- **Unit tests**: Test storage helpers, utility functions
- **Component tests**: Test RecipeCard, RecipeDetail render
- **E2E tests**: Test search → save → view flow
- Use: Vitest + Playwright

Run tests locally:

```bash
npm test        # unit
npm run e2e     # e2e
```

---

## License

MIT

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

### 3. Share recipe by link

**Description**: Generate a shareable URL containing recipe metadata. When opened, users can view and save the recipe.

**Implementation**:

- Encode recipe data into URL (use compact JSON + base64)
- Create `/share` route to decode and display recipe
- Add "Save" button on share page
- Keep URL short by minimizing JSON keys

**Complexity**: Medium
