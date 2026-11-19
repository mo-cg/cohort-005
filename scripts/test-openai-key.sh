#!/usr/bin/env bash
# Test an OpenAI API key without installing project dependencies.
set -euo pipefail

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo 'Set OPENAI_API_KEY before running this script.' >&2
  exit 2
fi

response_file=$(mktemp)
trap 'rm -f "$response_file"' EXIT

if ! status=$(curl --silent --show-error --output "$response_file" --write-out '%{http_code}' \
  --connect-timeout 10 --max-time 30 \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models); then
  echo 'Could not reach the OpenAI API.' >&2
  exit 1
fi

if [[ "$status" == 200 ]]; then
  echo 'OpenAI API key authenticated successfully.'
else
  echo "OpenAI API request failed (HTTP $status)." >&2
  cat "$response_file" >&2
  echo >&2
  exit 1
fi
