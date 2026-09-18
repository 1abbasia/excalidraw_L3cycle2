import React from "react";

// Renders as a bar layered over the bottom of the app, outside the drawing
// canvas itself — distinct from `AppFooter`, which renders inside
// Excalidraw's own `Footer` canvas-UI slot.
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
          color: "var(--color-primary-on-fill, #fff)",
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
            fontSize: ".875rem",
            fontWeight: 600,
            cursor: "pointer",
            background: "var(--color-primary, #6965db)",
            color: "#fff",
          }}
        >
          Remix
        </button>
      </div>
    );
  },
);
