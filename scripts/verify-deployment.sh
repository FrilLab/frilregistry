#!/usr/bin/env bash
set -euo pipefail

expected=${1:?Pass the reviewed registries.json path}
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

for attempt in {1..12}; do
  if status=$(curl --disable --noproxy '*' --proto '=https' --max-time 8 \
    --connect-timeout 4 --max-filesize "$(wc -c < "$expected" | tr -d '[:space:]')" \
    --silent --show-error --dump-header "$work/headers" --output "$work/body" \
    --write-out '%{http_code}' https://registry.frillab.com/registries.json) &&
    [[ "$status" == 200 ]] &&
    tr -d '\r' < "$work/headers" > "$work/normalized" &&
    grep -Fixq 'Content-Type: application/json; charset=utf-8' "$work/normalized" &&
    grep -Fixq 'Cache-Control: public, max-age=60, must-revalidate' "$work/normalized" &&
    cmp -s "$expected" "$work/body"; then
    shasum -a 256 "$work/body"
    exit 0
  fi
  if [[ "$attempt" -lt 12 ]]; then sleep 6; fi
done

echo 'Public directory did not serve the reviewed bytes and required headers.' >&2
exit 1
