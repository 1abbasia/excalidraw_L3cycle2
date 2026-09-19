import { newElementWith } from "@excalidraw/element";

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
  initResult: {
    isExternalScene: boolean;
    id?: string | null;
    key?: string | null;
  },
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
 * Turns a loaded shared scene into an independent local copy.
 *
 * Source id/key are never part of the element/appState data (they're tracked
 * separately by the caller via `RemixableSceneInfo`), so there's nothing to
 * strip here — the returned scene is detached simply by never referencing
 * them again once passed to local storage.
 *
 * Every element is rebuilt via `newElementWith(el, {}, true)`, which bumps
 * `version`/`versionNonce`/`updated` on a fresh object without touching the
 * source elements — the same mechanism the rest of the app uses to signal
 * "new edit, not a continuation" for collab/history reconciliation.
 */
export const remixScene = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
): RemixResult => {
  return {
    elements: elements.map((element) => newElementWith(element, {}, true)),
    appState: { ...appState },
  };
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
  console.info("[remix]", event, meta ?? {});
};
