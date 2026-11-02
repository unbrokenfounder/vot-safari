import { VOTJSError } from "@vot.js/core/client";
import VOTLocalizedError from "../VOTLocalizedError";
import {
  getTranslationAuthErrorKind,
  getTranslationServerErrorMessage,
} from "./translationAuthError";

export function mapVotClientErrorForUi(
  error: unknown,
  hasAccountToken = false,
  proxyDisabled = false,
): unknown {
  const authErrorKind = getTranslationAuthErrorKind(error, { hasAccountToken });
  if (authErrorKind) {
    return new VOTLocalizedError(
      authErrorKind === "session-expired"
        ? "VOTYandexTokenExpired"
        : "VOTAccountRequired",
    );
  }

  if (!(error instanceof VOTJSError)) return error;

  const isRequestFailure =
    error.message === "Failed to request create session" ||
    error.message === "Failed to request video translation";
  if (proxyDisabled && isRequestFailure) {
    return new VOTLocalizedError(
      "requestTranslationFailed",
      "VOTProxyRequiredHint",
    );
  }

  switch (error.message) {
    case "Yandex couldn't translate video":
      return getTranslationServerErrorMessage(error)
        ? error
        : new VOTLocalizedError("requestTranslationFailed");
    case "Failed to request video translation":
      return new VOTLocalizedError("requestTranslationFailed");
    case "Audio link wasn't received from Yandex response":
      return new VOTLocalizedError("audioNotReceived");
    default:
      return error;
  }
}
