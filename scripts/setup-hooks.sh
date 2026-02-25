#!/bin/sh
mkdir -p .git/hooks
ln -sf ../../scripts/validate-commit-msg.sh .git/hooks/commit-msg
echo Added all hooks
chmod +x scripts/validate-commit-msg.sh