# CLAUDE.md

## Project Structure

Excalidraw is a **monorepo** with a clear separation between the core library and the application:

- **`packages/excalidraw/`** - Main React component library published to npm as `@excalidraw/excalidraw`
- **`excalidraw-app/`** - Full-featured web application (excalidraw.com) that uses the library
- **`packages/`** - Core packages: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`
- **`examples/`** - Integration examples (NextJS, browser script)

## Development Workflow

1. **Package Development**: Work in `packages/*` for editor features
2. **App Development**: Work in `excalidraw-app/` for app-specific features
3. **Testing**: Always run `yarn test:update` before committing
4. **Type Safety**: Use `yarn test:typecheck` to verify TypeScript

## Development Commands

```bash
yarn test:typecheck  # TypeScript type checking
yarn test:update     # Run all tests (with snapshot updates)
yarn fix             # Auto-fix formatting and linting issues
```

## Architecture Notes

### Package System

- Uses Yarn workspaces for monorepo management
- Internal packages use path aliases (see `vitest.config.mts`)
- Build system uses esbuild for packages, Vite for the app
- TypeScript throughout with strict configuration

## Team Feature: Remix + Attribution Footer

The authoritative feature spec is team-docs/PRD-remix-attribution-v2.md. P0 items there are binding.

When someone opens a shared Excalidraw link, they see a footer outside the drawing canvas with a "Remix" button. Clicking Remix creates a free, local, editable copy of the drawing for that viewer, without modifying or affecting the original shared drawing in any way.

See `team-docs/remix-codebase-map.md` for the full architecture context on how this feature is wired into the app.

`excalidraw-app/data/remix.ts` is the locked interface for this feature. Its exported function and type signatures must not change without explicit sign-off from Ahsan, even if a different design seems cleaner.

### Definition of Done for this sprint

- **Required**: the core loop works in local dev — view a shared link, see the footer, click Remix, end up with your own editable local copy.
- **Valuable but not blocking**: edge-case handling and event tracking.
- **Out of scope**: nothing in this feature needs to be merged upstream to Excalidraw's real repo.

### Local dev environment notes

- The dev-only Vite proxy in `excalidraw-app/vite.config.mts` (`/api/v2` → `https://json.excalidraw.com`) only works alongside a gitignored `.env.development.local` that sets `VITE_APP_BACKEND_V2_GET_URL=/api/v2/` and `VITE_APP_BACKEND_V2_POST_URL=/api/v2/post/`. Without that file, sharing still hits the dead `json-dev.excalidraw.com` backend and will 500.
- `trackEvent` (`packages/excalidraw/analytics.ts`) is a no-op in local dev by existing design (`isDevEnv()` early-return) — this is not a Remix bug and shouldn't be "fixed" as part of this feature.
- Approved client copy, locked: the footer reads exactly **"Made with Excalidraw"**, and its button reads exactly **"Remix"**. Do not change this wording.
