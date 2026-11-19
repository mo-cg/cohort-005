#!/usr/bin/env bash
# Test Codex with an API key without using or changing the normal login.
set -euo pipefail

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo 'Set OPENAI_API_KEY before running this script.' >&2
  exit 2
fi
if ! command -v codex >/dev/null 2>&1; then
  echo 'Install the Codex CLI before running this script.' >&2
  exit 2
fi

test_codex_home=$(mktemp -d)
trap 'rm -rf "$test_codex_home"' EXIT
export CODEX_HOME="$test_codex_home"

printf '%s' "$OPENAI_API_KEY" | codex login --with-api-key
codex exec -m "${CODEX_TEST_MODEL:-gpt-6.1-terra}" 'Reply with the word OK.'
