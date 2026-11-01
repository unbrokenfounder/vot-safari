#!/usr/bin/env bash
# Builds an ad-hoc signed "VOT Safari.app" and zips it into release/.
# No Apple Developer account needed; users must enable
# Safari -> Develop -> Allow Unsigned Extensions (see README).
set -euo pipefail

cd "$(dirname "$0")/.."

npm run build
DERIVED="$(mktemp -d)"
trap 'rm -rf "$DERIVED"' EXIT

xcodebuild \
  -project "safari/VOT Safari/VOT Safari.xcodeproj" \
  -scheme "VOT Safari" \
  -configuration Release \
  -derivedDataPath "$DERIVED" \
  CODE_SIGN_IDENTITY="-" \
  CODE_SIGNING_REQUIRED=YES \
  CODE_SIGNING_ALLOWED=YES \
  DEVELOPMENT_TEAM="" \
  ARCHS="arm64 x86_64" \
  ONLY_ACTIVE_ARCH=NO \
  build

mkdir -p release
rm -rf release/VOT-Safari.zip
APP="$DERIVED/Build/Products/Release/VOT Safari.app"
ditto -c -k --keepParent "$APP" release/VOT-Safari.zip
echo "Created release/VOT-Safari.zip"
