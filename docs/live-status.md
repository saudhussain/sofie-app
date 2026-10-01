# Live status

The touch app listens to Sofie's Live Status Gateway for the adlibs that can be shown right now. It does not poll. The gateway pushes a new message whenever that set changes.

## Gateway

The Docker stack publishes the gateway websocket at `ws://localhost:8080`.

Override that address with `VITE_LIVE_STATUS_URL` before `npm run dev` if the gateway is not on the local default port.

## Subscription

When the socket opens, the app sends the same subscribe message as Sofie's sample client:

```json
{ "event": "subscribe", "subscription": { "name": "adLibs" }, "reqid": 1 }
```

Messages with any other `event` are ignored. An `adLibs` message has this shape:

| Field | Meaning |
| --- | --- |
| `rundownPlaylistId` | Id of the active rundown, or `null` when none is active |
| `adLibs` | Actions for the content that is playing now. Each item has `id`, `name`, `sourceLayer`, `actionType`, `segmentId`, and `partId` |
| `globalAdLibs` | Actions for the whole rundown. Same fields, without a segment or part |

Items that are missing an id or a name are dropped. The rest of the message is still used.

## Connection states

The status lamp shows one of these:

| Lamp | When |
| --- | --- |
| Connecting | The socket is opening, or the first `adLibs` message has not arrived |
| Gateway down | The socket closed. The app retries after 1s, then 2s, then 4s, and then every 5s |
| Rundown not active | The gateway is up and `rundownPlaylistId` is `null` |
| Connected | The gateway is up and a rundown is active |

While the gateway is down or the rundown is inactive, both panels stay empty. Names from the last good message are not kept on screen. After a rundown is active, each panel lists the names from the latest message. Tapping them does nothing yet.

## Code

| File | Role |
| --- | --- |
| `web-app/src/config/live-status.ts` | Gateway URL and subscribe payload |
| `web-app/src/helpers/live-status.ts` | Parses an `adLibs` message, maps it to a connection state, and computes the reconnect delay |
| `web-app/src/features/adlibs/adlib-panels.ts` | Empty-state copy and which adlibs a panel lists |
| `web-app/src/features/live-status/use-live-status.ts` | Opens the socket, subscribes, and reconnects |
| `web-app/src/types/` | Adlib and connection types |
| `web-app/src/components/status-bar.tsx` | Renders the lamp |
| `web-app/src/components/list-panel.tsx` | Renders a titled list or its empty state |
| `web-app/src/features/adlibs/adlib-panel.tsx` | Adlib list built on the list panel |
