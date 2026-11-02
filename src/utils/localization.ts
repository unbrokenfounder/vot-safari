import type { ResponseLang } from "@vot.js/shared/types/data";

export const DEFAULT_UI_LANG = "en";

// The default translation target is independent of the UI language: this
// fork is aimed at Russian-speaking viewers.
export const calculatedResLang: ResponseLang = "ru";

export const lang = DEFAULT_UI_LANG;
