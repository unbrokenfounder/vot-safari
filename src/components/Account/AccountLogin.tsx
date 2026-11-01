import { createSignal, type JSX, mergeProps, Show } from "solid-js";

import { updateAccountByCallbackData } from "#modules/auth/yandex.ts";

import { votStorage } from "../../utils/storage";
import { GeneralButton } from "../Button/GeneralButton";
import { Textfield } from "../Textfield/Textfield";

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

  // Fallback for browsers where the sign-in window cannot hand the code back
  // to this page (the opener link is severed): the user pastes it manually.
  const [awaitingCode, setAwaitingCode] = createSignal(false);
  const [code, setCode] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [codeError, setCodeError] = createSignal("");

  const submitCode = async () => {
    const value = code().trim();
    if (!value || isSubmitting()) {
      return;
    }

    setIsSubmitting(true);
    setCodeError("");
    try {
      await updateAccountByCallbackData({
        state: sessionStorage.getItem("votYandexState") ?? "",
        code: value,
      });
    } catch {
      setCodeError("Не удалось войти. Проверьте код или войдите заново.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

          setAwaitingCode(true);
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
          Продолжить через Яндекс
        </vot-block>
      </vot-block>
      <Show when={awaitingCode()}>
        <vot-block class="vot-account-login__code">
          <vot-block class="vot-account-login__code-hint">
            Если окно Яндекса не закрылось само, скопируйте из него код и
            вставьте сюда.
          </vot-block>
          <vot-block class="vot-account-login__code-row">
            <Textfield
              labelText="Код из окна Яндекса"
              placeholder="Вставьте код"
              value={code()}
              onInput={(value) => setCode(value)}
              onChange={(value) => setCode(value)}
            />
            <GeneralButton onClick={submitCode} disabled={isSubmitting()}>
              Подтвердить
            </GeneralButton>
          </vot-block>
          <Show when={codeError()}>
            <vot-block class="vot-account-login__code-error">
              {codeError()}
            </vot-block>
          </Show>
        </vot-block>
      </Show>
    </vot-block>
  );
}
