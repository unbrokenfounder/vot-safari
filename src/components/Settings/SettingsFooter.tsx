import type { JSX } from "solid-js";

import { t } from "../../localization/localizationProvider";
import { GeneralButton } from "../Button/GeneralButton";

export type SettingsFooterProps = {
  onResetSettingsClick?: () => void;
};

export function SettingsFooter(props: SettingsFooterProps): JSX.Element {
  return (
    <vot-block class="vot-settings-footer">
      <GeneralButton onClick={props.onResetSettingsClick}>
        {t("resetSettings")}
      </GeneralButton>
    </vot-block>
  );
}
