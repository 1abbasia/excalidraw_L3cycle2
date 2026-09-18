import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

export type RemixableSceneInfo = {
  isRemixable: boolean;
  sourceId: string | null;
  sourceKey: string | null;
};

/**
 * Determines remix-eligibility from `initializeScene`'s return shape.
 *
 * `initializeScene`'s result shape alone can't distinguish a static share
 * link (`jsonBackendMatch`) from live collaboration (`roomLinkData`) — both
 * produce an identical `{ isExternalScene: true; id: string; key: string }`
 * shape. `isCollabScene` must be supplied by the caller to disambiguate.
 *
 * A scene is only remixable when it's an external scene loaded via the
 * static share path — never during live collaboration.
 */
export const getRemixableSceneInfo = (
  initResult: { isExternalScene: boolean; id?: string | null; key?: string | null },
  isCollabScene: boolean,
): RemixableSceneInfo => {
  const sourceId = initResult.id ?? null;
  const sourceKey = initResult.key ?? null;

  const isRemixable =
    initResult.isExternalScene &&
    !isCollabScene &&
    sourceId !== null &&
    sourceKey !== null;

  return {
    isRemixable,
    sourceId: isRemixable ? sourceId : null,
    sourceKey: isRemixable ? sourceKey : null,
  };
};

export type RemixResult = {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
};

/**
 * Intended behavior (not implemented yet — next work session):
 * - Strip the source share's id/key so the result is not tied to the
 *   original backend record.
 * - Regenerate element versions (and version nonces) so the copy is treated
 *   as brand-new, independent history rather than a continuation of the
 *   source scene.
 * - Return a scene ready to be saved as a fresh local drawing (i.e. safe to
 *   pass straight into local storage / a new local scene), without ever
 *   mutating or affecting the original shared drawing.
 */
export const remixScene = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
): RemixResult => {
  throw new Error("not implemented — see JSDoc");
};

export type RemixTrackingEvent =
  | "footer_viewed"
  | "remix_clicked"
  | "remix_completed"
  | "reshared";

export const trackRemixEvent = (
  event: RemixTrackingEvent,
  meta?: Record<string, unknown>,
): void => {
  console.log("[remix]", event, meta ?? {});
};
