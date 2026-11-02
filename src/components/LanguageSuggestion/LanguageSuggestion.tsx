import type { JSX } from "solid-js";

import { localizationProvider } from "../../localization/localizationProvider";
import { GeneralButton } from "../Button/GeneralButton";
import { OutlinedButton } from "../Button/OutlinedButton";

export type LanguageSuggestionProps = {
  onAccept?: () => void;
  onDismiss?: () => void;
};

// The banner is only shown while the UI is English, so its copy is always
// read from the Russian locale.
const ru = (
  key:
    | "VOTLanguageSuggestionText"
    | "VOTLanguageSuggestionAccept"
    | "VOTLanguageSuggestionDismiss",
) => localizationProvider.getFor("ru", key);

export function LanguageSuggestion(
  props: LanguageSuggestionProps,
): JSX.Element {
  return (
    <vot-block class="vot-language-suggestion" role="dialog">
      <vot-block class="vot-language-suggestion__text">
        {ru("VOTLanguageSuggestionText")}
      </vot-block>
      <vot-block class="vot-language-suggestion__actions">
        <OutlinedButton onClick={() => props.onDismiss?.()}>
          {ru("VOTLanguageSuggestionDismiss")}
        </OutlinedButton>
        <GeneralButton onClick={() => props.onAccept?.()}>
          {ru("VOTLanguageSuggestionAccept")}
        </GeneralButton>
      </vot-block>
    </vot-block>
  );
}
