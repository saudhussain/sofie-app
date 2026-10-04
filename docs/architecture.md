# Architecture

The touch app is one page. A single websocket receives the rundown. The page turns that into buttons. A tap posts one adlib to Sofie. The gateway protocol and the POST are in [live-status.md](live-status.md).

## From a frame to a button

```
gateway  →  client  →  connection  →  panels  →  control  →  POST
```

1. `liveStatusClient` opens one socket for the page and subscribes to `adLibs` and `activePlaylist`.
2. Each frame is parsed on its own. A frame that is not JSON, or not one of those two events, leaves the last good payloads in place.
3. Those two payloads become one `ConnectionState`. Gateway down and an inactive rundown carry no lists, so the panels cannot keep the previous buttons.
4. `App` is the only reader of that state. It passes the same snapshot to both panels and publishes the rundown id for the fire hook.
5. Each panel adapts the raw adlibs and groups them. The wide column renders only the selected segment.
6. A control posts through `executeAdLib`. The playlist id comes from context, so the button does not subscribe to the gateway.

The rundown id on that context is a string. A push that keeps the same rundown leaves the value equal, so the fire hook keeps its callback.

## Workspaces

The repository is an npm workspace.

| Package | Role |
| --- | --- |
| `web-app` | The touch screen. Vite, React, and the proxy to Sofie. |
| `storybook-app` | The component catalog. It imports `web-app/src`. |

## Where code lives

`web-app/src` is split by what it is allowed to know.

| Path | Owns |
| --- | --- |
| `app/` | The page. The only `useLiveStatus` call. |
| `features/live-status/` | The socket, the parsers, the connection state, the lamp, and the playlist id. |
| `features/adlibs/` | Titles, grouping, the two panels, and firing. |
| `shared/` | `Pressable`, the panel chrome, and JSON narrowing. |

A panel may group and draw, and it may pin a segment tab. It does not open a socket. Buttons exist only while the connection is `connected`.

## One socket

The client is a module. React subscribes with `useSyncExternalStore`. The first subscriber opens the socket. Later subscribers share it, including a Strict Mode remount in the same turn. Unsubscribing leaves the socket open. The browser closes it when the page goes away.

Listeners run only when the derived state changes. A playlist frame that keeps the same segment ids does not rebuild the board. A newly parsed adlib list always does, because the parser returns a new array.
