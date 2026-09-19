# Remix Feature — Codebase Map

For anyone (human or AI agent) picking up the Remix feature without prior context on
this repo. Read this before touching any file listed below.

## Share vs. Collaboration

This codebase has **two unrelated systems** that both involve a link with an id/key
in it. Don't conflate them.

- **Live collaboration** (`excalidraw-app/collab/Collab.tsx` + `Portal.tsx`): real-time
  multiplayer editing of the *same* document via a room link. Uses a `socket.io`
  WebSocket connection to broadcast every edit to other clients in the room in real
  time. This is a different system from Remix and **must not be touched**.
- **Static share** (`excalidraw-app/App.tsx`'s `initializeScene` +
  `excalidraw-app/data/index.ts`'s `importFromBackend` / `exportToBackend`): a scene
  is encrypted client-side and POSTed to a backend, producing a `#json=id,key` link.
  Opening that link fetches and decrypts that one snapshot and loads it as the local
  scene — there's no ongoing connection back to the server after that. **This is
  where Remix belongs.**

**Remix is a static-share feature.** It has nothing to do with live collaboration.

## File map

| File | Role in this feature |
|---|---|
| `excalidraw-app/App.tsx` | Contains `initializeScene`, which detects the `#json=id,key` hash and loads the shared scene as the local scene on page load. This is where the Remix footer/button UI will eventually be wired in. |
| `excalidraw-app/data/index.ts` | Contains `importFromBackend` (fetches + decrypts a shared scene by id/key) and `exportToBackend` (encrypts + POSTs a scene, producing a new id/key). Remix will reuse `exportToBackend` when a remixed scene is re-shared. |
| `excalidraw-app/data/remix.ts` | **New file.** The locked Remix interface contract — see below. |
| `excalidraw-app/collab/Collab.tsx` | Implements live collaboration: session state, `isCollaborating()`, joining/leaving rooms, reconciling remote edits. Unrelated to Remix; exposes the `isCollaborating()` check Remix needs to avoid misfiring during a collab session. |
| `excalidraw-app/collab/Portal.tsx` | The live-collaboration transport layer: owns the `socket.io` connection, room id/key, and broadcasts scene updates to other clients in real time. Unrelated to Remix. |
| `excalidraw-app/data/firebase.ts` | Encrypted **file blob** storage (e.g. embedded images), used by *both* the static-share flow (`exportToBackend`) and the collab flow. Not a "realtime sync" file — see Corrections. |

## Safe to modify

- `excalidraw-app/App.tsx` — to wire in the Remix footer/button and call
  `getRemixableSceneInfo` / `remixScene` from `remix.ts`.
- `excalidraw-app/data/remix.ts` — the feature's own logic file (implementing
  `remixScene`, adding new footer/UI-support code), subject to the interface-lock
  note below.
- `excalidraw-app/data/index.ts` — only if Remix needs to *call* `exportToBackend` /
  `importFromBackend`; their existing signatures should not need to change.
- New files for the footer UI component itself (doesn't exist yet).

## Do not touch

- `excalidraw-app/collab/Collab.tsx` — live collaboration session/state management;
  a different system from Remix, and edits here risk breaking real-time multiplayer.
- `excalidraw-app/collab/Portal.tsx` — the live-collaboration WebSocket transport
  (room join/leave, broadcasting); same reason as above.
- `excalidraw-app/data/firebase.ts` — shared file-blob storage used by both flows;
  changing it risks breaking collab file sync as a side effect of a Remix change.
- Anything under `excalidraw-app/data/` not named above (`FileManager.ts`,
  `LocalData.ts`, `Locker.ts`, `TTDStorage.ts`, `tabSync.ts`, etc.) — unrelated
  persistence/local-storage internals with no known connection to Remix.

## Locked interface: `excalidraw-app/data/remix.ts`

This file's exported function and type signatures (`RemixableSceneInfo`,
`getRemixableSceneInfo`, `RemixResult`, `remixScene`, `RemixTrackingEvent`,
`trackRemixEvent`) are **locked**. Do not change them without flagging Ahsan first,
even if a different design seems cleaner.

One detail specifically worth not rediscovering the hard way: `initializeScene`'s
return shape **cannot by itself** tell you whether a scene came from the static share
path or from live collaboration — both produce the identical shape
`{ isExternalScene: true; id: string; key: string }`. That's why
`getRemixableSceneInfo` takes a second, caller-supplied `isCollabScene` argument — it
is the only thing that disambiguates the two. Whoever wires `remix.ts` into
`App.tsx` must compute that flag correctly (e.g. from `collabAPI?.isCollaborating()`)
and pass it in; getting it wrong would make the Remix button appear during a live
collaboration session, which must never happen.

`remixScene` is currently a stub that throws `"not implemented — see JSDoc"` — actual
stripping of source id/key and version-regeneration logic is planned for a future
work session, not yet written.

## Corrections

Two claims from the original brief needed adjustment after checking the code:

1. **"Opening a share link loads a read-only snapshot"** — not quite accurate. There
   is no `viewModeEnabled`/read-only flag applied to a scene loaded via
   `jsonBackendMatch`; it loads as a fully editable local scene like any other.
   `initializeScene` also clears the URL hash immediately after loading
   (`window.history.replaceState(...)`), so there's no persistent live link back to
   the source share once it's loaded — it really is a one-time, editable copy, just
   not literally "read-only." This distinction matters for Remix: the feature is
   really about making that existing "detached local copy" behavior explicit and
   giving it a clean identity (stripped id/key, fresh versions), not about unlocking
   something that was previously locked.

2. **"Firebase realtime sync internals"** — there's no realtime sync via Firebase in
   this codebase. Live collaboration's realtime transport is `socket.io`
   (`Collab.tsx` / `Portal.tsx`), not Firebase. `excalidraw-app/data/firebase.ts` is
   used only for encrypted file-blob storage (e.g. embedded images) and is shared by
   *both* the collab flow and the static-share flow (`exportToBackend` already calls
   `saveFilesToFirebase`). It's listed under "do not touch" above for a different
   reason — it's shared infrastructure, not because it's collab-exclusive or
   realtime.

Everything else in the original brief (the Collab.tsx/Portal.tsx role, the
App.tsx/data/index.ts static-share flow, the `remix.ts` interface-lock and
`isCollabScene` disambiguation detail, and the absence of any existing
duplicate/fork-scene function anywhere in the codebase) checked out as stated.
