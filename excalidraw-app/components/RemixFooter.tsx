import React from "react";

// Renders as a bar fixed over the bottom of the viewport — layered above the
// drawing canvas as chrome, not as part of the drawn scene — distinct from
// `AppFooter`, which renders inside Excalidraw's own `Footer` canvas-UI slot.
// Rendered as a child of `<Excalidraw>` (like `ShareDialog`/`AppSidebar`) so
// it sits inside the `.excalidraw` DOM subtree and inherits the app's theme
// CSS variables, e.g. `--ui-font`, the same UI font every other Excalidraw
// control uses (buttons don't inherit font-family from ancestors by
// default, so it's set explicitly below rather than relying on cascade).
// Single source of truth for the footer's rendered height, in px. The
// wrapper around <Excalidraw> (see App.tsx) reserves exactly this much
// bottom padding when the footer is showing, so Excalidraw's own canvas
// and its native bottom-left/right controls reflow above it instead of
// being painted over by this fixed-position bar.
export const REMIX_FOOTER_HEIGHT = 49;

// When `confirmationMessage` is set, the bar shows that message instead of
// the "Made with Excalidraw" + Remix button content — same position/size/
// theme as the regular footer (this is what replaces it right after a
// remix), never both at once. `onRemix` is unused in that mode. `fading`
// drives the opacity transition out; the parent (App.tsx) owns the timing
// (when to start fading, when to stop rendering this entirely) so this
// component stays a plain, timer-free presentational bar.
type RemixFooterProps = {
  onRemix?: () => void;
  confirmationMessage?: string;
  fading?: boolean;
};

export const RemixFooter = React.memo(
  ({ onRemix, confirmationMessage, fading = false }: RemixFooterProps) => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          height: REMIX_FOOTER_HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: ".625rem 1rem",
          background: "var(--island-bg-color, #232329)",
          color: "var(--text-primary-color, #fff)",
          fontFamily: "var(--ui-font)",
          fontSize: ".875rem",
          // Light mode's island background reads as near-white against the
          // (also white) canvas with no separation otherwise.
          borderTop: "1px solid var(--default-border-color, #f1f0ff)",
          opacity: fading ? 0 : 1,
          transition: prefersReducedMotion ? undefined : "opacity 0.4s ease",
        }}
      >
        {confirmationMessage ? (
          <span>{confirmationMessage}</span>
        ) : (
          <>
            <span>Made with Excalidraw</span>
            <button
              type="button"
              onClick={onRemix}
              style={{
                border: "none",
                borderRadius: "0.375rem",
                padding: ".375rem .875rem",
                fontFamily: "var(--ui-font)",
                fontSize: ".875rem",
                fontWeight: 600,
                cursor: "pointer",
                background: "var(--color-primary, #6965db)",
                color: "var(--color-surface-lowest, #fff)",
              }}
            >
              Remix
            </button>
          </>
        )}
      </div>
    );
  },
);
