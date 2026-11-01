import { normalizePath, type Plugin, build as viteBuild } from "vite";
import { ROOT_DIR, SOURCE_DIR, sharedBuildOptions } from "./paths.ts";

const youtubePlayerSolverPath = normalizePath(
  `${SOURCE_DIR}/audioDownloader/strategies/ytPlayerSolver.js`,
);

const minifiedYouTubePlayerSolverPlugin: Plugin = {
  name: "vot-minified-youtube-player-solver",
  apply: "build",
  async load(id) {
    if (normalizePath(id) !== youtubePlayerSolverPath) return null;

    const result = await viteBuild({
      configFile: false,
      root: ROOT_DIR,
      publicDir: false,
      logLevel: "silent",
      build: {
        ...sharedBuildOptions,
        write: false,
        minify: "oxc",
        lib: {
          entry: youtubePlayerSolverPath,
          formats: ["es"],
        },
      },
    });
    const output = (Array.isArray(result) ? result : [result]).flatMap(
      (build) => ("output" in build ? build.output : []),
    );
    const chunk = output.find((item) => item.type === "chunk" && item.isEntry);
    if (chunk?.type !== "chunk") {
      throw new Error("Failed to build ytPlayerSolver.js");
    }
    return chunk.code;
  },
};

export const solidPluginOptions = {
  solid: {
    generate: "universal",
    moduleName: "vot-solid-renderer",
  },
} as const;

/** Plugins shared by every build that are not provided by a WXT module. */
export const sharedVitePlugins: Plugin[] = [minifiedYouTubePlayerSolverPlugin];
