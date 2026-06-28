#!/usr/bin/env bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

git add -A

echo -e "${CYAN}=== Changes to push ===${NC}"
git diff --cached --stat

echo ""
echo -e "${YELLOW}Review the changes above. Continue? [Y/n]${NC} "
read -r CONFIRM
if [[ "$CONFIRM" =~ ^[Nn] ]]; then
  echo -e "${RED}Aborted.${NC}"
  exit 1
fi

echo ""
echo -e "${CYAN}=== Running checks ===${NC}"
pnpm run typecheck && pnpm run lint && pnpm run format:check
echo -e "${GREEN}Checks passed.${NC}"

echo ""
BRANCH=$(git rev-parse --abbrev-ref HEAD)
FILES=$(git diff --cached --name-only)

SCOPE=$(echo "$FILES" | head -3 | tr '\n' ',' | sed 's/,$//')

if [[ $BRANCH =~ ^(feat|fix|chore|docs|refactor|test|style)([/-])(.*) ]]; then
  TYPE="${BASH_REMATCH[1]}"
  DESC="${BASH_REMATCH[3]}"
  DESC=$(echo "$DESC" | sed 's/-/ /g')
else
  TYPE="chore"
  DESC="$BRANCH"
fi

SUGGESTED="$TYPE: $DESC"
echo -e "${YELLOW}Suggested commit message:${NC} $SUGGESTED"
echo -e "${YELLOW}Enter custom message (leave empty to use suggested):${NC} "
read -r MSG

if [ -z "$MSG" ]; then
  MSG="$SUGGESTED"
fi

git commit -m "$MSG"
git push

echo ""
echo -e "${GREEN}✓ Pushed:${NC} $MSG"
