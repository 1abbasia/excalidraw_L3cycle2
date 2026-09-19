import React from "react";

// Renders as a bar fixed over the bottom of the viewport — layered above the
// drawing canvas as chrome, not as part of the drawn scene — distinct from
// `AppFooter`, which renders inside Excalidraw's own `Footer` canvas-UI slot.
// Rendered as a child of `<Excalidraw>` (like `ShareDialog`/`AppSidebar`) so
// it sits inside the `.excalidraw` DOM subtree and inherits the app's theme
// CSS variables, e.g. `--ui-font`, the same UI font every other Excalidraw
// control uses (buttons don't inherit font-family from ancestors by
// default, so it's set explicitly below rather than relying on cascade).
export const RemixFooter = React.memo(
  ({ onRemix }: { onRemix: () => void }) => {
    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: ".625rem 1rem",
          background: "var(--island-bg-color, #232329)",
          color: "var(--text-primary-color, #fff)",
          fontFamily: "var(--ui-font)",
          fontSize: ".875rem",
        }}
      >
        <span>You're viewing a shared Excalidraw drawing.</span>
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
      </div>
    );
  },
);
