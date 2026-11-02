import { GM_fetch } from "#utils/gm.ts";
import logger from "#utils/logger.ts";
import { votStorage } from "#utils/storage.ts";
import { compareVersions } from "#utils/utils.ts";
import { LATEST_RELEASE_API_URL, UPDATE_CHECK_INTERVAL } from "./const.ts";
import { setUpdaterInfo, type UpdaterInfoStore, updaterInfo } from "./store.ts";
import type { LatestReleaseSchema } from "./types.ts";

async function fetchRemoteVersion(): Promise<string> {
  const res = await GM_fetch(LATEST_RELEASE_API_URL, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch remote version: ${res.status}`);
  }

  const data = (await res.json()) as LatestReleaseSchema;
  const version = data?.tag_name?.replace(/^v/i, "");
  if (!version) {
    throw new Error("Latest release has no tag name");
  }
  return version;
}

function canCheckUpdate() {
  return Date.now() - updaterInfo.checkedAt >= UPDATE_CHECK_INTERVAL;
}

const getAvailableUpdate = (version: string): string | false =>
  compareVersions(version, VOT_VERSION) > 0 ? version : false;

export async function checkUpdate(): Promise<string | false> {
  if (!canCheckUpdate()) {
    return getAvailableUpdate(updaterInfo.remoteVersion);
  }

  let remoteVersion: string;
  try {
    remoteVersion = await fetchRemoteVersion();
  } catch (error) {
    logger.error("[updater] Failed to fetch info about remote version", error);
    throw error;
  }

  const newData: UpdaterInfoStore = {
    remoteVersion,
    checkedAt: Date.now(),
  };
  await votStorage.set("updaterInfo", newData);
  setUpdaterInfo(newData);

  return getAvailableUpdate(remoteVersion);
}
