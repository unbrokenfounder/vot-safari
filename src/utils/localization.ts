import { availableTTS } from "@vot.js/shared/consts";
import type { ResponseLang } from "@vot.js/shared/types/data";

// This fork targets Russian-speaking users: UI language and the default
// translation target are fixed to Russian regardless of the browser language.
const DEFAULT_FORK_LANG = "ru";

function getNavigatorLang() {
  return DEFAULT_FORK_LANG;
}

const slavicLangs = new Set([
  "uk",
  "be",
  "bg",
  "mk",
  "sr",
  "bs",
  "hr",
  "sl",
  "pl",
  "sk",
  "cs",
]);

function resolveCalculatedResLang(baseLang: string): ResponseLang {
  if (availableTTS.includes(baseLang as ResponseLang)) {
    return baseLang as ResponseLang;
  }

  if (slavicLangs.has(baseLang)) {
    return "ru";
  }

  return "en";
}

export const lang = getNavigatorLang();
export const calculatedResLang: ResponseLang = resolveCalculatedResLang(lang);
