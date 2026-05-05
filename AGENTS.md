<!-- BEGIN:sofrito-agent-rules -->
# Sofrito Agent Rules

## Communication

- Don't create commits unless explicitly told to do so
- Don't push commits unless explicitly told to do so
- Always confirm before destructive operations (push, force push, reset)

## Development Workflow

- Run lint + typecheck + build before every commit
- Run CI checks locally first: `npm run typecheck && npm run lint && npm run build`
- Use meaningful commit messages with scope prefix (e.g., `fix:`, `feat:`, `docs:`)

## Code Style

- Use inline `eslint-disable` comments with clear justification when needed
- Prefer specific disable rules over global disable in config
- Example: `// eslint-disable-next-line react-hooks/set-state-in-effect - Safe: localStorage init`

## Testing

- Run tests before pushing edge changes
- Keep tests in: `tests/` or alongside components with `.test.ts`/`.spec.ts`

## Git Commits

- Use conventional commits format: `<type>: <description>`
- Types: `fix:`, `feat:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep commits atomic and focused

## Before Push

- Verify all CI checks pass locally
- Check for sensitive data in commits (API keys, secrets go in .env)

## When in Doubt

- Ask for clarification rather than assuming
- Don't make changes to production configs without confirmation
<!-- END:sofrito-agent-rules -->