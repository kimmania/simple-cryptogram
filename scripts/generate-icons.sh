#!/usr/bin/env bash
# Regenerate PWA icon sizes from public/icons/icon-source.png
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/public/icons"
SRC="$DIR/icon-source.png"

if [[ ! -f "$SRC" ]]; then
  echo "Missing $SRC — add a 512×512 master icon first." >&2
  exit 1
fi

cp "$SRC" "$DIR/icon-512.png"
sips -z 192 192 "$DIR/icon-512.png" --out "$DIR/icon-192.png" >/dev/null
sips -z 180 180 "$DIR/icon-512.png" --out "$DIR/apple-touch-icon.png" >/dev/null
echo "Wrote icon-512.png, icon-192.png, apple-touch-icon.png"
