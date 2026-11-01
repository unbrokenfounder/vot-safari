import {
  createMemo,
  createSignal,
  createUniqueId,
  type JSX,
  mergeProps,
  Show,
} from "solid-js";
import { effect } from "solid-js/web";

import { RawButton } from "../Button/RawButton";

export type SettingsSectionProps = {
  title: string;
  children: JSX.Element;
  isOpen?: boolean;
  lazy?: boolean;
};

export function SettingsSection(props: SettingsSectionProps): JSX.Element {
  const finalProps = mergeProps({ isOpen: false }, props);

  const sectionId = createUniqueId();
  const headerId = `${sectionId}-header`;
  const contentId = `${sectionId}-content`;

  const [isOpen, setIsOpen] = createSignal(finalProps.isOpen);

  // stays mounted after first open so collapsing doesn't re-run its resources
  const wasOpened = createMemo<boolean>((prev) => prev || isOpen(), false);

  effect(() => {
    setIsOpen(finalProps.isOpen);
  });

  return (
    <vot-block class="vot-settings-section" data-open={isOpen()}>
      <RawButton
        class="vot-details vot-settings-section__header"
        buttonProps={{
          id: headerId,
          "aria-controls": contentId,
          "data-open": isOpen(),
          "aria-expanded": isOpen(),
        }}
        onClick={() => {
          setIsOpen(!isOpen());
        }}
      >
        <vot-block>{finalProps.title}</vot-block>
        <vot-block class="vot-settings-section__chevron">
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 6.5L8 10.5L12 6.5" />
          </svg>
        </vot-block>
      </RawButton>

      <vot-block class="vot-settings-section__panel">
        <vot-block class="vot-settings-section__panel-inner">
          <vot-block
            class="vot-settings-section__content"
            id={contentId}
            role="region"
            aria-labelledby={headerId}
          >
            <Show when={!finalProps.lazy || wasOpened()}>
              {finalProps.children}
            </Show>
          </vot-block>
        </vot-block>
      </vot-block>
    </vot-block>
  );
}
