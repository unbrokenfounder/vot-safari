import { localizationProvider } from "../localization/localizationProvider";
import { ensureCountryCode, getCountryCode } from "../videoHandler/shared";
import { votStorage } from "./storage";

const RUSSIAN_COUNTRIES = new Set(["RU", "BY", "KZ"]);

function hasRussianDeviceLanguage(): boolean {
  const languages = globalThis.navigator?.languages ?? [];
  return languages.some((language) => /^ru(-|$)/i.test(language));
}

async function hasRussianGeo(): Promise<boolean> {
  await ensureCountryCode();
  return RUSSIAN_COUNTRIES.has(getCountryCode() ?? "");
}

export async function shouldSuggestRussian(): Promise<boolean> {
  if (
    localizationProvider.langOverride !== "auto" ||
    localizationProvider.lang !== "en"
  ) {
    return false;
  }

  if (await votStorage.get<boolean>("localeSuggestionDismissed", false)) {
    return false;
  }

  return hasRussianDeviceLanguage() || (await hasRussianGeo());
}

export function dismissRussianSuggestion(): Promise<void> {
  return votStorage.set("localeSuggestionDismissed", true);
}

export async function acceptRussianSuggestion(): Promise<void> {
  await localizationProvider.changeLang("ru");
  await dismissRussianSuggestion();
}
