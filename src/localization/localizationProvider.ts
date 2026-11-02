import logger from "#utils/logger.ts";
import type { FlatPhrases, Locale, Phrase } from "../types/localization";
import type { LocaleStorageKey } from "../types/storage";
import { lang } from "../utils/localization";
import { votStorage } from "../utils/storage";
import { toFlatObj } from "../utils/utils";
import rawDefaultLocale from "./locales/en.json";
import rawRuLocale from "./locales/ru.json";

export type LangOverride = Locale | "auto";

const LOCALE_STORAGE_KEYS: readonly LocaleStorageKey[] = [
  "localePhrases",
  "localeLang",
  "localeHash",
  "localeVersion",
  "localeUpdatedAt",
  "localeLangOverride",
];
const DEFAULT_LOCALE: FlatPhrases = toFlatObj(rawDefaultLocale);

const BUNDLED_LOCALES: Record<Locale, FlatPhrases> = {
  en: DEFAULT_LOCALE,
  ru: toFlatObj(rawRuLocale) as FlatPhrases,
};
const availableLocales: readonly LangOverride[] = [
  "auto",
  ...(Object.keys(BUNDLED_LOCALES) as Locale[]),
];

class LocalizationProvider {
  /**
   * Language used before page was reloaded
   */
  lang: string;
  /**
   * Locale phrases with current language
   */
  locale: Partial<FlatPhrases>;
  readonly defaultLocale: FlatPhrases = DEFAULT_LOCALE;

  private readonly warnedMissingKeys = new Set<string>();
  private _langOverride: LangOverride = "auto";

  constructor() {
    this.lang = this.getLang();
    this.locale = BUNDLED_LOCALES[this.lang as Locale] ?? {};
  }

  async init() {
    this._langOverride = await votStorage.get<LangOverride>(
      "localeLangOverride",
      "auto",
    );
    return this.update();
  }

  get langOverride() {
    return this._langOverride;
  }

  getLang(): string {
    return this.langOverride === "auto" ? lang : this.langOverride;
  }

  getAvailableLangs(): LangOverride[] {
    return [...availableLocales];
  }

  async reset() {
    await Promise.all(LOCALE_STORAGE_KEYS.map((key) => votStorage.delete(key)));
    return this;
  }

  async changeLang(newLang: LangOverride) {
    if (this.langOverride === newLang) {
      return false;
    }

    await votStorage.set("localeLangOverride", newLang);
    this._langOverride = newLang;
    await this.update();
    return true;
  }

  /** Locales are bundled with the extension, so this never touches the network. */
  async update() {
    this.lang = this.getLang();
    this.locale = BUNDLED_LOCALES[this.lang as Locale] ?? {};
    this.warnedMissingKeys.clear();
    return this;
  }

  private getFromLocale(
    locale: Partial<FlatPhrases>,
    key: Phrase,
    source: "default" | "locale" = "locale",
  ) {
    const phrase = locale[key];
    return phrase ?? this.warnMissingKey(locale, key, source);
  }

  private warnMissingKey(
    locale: Partial<FlatPhrases>,
    key: Phrase,
    source: "default" | "locale",
  ): undefined {
    const warningKey = `${source}:${key}`;
    if (this.warnedMissingKeys.has(warningKey)) {
      return undefined;
    }

    this.warnedMissingKeys.add(warningKey);
    logger.warn(
      "[localizationProvider] locale",
      locale,
      "doesn't contain key",
      key,
    );
    return undefined;
  }

  getDefault(key: Phrase) {
    return this.getFromLocale(this.defaultLocale, key, "default") ?? key;
  }

  get(key: Phrase) {
    return this.getFromLocale(this.locale, key) ?? this.getDefault(key);
  }

  /** Phrase in a specific bundled locale, ignoring the active UI language. */
  getFor(lang: Locale, key: Phrase) {
    return BUNDLED_LOCALES[lang][key] ?? this.getDefault(key);
  }

  getLangLabel(lang: string) {
    const key = `langs.${lang}` as Phrase;
    if (key in this.defaultLocale) {
      const label = this.get(key);
      if (label) {
        return label;
      }
    }
    return lang.toUpperCase();
  }
}

export const localizationProvider = new LocalizationProvider();
export const t = localizationProvider.get.bind(localizationProvider);
/**
 * In the userscript build, SystemJS wrapping allowed a top-level await.
 * For the extension build we bootstrap through loader scripts and keep the
 * runtime initialization explicit, so avoid top-level await and expose a lazy
 * ready Promise instead.
 */
let localizationProviderReadyPromise: Promise<LocalizationProvider> | null =
  null;

export function ensureLocalizationProviderReady(): Promise<LocalizationProvider> {
  localizationProviderReadyPromise ??= localizationProvider.init();
  return localizationProviderReadyPromise;
}
