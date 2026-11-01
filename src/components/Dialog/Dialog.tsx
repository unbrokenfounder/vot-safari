import {
  createEffect,
  createSignal,
  createUniqueId,
  type JSX,
  onCleanup,
  Show,
  untrack,
} from "solid-js";
import { t } from "../../localization/localizationProvider";
import { getDeepActiveElement } from "../../utils/dom";
import { IconButton } from "../Button/IconButton";
import { CloseIcon } from "../Icons/CloseIcon";
import { Overlay } from "../Utils/Overlay";

export type DialogProps = {
  title: JSX.Element;
  children: JSX.Element;
  footer?: JSX.Element;
  isOpen: boolean;
  wide?: boolean;
  ref?: (element: HTMLElement) => void;
  onClose: () => void;
};

const MARGIN_PX = 16;
const ENTER_MS = 360;
const EXIT_MS = 200;
const SPRING = "cubic-bezier(0.34, 1.4, 0.64, 1)";
const SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

export function Dialog(props: DialogProps): JSX.Element {
  const titleId = `vot-dialog-title-${createUniqueId()}`;
  // `mounted` keeps the dialog in the layout while its exit animation plays.
  // Animations use the Web Animations API instead of CSS transitions so that
  // they run identically in Safari, Chrome and Firefox.
  const [mounted, setMounted] = createSignal(props.isOpen);
  const [visible, setVisible] = createSignal(false);
  let container: HTMLElement | undefined;
  let box: HTMLElement | undefined;
  let contentWrapper: HTMLElement | undefined;
  let closeButton: HTMLElement | undefined;
  let previouslyFocused: Element | null = null;
  let adaptiveAlignObserver: ResizeObserver | undefined;
  let adaptiveAlignRaf: number | undefined;
  let backdrop: HTMLElement | undefined;
  let runningAnimations: Animation[] = [];
  const prefersReducedMotion = () =>
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const cancelAnimations = () => {
    for (const animation of runningAnimations) animation.cancel();
    runningAnimations = [];
  };

  const play = (
    element: HTMLElement | undefined,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ): Animation | undefined => {
    if (!element || typeof element.animate !== "function") return undefined;
    const animation = element.animate(keyframes, options);
    runningAnimations.push(animation);
    return animation;
  };

  const playEnter = () => {
    cancelAnimations();
    const reduced = prefersReducedMotion();
    play(backdrop, [{ opacity: 0 }, { opacity: 1 }], {
      duration: reduced ? 120 : 280,
      easing: SOFT,
    });
    play(box, [{ opacity: 0 }, { opacity: 1 }], {
      duration: reduced ? 120 : 260,
      easing: SOFT,
    });
    if (reduced) return;
    play(
      box,
      [
        { transform: "translateY(14px) scale(0.96)", filter: "blur(4px)" },
        { transform: "translateY(0) scale(1)", filter: "blur(0px)" },
      ],
      { duration: ENTER_MS, easing: SPRING },
    );
  };

  const playExit = (onDone: () => void) => {
    cancelAnimations();
    const reduced = prefersReducedMotion();
    const duration = reduced ? 100 : EXIT_MS;
    const animations = [
      play(backdrop, [{ opacity: 1 }, { opacity: 0 }], {
        duration,
        easing: SOFT,
        fill: "forwards",
      }),
      play(
        box,
        reduced
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              {
                opacity: 1,
                transform: "translateY(0) scale(1)",
                filter: "blur(0px)",
              },
              {
                opacity: 0,
                transform: "translateY(10px) scale(0.97)",
                filter: "blur(3px)",
              },
            ],
        { duration, easing: SOFT, fill: "forwards" },
      ),
    ].filter((animation): animation is Animation => !!animation);

    if (!animations.length) {
      onDone();
      return;
    }
    Promise.allSettled(animations.map((animation) => animation.finished)).then(
      () => {
        // A reopen cancels the exit animations; do not unmount in that case.
        if (
          animations.every((animation) => animation.playState === "finished")
        ) {
          onDone();
        }
      },
    );
  };

  const getFocusableElements = (): HTMLElement[] => {
    if (!container) return [];
    const selectors = [
      "button:not([disabled])",
      "[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
      "[role='button']:not([aria-disabled='true'])",
    ];
    return Array.from(
      container.querySelectorAll<HTMLElement>(selectors.join(",")),
    ).filter((element) => !element.hidden && element.getClientRects().length);
  };

  const restoreFocus = () => {
    const element = previouslyFocused;
    previouslyFocused = null;
    if (element instanceof HTMLElement && element.isConnected) {
      element.focus();
    }
  };

  const detachAdaptiveVerticalAlign = () => {
    adaptiveAlignObserver?.disconnect();
    adaptiveAlignObserver = undefined;
    globalThis.removeEventListener("resize", scheduleAdaptiveVerticalAlign);
    globalThis.visualViewport?.removeEventListener(
      "resize",
      scheduleAdaptiveVerticalAlign,
    );
    globalThis.visualViewport?.removeEventListener(
      "scroll",
      scheduleAdaptiveVerticalAlign,
    );
    if (adaptiveAlignRaf !== undefined) {
      cancelAnimationFrame(adaptiveAlignRaf);
      adaptiveAlignRaf = undefined;
    }
  };

  function updateAdaptiveVerticalAlign() {
    if (!box || !contentWrapper) return;
    const viewportHeight =
      globalThis.visualViewport?.height ?? globalThis.innerHeight;
    if (!viewportHeight || viewportHeight <= 0) return;

    const centerMaxPx = Math.max(160, Math.round(viewportHeight * 0.75));
    const topMaxPx = Math.max(160, Math.round(viewportHeight - MARGIN_PX * 2));
    const currentlyTop = box.dataset.verticalAlign === "top";
    const shouldTop = currentlyTop
      ? contentWrapper.scrollHeight > Math.round(viewportHeight * 0.6)
      : contentWrapper.scrollHeight >= centerMaxPx - 8;

    box.dataset.verticalAlign = shouldTop ? "top" : "center";
    box.style.setProperty(
      "--vot-dialog-max-height",
      `${shouldTop ? topMaxPx : centerMaxPx}px`,
    );
  }

  function scheduleAdaptiveVerticalAlign() {
    if (adaptiveAlignRaf !== undefined) {
      cancelAnimationFrame(adaptiveAlignRaf);
    }
    adaptiveAlignRaf = requestAnimationFrame(() => {
      adaptiveAlignRaf = undefined;
      updateAdaptiveVerticalAlign();
    });
  }

  const close = () => {
    if (!props.isOpen) return;
    props.onClose();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements();
    if (!focusableElements.length) {
      event.preventDefault();
      box?.focus();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements.at(-1) ?? first;
    const active = container
      ? getDeepActiveElement(container.getRootNode() as Document | ShadowRoot)
      : null;
    if (event.shiftKey && (active === first || active === box)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  createEffect(() => {
    if (props.isOpen) {
      setMounted(true);
      setVisible(true);
      playEnter();
      return;
    }

    setVisible(false);
    if (!untrack(mounted)) return;
    playExit(() => {
      cancelAnimations();
      if (!props.isOpen) setMounted(false);
    });
  });

  onCleanup(cancelAnimations);

  createEffect(() => {
    if (!props.isOpen) return;
    previouslyFocused ??= getDeepActiveElement(document);
    if (typeof ResizeObserver !== "undefined" && contentWrapper) {
      adaptiveAlignObserver = new ResizeObserver(scheduleAdaptiveVerticalAlign);
      adaptiveAlignObserver.observe(contentWrapper);
    }
    globalThis.addEventListener("resize", scheduleAdaptiveVerticalAlign, {
      passive: true,
    });
    globalThis.visualViewport?.addEventListener(
      "resize",
      scheduleAdaptiveVerticalAlign,
      { passive: true },
    );
    globalThis.visualViewport?.addEventListener(
      "scroll",
      scheduleAdaptiveVerticalAlign,
      { passive: true },
    );
    scheduleAdaptiveVerticalAlign();
    queueMicrotask(() => {
      if (props.isOpen) {
        (getFocusableElements()[0] ?? closeButton ?? box)?.focus();
      }
    });
    onCleanup(() => {
      detachAdaptiveVerticalAlign();
      restoreFocus();
    });
  });

  return (
    <Overlay
      ref={(element) => {
        container = element;
        props.ref?.(element);
      }}
      hidden={!mounted()}
      classList={{ "vot-dialog-container": true }}
      blockProps={{
        inert: props.isOpen ? undefined : true,
        onKeyDown: handleKeyDown,
      }}
    >
      <vot-block
        ref={(element) => (backdrop = element)}
        class="vot-dialog-backdrop"
        data-state={visible() ? "open" : "closed"}
        onClick={(event) => {
          event.stopPropagation();
          close();
        }}
      />
      <vot-block
        ref={(element) => (box = element)}
        class="vot-dialog"
        data-vertical-align="center"
        data-state={visible() ? "open" : "closed"}
        data-size={props.wide ? "wide" : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <vot-block
          ref={(element) => (contentWrapper = element)}
          class="vot-dialog-content-wrapper"
        >
          <vot-block class="vot-dialog-header-container">
            <vot-block class="vot-dialog-title-container">
              <vot-block class="vot-dialog-title" id={titleId}>
                {props.title}
              </vot-block>
            </vot-block>
            <IconButton
              ref={(element) => (closeButton = element)}
              ariaLabel={t("VOTClose")}
              onClick={close}
            >
              <CloseIcon />
            </IconButton>
          </vot-block>
          <vot-block class="vot-dialog-body-container">
            {props.children}
          </vot-block>
          <Show when={props.footer}>
            <vot-block class="vot-dialog-footer-container">
              {props.footer}
            </vot-block>
          </Show>
        </vot-block>
      </vot-block>
    </Overlay>
  );
}
