# Remix Feature — Codebase Map

For anyone (human or AI agent) picking up the Remix feature without prior context on this repo. Read this before touching any file listed below.

## Share vs. Collaboration

This codebase has **two unrelated systems** that both involve a link with an id/key in it. Don't conflate them.

- **Live collaboration** (`excalidraw-app/collab/Collab.tsx` + `Portal.tsx`): real-time multiplayer editing of the _same_ document via a room link. Uses a `socket.io` WebSocket connection to broadcast every edit to other clients in the room in real time. This is a different system from Remix and **must not be touched**.
- **Static share** (`excalidraw-app/App.tsx`'s `initializeScene` + `excalidraw-app/data/index.ts`'s `importFromBackend` / `exportToBackend`): a scene is encrypted client-side and POSTed to a backend, producing a `#json=id,key` link. Opening that link fetches and decrypts that one snapshot and loads it as the local scene — there's no ongoing connection back to the server after that. **This is where Remix belongs.**

**Remix is a static-share feature.** It has nothing to do with live collaboration.

## File map

| File | Role in this feature |
| --- | --- |
| `excalidraw-app/App.tsx` | Contains `initializeScene`, which detects the `#json=id,key` hash and loads the shared scene as the local scene on page load. The Remix footer/button UI is wired in here: `remixInfo` state, `handleRemix`, `remixConfirmationPhase` (drives the post-remix confirmation message timing), and the `reshared` tracking call in `onExportToBackend`. The `<Excalidraw>` wrapper's `paddingBottom` reserves `REMIX_FOOTER_HEIGHT` px whenever the footer *or* the confirmation message is showing, so neither ever overlaps the canvas or Excalidraw's own bottom-left/right controls. |
| `excalidraw-app/data/index.ts` | Contains `importFromBackend` (fetches + decrypts a shared scene by id/key) and `exportToBackend` (encrypts + POSTs a scene, producing a new id/key). Remix reuses `exportToBackend` when a remixed scene is re-shared. |
| `excalidraw-app/data/remix.ts` | The locked Remix interface contract — see below. Fully implemented, including `trackRemixEvent` forwarding to analytics. |
| `excalidraw-app/data/remix.test.ts` | Unit tests for `getRemixableSceneInfo`, `remixScene`, and `trackRemixEvent`'s analytics forwarding. |
| `excalidraw-app/components/RemixFooter.tsx` | The footer UI component: "Made with Excalidraw" + Remix button. Exports `REMIX_FOOTER_HEIGHT` (49px) as the single source of truth for the bar's rendered height, read by both this component's own layout and `App.tsx`'s reserved padding. Also renders the post-remix confirmation message (see below) in the same spot, as an alternate mode of the same component — never both at once. |
| `excalidraw-app/vite.config.mts` | Local-dev-only Vite proxy (`/api/v2` → `https://json.excalidraw.com`), added as a workaround while `json-dev.excalidraw.com` is down. Paired with a gitignored `.env.development.local`. Not part of the feature logic itself. |
| `packages/excalidraw/analytics.ts` | **Outside `excalidraw-app/`** — shared analytics used by the whole editor, not scoped to this feature. `trackRemixEvent` forwards here (`trackEvent("remix", ...)`) into the existing Simple Analytics (`sa_event`) pipeline, gated by `ALLOWED_CATEGORIES_TO_TRACK` (now includes `"remix"`) and `VITE_APP_ENABLE_TRACKING`. Only the allowlist entry was added; the pipeline itself pre-dates Remix. |
| `excalidraw-app/collab/Collab.tsx` | Implements live collaboration: session state, `isCollaborating()`, joining/leaving rooms, reconciling remote edits. Unrelated to Remix; exposes the `isCollaborating()` check Remix needs to avoid misfiring during a collab session. |
| `excalidraw-app/collab/Portal.tsx` | The live-collaboration transport layer: owns the `socket.io` connection, room id/key, and broadcasts scene updates to other clients in real time. Unrelated to Remix. |
| `excalidraw-app/data/firebase.ts` | Encrypted **file blob** storage (e.g. embedded images), used by _both_ the static-share flow (`exportToBackend`) and the collab flow. Not a "realtime sync" file — see Corrections. |

## Safe to modify

- `excalidraw-app/App.tsx` — to wire in the Remix footer/button and call `getRemixableSceneInfo` / `remixScene` from `remix.ts`.
- `excalidraw-app/data/remix.ts` — the feature's own logic file (implementing `remixScene`, adding new footer/UI-support code), subject to the interface-lock note below.
- `excalidraw-app/data/index.ts` — only if Remix needs to _call_ `exportToBackend` / `importFromBackend`; their existing signatures should not need to change.
- `excalidraw-app/components/RemixFooter.tsx` — the footer UI component.
- `packages/excalidraw/analytics.ts` — **with care.** This is shared infrastructure used across the whole editor, not scoped to Remix — unlike everything else on this list. Adding a category to `ALLOWED_CATEGORIES_TO_TRACK` is safe and already done (`"remix"`); don't change `trackEvent`'s existing behavior for other categories (`command_palette`, `export`, `ai`) as part of Remix work.

## Do not touch

- `excalidraw-app/collab/Collab.tsx` — live collaboration session/state management; a different system from Remix, and edits here risk breaking real-time multiplayer.
- `excalidraw-app/collab/Portal.tsx` — the live-collaboration WebSocket transport (room join/leave, broadcasting); same reason as above.
- `excalidraw-app/data/firebase.ts` — shared file-blob storage used by both flows; changing it risks breaking collab file sync as a side effect of a Remix change.
- Anything under `excalidraw-app/data/` not named above (`FileManager.ts`, `LocalData.ts`, `Locker.ts`, `TTDStorage.ts`, `tabSync.ts`, etc.) — unrelated persistence/local-storage internals with no known connection to Remix.

## Locked interface: `excalidraw-app/data/remix.ts`

This file's exported function and type signatures (`RemixableSceneInfo`, `getRemixableSceneInfo`, `RemixResult`, `remixScene`, `RemixTrackingEvent`, `trackRemixEvent`) are **locked**. Do not change them without flagging Ahsan first, even if a different design seems cleaner.

One detail specifically worth not rediscovering the hard way: `initializeScene`'s return shape **cannot by itself** tell you whether a scene came from the static share path or from live collaboration — both produce the identical shape `{ isExternalScene: true; id: string; key: string }`. That's why `getRemixableSceneInfo` takes a second, caller-supplied `isCollabScene` argument — it is the only thing that disambiguates the two. Whoever wires `remix.ts` into `App.tsx` must compute that flag correctly (e.g. from `collabAPI?.isCollaborating()`) and pass it in; getting it wrong would make the Remix button appear during a live collaboration session, which must never happen.

`remixScene` is implemented: it rebuilds every element via `newElementWith(el, {}, true)` to regenerate `version`/`versionNonce`/`updated` without mutating the source elements. Source id/key are never part of the element/appState data, so there's nothing to strip — the scene is detached simply by never referencing them again once passed to local storage.

All four `RemixTrackingEvent` values are wired and fire in practice: `footer_viewed` and `remix_clicked`/`remix_completed` from `App.tsx`, and `reshared` when a remixed scene (tracked via a `remixedFromSourceIdRef` that survives `remixInfo` resetting) gets shared again through `onExportToBackend`. `trackRemixEvent` forwards every call to `trackEvent("remix", event, JSON.stringify(meta))` in `packages/excalidraw/analytics.ts`, in addition to its original `console.info` logging — so events reach Simple Analytics in production, gated by that file's own `VITE_APP_ENABLE_TRACKING` and `isDevEnv()` checks (silently no-op in local dev by existing design, not a bug).

## Post-remix confirmation message

Regenerating element versions and detaching from the source link has no visible effect on its own — the scene was already editable before the click — so a brief confirmation ("This copy is yours to edit and share") replaces the footer in the same spot right after a successful remix, then fades out on its own.

- `RemixFooter.tsx` gained a `confirmationMessage`/`fading` mode on the *same* component (no new component/file): when `confirmationMessage` is set, it renders that text instead of "Made with Excalidraw" + the Remix button — that copy path is otherwise untouched. `fading` toggles the CSS `opacity` transition; if the browser reports `prefers-reduced-motion: reduce`, no `transition` is set at all, so the message still disappears on schedule but without animating.
- `App.tsx` owns all the timing via `remixConfirmationPhase` (`"hidden" → "visible" → "fading" → "hidden"`, driven by a `useEffect` with two `setTimeout`s — 4000ms visible, then 400ms fade — both cleaned up on unmount). `RemixFooter` itself holds no timers; it just renders whichever phase it's told to.
- Also added: a 1px `borderTop: var(--default-border-color, #f1f0ff)` on the footer bar — the same variable `LayerUI`/`DialogActionButton`/`Toast` already use for a themed 1px border — so the bar reads as a deliberate band in light mode instead of blending into a white canvas.

## Corrections

Two claims from the original brief needed adjustment after checking the code:

1. **"Opening a share link loads a read-only snapshot"** — not quite accurate. There is no `viewModeEnabled`/read-only flag applied to a scene loaded via `jsonBackendMatch`; it loads as a fully editable local scene like any other. `initializeScene` also clears the URL hash immediately after loading (`window.history.replaceState(...)`), so there's no persistent live link back to the source share once it's loaded — it really is a one-time, editable copy, just not literally "read-only." This distinction matters for Remix: the feature is really about making that existing "detached local copy" behavior explicit and giving it a clean identity (stripped id/key, fresh versions), not about unlocking something that was previously locked.

2. **"Firebase realtime sync internals"** — there's no realtime sync via Firebase in this codebase. Live collaboration's realtime transport is `socket.io` (`Collab.tsx` / `Portal.tsx`), not Firebase. `excalidraw-app/data/firebase.ts` is used only for encrypted file-blob storage (e.g. embedded images) and is shared by _both_ the collab flow and the static-share flow (`exportToBackend` already calls `saveFilesToFirebase`). It's listed under "do not touch" above for a different reason — it's shared infrastructure, not because it's collab-exclusive or realtime.

Everything else in the original brief (the Collab.tsx/Portal.tsx role, the App.tsx/data/index.ts static-share flow, the `remix.ts` interface-lock and `isCollabScene` disambiguation detail, and the absence of any existing duplicate/fork-scene function anywhere in the codebase) checked out as stated.
