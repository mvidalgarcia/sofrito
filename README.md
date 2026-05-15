# Sofrito 🥘

A recipe search app powered by LLMs. Find recipes by ingredients or name, save your favorites, and mark what you've made.

## Features

- **Smart Search**: Search by recipe name or by ingredients — get up to 3 LLM-generated suggestions
- **Save**: Keep recipes you want to cook
- **Made**: Mark recipes you've cooked
- **Share**: Short share links via Vercel KV (clipboard)
- **i18n**: Spanish (default) and English
- **Dark mode**: System preference-based
- **Responsive**: Works on mobile and desktop
- **Privacy-First**: Your data stays in your browser (localStorage)

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development
pnpm run dev
```

Open http://localhost:3000 to use the app.

## Environment Variables

Create a `.env` file:

```env
# Required - LLM API key
LLM_API_KEY=sk-your-api-key

# Optional - LLM provider
LLM_BASE_URL=https://opencode.ai/zen/v1
LLM_MODEL=big-pickle
```

### Supported LLM Providers

| Provider               | baseURL                          | Model                     | Notes                                   |
| ---------------------- | -------------------------------- | ------------------------- | --------------------------------------- |
| Groq (recommended)     | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | Free, fast, get key at console.groq.com |
| OpenCode Zen (default) | `https://opencode.ai/zen/v1`     | `big-pickle`              | Free, unlimited                         |
| MiniMax                | `https://api.minimax.io/v1`      | `MiniMax-M2.5`            | Requires account                        |
| Hypereal               | `https://hypereal.tech/api/v1`   | `minimax-m2.5`            | 35 free credits                         |
| OpenAI                 | `https://api.openai.com/v1`      | `gpt-4o-mini`             | Paid                                    |
| Anthropic              | `https://api.anthropic.com`      | `claude-3-haiku`          | Paid                                    |

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **LLM**: Any OpenAI-compatible API
- **Storage**: localStorage (no database needed)

## License

MIT
