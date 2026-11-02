import { localizationProvider, t } from "./localization/localizationProvider";
import type { Phrase } from "./types/localization";

class VOTLocalizedError extends Error {
  override name = "VOTLocalizedError";

  /** Original (non-localized) message key. */
  unlocalizedMessage: Phrase;

  /** Resolved localized message. */
  localizedMessage: string;

  /** Localized explanation shown as a tooltip next to the message. */
  hint?: string;

  constructor(message: Phrase, hint?: Phrase) {
    super(localizationProvider.getDefault(message));
    if (hint) this.hint = t(hint);
    this.unlocalizedMessage = message;
    this.localizedMessage = t(message);
  }
}

export default VOTLocalizedError;
