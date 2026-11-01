#!/usr/bin/env bash
# Builds the extension and regenerates the Xcode project in ./safari.
# Requires full Xcode (xcrun safari-web-extension-converter).
set -euo pipefail

cd "$(dirname "$0")/.."

npm run build
rm -rf safari
xcrun safari-web-extension-converter .output/chrome-mv3 \
  --project-location safari \
  --app-name "VOT Safari" \
  --bundle-identifier com.lurevelle.VOT-Safari \
  --macos-only --no-open --no-prompt --force

echo "Xcode project: safari/VOT Safari/VOT Safari.xcodeproj"
