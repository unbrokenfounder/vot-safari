import { createSignal, For, type JSX } from "solid-js";

import {
  type LangOverride,
  localizationProvider,
  t,
} from "../../localization/localizationProvider";
import type { Locale } from "../../types/localization";
import type { SelectOption } from "../Control/Select";
import { isKeyboardActivation } from "../componentShared";
import { SettingsSection } from "./SettingsSection";

export type SettingsLanguageSwitchProps = {
  onLangSelect?: (option: SelectOption) => void;
};

const LANGUAGES: readonly { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
];

export function SettingsLanguageSwitch(
  props: SettingsLanguageSwitchProps,
): JSX.Element {
  const [active, setActive] = createSignal(localizationProvider.lang);

  const select = (value: LangOverride, label: string) => {
    if (value === active()) {
      return;
    }
    setActive(value);
    props.onLangSelect?.({ value, label });
  };

  return (
    <SettingsSection title={t("VOTMenuLanguage")} alwaysOpen>
      <vot-block class="vot-language-switch" role="radiogroup">
        <For each={LANGUAGES}>
          {(language) => (
            <vot-block
              class="vot-language-switch__option"
              role="radio"
              tabIndex={0}
              aria-checked={active() === language.value}
              data-active={active() === language.value}
              onClick={() => select(language.value, language.label)}
              onKeyDown={(event) => {
                if (!isKeyboardActivation(event)) {
                  return;
                }
                event.preventDefault();
                select(language.value, language.label);
              }}
            >
              {language.label}
            </vot-block>
          )}
        </For>
      </vot-block>
    </SettingsSection>
  );
}
