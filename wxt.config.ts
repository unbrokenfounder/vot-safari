import fs from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "wxt";
import headers from "./src/headers.json";
import { buildDefine, getBuildConfig, resolveDebugMode } from "./vite/lib/env";
import {
  buildExtensionManifest,
  type ExtensionHeaders,
  getAllMatches,
  getDevContentScriptMatches,
  iconPathFn,
  splitMatchesForOriginFallback,
} from "./vite/lib/extension/manifest-helpers";
import {
  SOURCE_DIR,
  sharedCssOptions,
  sharedResolveAlias,
  viteCacheDir,
} from "./vite/lib/paths";
import {
  sharedVitePlugins,
  solidPluginOptions,
} from "./vite/lib/vite-base-config";

async function getLocaleCodes(): Promise<string[]> {
  const entries = await fs.readdir(
    path.join(SOURCE_DIR, "localization", "locales"),
    { withFileTypes: true },
  );
  const codes = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name.replace(/\.json$/i, ""))
    .sort((a, b) => a.localeCompare(b));
  const priority = ["auto", "en", "ru"];
  return [
    ...new Set([
      ...priority.filter((item) => item === "auto" || codes.includes(item)),
      ...codes.filter((code) => !priority.includes(code)),
    ]),
  ];
}

const extensionHeaders = headers as ExtensionHeaders;

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "entrypoints",
  outDir: ".output",
  publicDir: "src/public",
  manifestVersion: 3,
  browser: "chrome",
  imports: false,
  // Official WXT module: vite-plugin-solid + solid-refresh HMR in `wxt` dev.
  modules: ["@wxt-dev/module-solid"],
  solid: { vite: solidPluginOptions },
  dev: {
    reloadCommand: "Alt+R",
  },
  webExt: {
    startUrls: ["https://www.youtube.com/"],
    keepProfileChanges: true,
  },
  manifest: () => {
    const manifest = buildExtensionManifest({
      headers: extensionHeaders,
      versionName: headers.version,
    });

    // content_scripts `world: "MAIN"` requires Chrome 111+; older Chrome
    // ignores the key and would run MAIN-world scripts in ISOLATED.
    return { ...manifest, minimum_chrome_version: "111" };
  },
  vite: async (env) => {
    // DEBUG_MODE=true|false env overrides; default: dev server / development.
    const debug = resolveDebugMode(
      env.mode,
      env.command === "serve" || env.mode === "development",
    );
    const version = String(headers.version || "");

    return {
      cacheDir: viteCacheDir(`wxt-${env.browser}-${env.mode}`),
      plugins: [...sharedVitePlugins],
      resolve: {
        alias: sharedResolveAlias,
        dedupe: ["solid-js", "solid-js/web", "solid-js/store"],
      },
      css: sharedCssOptions,
      define: buildDefine({
        debug,
        availableLocales: await getLocaleCodes(),
        repoBranch: getBuildConfig(env.mode).REPO_BRANCH,
        version,
        authors: String(headers.author || ""),
      }),
      build: {
        target: ["chrome106"],
        cssMinify: "lightningcss",
        reportCompressedSize: false,
        chunkSizeWarningLimit: 700,
        minify: debug ? false : "oxc",
        sourcemap: debug ? "inline" : false,
      },
    };
  },
  hooks: {
    // `wxt` dev (MV3) registers content scripts at runtime from entrypoint
    // options, so path-specific matches added in build:manifestGenerated never
    // reach dev. Give dev the full production list + direct video files + Udemy.
    "entrypoints:resolved": (wxt, entrypoints) => {
      if (wxt.config.command !== "serve") return;
      const devMatches = getDevContentScriptMatches(
        getAllMatches(extensionHeaders),
      );
      for (const entry of entrypoints) {
        if (entry.type !== "content-script") continue;
        entry.options.matches = [...devMatches];
        // Chrome rejects match_origin_as_fallback on non-"/*" paths.
        Reflect.deleteProperty(entry.options, "matchOriginAsFallback");
      }
    },
    "build:manifestGenerated": (wxt, manifest) => {
      if (wxt.config.command === "serve" || !manifest.content_scripts) return;

      // Chrome rejects match_origin_as_fallback on patterns with a non-"/*"
      // path, so path-specific matches get duplicated entries without it.
      const { directMatches } = splitMatchesForOriginFallback(
        getAllMatches(extensionHeaders),
      );
      if (!directMatches.length) return;

      const directScripts = manifest.content_scripts.map((script) => {
        const entry = { ...script, matches: directMatches };
        Reflect.deleteProperty(entry, "match_origin_as_fallback");
        return entry;
      });
      manifest.content_scripts.push(...directScripts);
    },
  },
});
