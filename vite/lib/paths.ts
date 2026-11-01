import path from "node:path";

export const ROOT_DIR = path.join(import.meta.dirname, "..", "..");
export const SOURCE_DIR = path.resolve(ROOT_DIR, "src");

export function viteCacheDir(name: string): string {
  return path.resolve(ROOT_DIR, "node_modules", ".vite", name);
}

const nodeCryptoAlias = {
  "node:crypto": path.resolve(SOURCE_DIR, "shims", "nodeCrypto.ts"),
} as const;

export const sharedResolveAlias = {
  ...nodeCryptoAlias,
  "vot-solid-renderer": path.resolve(SOURCE_DIR, "ui/solid/renderer.ts"),
} as const;

export const sharedCssOptions = {
  transformer: "lightningcss" as const,
};

export const sharedBuildOptions = {
  target: ["chrome106"],
  modulePreload: { polyfill: false },
  copyPublicDir: false,
  cssMinify: "lightningcss" as const,
  reportCompressedSize: false,
  chunkSizeWarningLimit: 700,
};
