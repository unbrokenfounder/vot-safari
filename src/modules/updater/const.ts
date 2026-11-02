import { repositoryUrl } from "#config/config.ts";

export const LATEST_RELEASE_URL = `${repositoryUrl}/releases/latest`;
export const LATEST_RELEASE_API_URL = `${repositoryUrl.replace(
  "https://github.com/",
  "https://api.github.com/repos/",
)}/releases/latest`;

// 6 hours in milliseconds
export const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000;
