import { createSignal, type JSX } from "solid-js";
import { t } from "../../localization/localizationProvider";
import { AboutSection } from "../About/AboutSection";
import { AccountMenu, type AccountMenuProps } from "../Account/AccountMenu";
import { GeneralButton } from "../Button/GeneralButton";
import { Dialog, type DialogProps } from "../Dialog/Dialog";
import {
  SettingsAppearanceSection,
  type SettingsAppearanceSectionProps,
} from "./SettingsAppearanceSection";
import { SettingsFooter, type SettingsFooterProps } from "./SettingsFooter";
import {
  SettingsHotkeySection,
  type SettingsHotkeySectionProps,
} from "./SettingsHotkeySection";
import {
  SettingsMiscSection,
  type SettingsMiscSectionProps,
} from "./SettingsMiscSection";
import {
  SettingsProxySection,
  type SettingsProxySectionProps,
} from "./SettingsProxySection";
import { SettingsSection } from "./SettingsSection";
import {
  SettingsSubtitlesSection,
  type SettingsSubtitlesSectionProps,
} from "./SettingsSubtitlesSection";
import {
  SettingsTranslationSection,
  type SettingsTranslationSectionProps,
} from "./SettingsTranslationSection";

export type SettingsDialogProps = {
  account?: AccountMenuProps;
  translation?: SettingsTranslationSectionProps;
  hotkeys?: SettingsHotkeySectionProps;
  subtitles?: SettingsSubtitlesSectionProps;
  proxy?: SettingsProxySectionProps;
  appearance?: SettingsAppearanceSectionProps;
  misc?: SettingsMiscSectionProps;
  footer?: SettingsFooterProps;
  isOpen: boolean;
  ref?: DialogProps["ref"];
  onClose: () => void;
};

export function SettingsDialog(props: SettingsDialogProps): JSX.Element {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = createSignal(false);

  // The confirmation is a sibling, not a child: the settings dialog box is
  // transformed, which would break `position: fixed` of a nested dialog.
  return (
    <>
      <Dialog
        ref={props.ref}
        isOpen={props.isOpen}
        wide
        onClose={props.onClose}
        title={t("VOTSettings")}
      >
        <SettingsSection title={t("VOTMyAccount")} isOpen={true}>
          <AccountMenu {...props.account} />
        </SettingsSection>
        <SettingsTranslationSection {...props.translation} />
        <SettingsHotkeySection {...props.hotkeys} />
        <SettingsSubtitlesSection {...props.subtitles} />
        <SettingsProxySection {...props.proxy} />
        <SettingsMiscSection {...props.misc} />
        <SettingsAppearanceSection {...props.appearance} />
        <SettingsSection title={t("aboutExtension")} lazy>
          <AboutSection />
        </SettingsSection>
        <vot-block class="vot-settings-actions">
          <SettingsFooter
            onResetSettingsClick={() => setIsResetConfirmOpen(true)}
          />
        </vot-block>
      </Dialog>
      <Dialog
        isOpen={props.isOpen && isResetConfirmOpen()}
        onClose={() => setIsResetConfirmOpen(false)}
        title={t("resetSettings")}
        footer={
          <GeneralButton
            onClick={() => {
              setIsResetConfirmOpen(false);
              props.footer?.onResetSettingsClick?.();
            }}
          >
            {t("resetSettings")}
          </GeneralButton>
        }
      >
        <></>
      </Dialog>
    </>
  );
}
