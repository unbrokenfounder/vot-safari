import { type JSX, mergeProps } from "solid-js";

import { t } from "../../localization/localizationProvider";
import { votStorage } from "../../utils/storage";

export type AccountLoginProps = {
  ref?: (element: HTMLElement) => void;
  disableExternalLogin?: boolean;
  onClickLogin?: () => void;
};

export function AccountLogin(props: AccountLoginProps): JSX.Element {
  const finalProps = mergeProps(
    { disableExternalLogin: votStorage.isSupportOnlyLS },
    props,
  );

  return (
    <vot-block ref={finalProps.ref} class="vot-account-login">
      <vot-block class="vot-account-login__hint">
        Войдите, чтобы включить живые голоса
      </vot-block>
      <vot-block
        class="vot-account-login__btn"
        role="button"
        tabIndex={finalProps.disableExternalLogin ? -1 : 0}
        aria-disabled={finalProps.disableExternalLogin}
        onClick={() => {
          if (finalProps.disableExternalLogin) {
            return;
          }

          props.onClickLogin?.();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") {
            return;
          }

          event.preventDefault();
          event.currentTarget.click();
        }}
      >
        <vot-block class="vot-account-login__btn-icon" />
        <vot-block class="vot-account-login__btn-text">
          {t("VOTSignInWithYandex")}
        </vot-block>
      </vot-block>
    </vot-block>
  );
}
