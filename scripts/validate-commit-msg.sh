#!/bin/sh
FIRST_LINE=$(head -n 1 "$1")

PATTERN="^(feat|fix|docs|style|refactor|test|chore)(\([a-z0-9\-]+\))?: .+"

if ! echo "$FIRST_LINE" | grep -qE "$PATTERN"; then
  echo "ERROR: Commit message does not follow Conventional Commits"
  exit 1
fi