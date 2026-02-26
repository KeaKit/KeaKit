#!/bin/sh

# Obtener solo la primera línea del mensaje
FIRST_LINE=$(head -n 1 "$1" | tr -d '\r')

# Regex para Conventional Commits
PATTERN="^(feat|fix|docs|style|refactor|test|chore)(\([a-z0-9\-]+\))?: .+"

# Regex para merges o pull requests de GitHub
GITHUB_PATTERN="^Merge (branch|pull request)"

# Validar commit
if ! echo "$FIRST_LINE" | grep -qE "$PATTERN|$GITHUB_PATTERN"; then
  echo "ERROR: Commit message does not follow Conventional Commits"
  echo "Examples of valid commits:"
  echo "  feat(login): add Google auth"
  echo "  fix(api): handle null response"
  echo "  Merge pull request #123 from feature/branch"
  exit 1
fi