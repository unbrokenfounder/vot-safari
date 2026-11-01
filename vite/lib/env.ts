import { loadEnv } from "vite";
import { defineConstants, type ViteDefine } from "./define.ts";
import { ROOT_DIR } from "./paths.ts";

export interface BuildEnvMeta {
  debug: boolean;
  availableLocales: readonly string[];
  repoBranch: string;
  version: string;
  authors: string;
}

export function getBuildConfig(mode: string) {
  const env = loadEnv(mode, ROOT_DIR, "");
  return {
    REPO_BRANCH: env.GITHUB_REF_NAME || env.REPO_BRANCH || "master",
  } as const;
}

/**
 * DEBUG_MODE resolution: an explicit `DEBUG_MODE` env var (process.env or
 * .env.[mode] files) overrides the command/mode-based default.
 */
export function resolveDebugMode(mode: string, fallback: boolean): boolean {
  const raw = (process.env.DEBUG_MODE ?? loadEnv(mode, ROOT_DIR, "").DEBUG_MODE)
    ?.trim()
    .toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return fallback;
}

export function buildDefine(env: BuildEnvMeta): ViteDefine {
  return defineConstants({
    DEBUG_MODE: env.debug,
    IS_EXTENSION: true,
    AVAILABLE_LOCALES: [...env.availableLocales],
    REPO_BRANCH: env.repoBranch,
    VOT_BUILD_VARIANT: "chrome",
    VOT_VERSION: env.version,
    VOT_AUTHORS: env.authors,
  });
}
