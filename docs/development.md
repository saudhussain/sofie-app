# Development

Commands run from the repository root. `npm i` installs both workspaces.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite for the touch app |
| `npm test` | Vitest, once, in `web-app` |
| `npm run typecheck` | TypeScript for both workspaces |
| `npm run lint` | Biome in CI mode, from the repository root |
| `npm run format` | Biome write, in `web-app` |
| `npm run storybook` | The catalog at http://localhost:6006 |
| `npm run build` | Typecheck and production build of the touch app |
| `npm run preview` | Serves that build |

Starting Sofie is in the repository [README](../README.md). The dev server proxies `/api` to Sofie on port 3000, so the browser posts to the app's own origin.

## Gateway address

Unset, the socket is `ws://localhost:8080`. Set `VITE_LIVE_STATUS_URL` before `npm run dev` when the gateway is elsewhere. The variable is read in `web-app/src/features/live-status/config.ts`.

## Tests

Tests sit next to the module they cover, under `__tests__`. Vitest picks up `src/**/__tests__/**/*.test.ts`. They call the functions under test directly. `executeAdLib` is exercised with `fetch` stubbed. There is no browser runner.

## Catalog

`storybook-app` resolves `@/` to `web-app/src`. A story that imports `execute-adlib` by a relative path would miss an alias on `@/`, so a Vite plugin swaps that module for `storybook-app/src/mocks/execute-adlib.ts`. The stand-in waits briefly and returns success.

**Board / Touch screen / Live** is the real page and opens the gateway. A tap there still uses the stand-in. **Board / Touch screen / Fixture** draws the same layout from a sample rundown and does not open a socket.

## Where to change something

| Change | Start here |
| --- | --- |
| A gateway field the screen should trust | `parse-adlibs.ts` or `parse-playlist.ts` |
| A title, a layer name, or a duration | `adapter.ts` |
| Tab order, or which segment opens | `segments.ts` and `local-panel/index.tsx` |
| What a tap posts, or how long a status stays | `execute-adlib.ts` and `use-adlib-fire.ts` |
| The lamp | `status-bar/index.tsx` and `connection-state.ts` |
