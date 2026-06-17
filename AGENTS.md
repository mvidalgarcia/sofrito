<!-- BEGIN:sofrito-agent-rules -->

# Sofrito Agent Rules

## Communication

- DO NOT CREATE COMMITS unless explicitly told to do so
- DO NOT PUSH COMMITS unless explicitly told to do so
- Always confirm before destructive operations (push, force push, reset)

## Development Workflow

- Run lint + typecheck + build before every commit
- Run CI checks locally first: `pnpm run typecheck && pnpm run lint && pnpm run build`
- Use meaningful commit messages with scope prefix (e.g., `fix:`, `feat:`, `docs:`)

## Code Style

- Use inline `eslint-disable` comments with clear justification when needed
- Prefer specific disable rules over global disable in config
- Example: `// eslint-disable-next-line react-hooks/set-state-in-effect - Safe: localStorage init`

## Testing

- Run tests before pushing edge changes
- Keep tests in: `tests/` or alongside components with `.test.ts`/`.spec.ts`
- E2E tests: `pnpm run test:e2e`
- Run a single spec: `pnpm exec playwright test tests/e2e/<file>.spec.ts`
- `E2E_TEST=true` bypasses auth middleware — set automatically by `playwright.config.ts` for the dev server; overridable via env var

## Git Commits

- Use conventional commits format: `<type>: <description>`
- Types: `fix:`, `feat:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep commits atomic and focused

## Before Push

- Verify all CI checks pass locally
- Check for sensitive data in commits (API keys, secrets go in .env)

## Next.js 16

- `middleware.ts` was renamed to `proxy.ts` (see https://nextjs.org/docs/messages/middleware-to-proxy)
- Auth middleware lives in `src/proxy.ts` alongside next-intl routing

## Environment

- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` required for Google SSO
- Generate AUTH_SECRET: `openssl rand -base64 32`

## When in Doubt

- Ask for clarification rather than assuming
- Don't make changes to production configs without confirmation
<!-- END:sofrito-agent-rules -->
