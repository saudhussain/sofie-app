# Live status

The touch app listens to Sofie's Live Status Gateway and draws the buttons it sends. It does not poll, and a tap does not call Sofie. The gateway pushes a new message whenever a subscription changes.

## Gateway

The Docker stack publishes the gateway websocket at `ws://localhost:8080`.

Override that address with `VITE_LIVE_STATUS_URL` before `npm run dev` if the gateway is not on the local default port.

## Subscriptions

When the socket opens, the app sends one subscribe message per name. `reqid` is a client integer. The names are from the gateway `subscriptionName` enum:

```json
{ "event": "subscribe", "reqid": 1, "subscription": { "name": "adLibs" } }
```

```json
{ "event": "subscribe", "reqid": 2, "subscription": { "name": "activePlaylist" } }
```

`adLibs` is the button list for the whole rundown. It has no current-segment field.

| Field | Meaning |
| --- | --- |
| `rundownPlaylistId` | Id of the active rundown, or `null` when none is active |
| `adLibs` | Part actions. Each item has `id`, `name`, `sourceLayer`, `actionType`, `tags`, `publicData`, `segmentId`, and `partId` |
| `globalAdLibs` | Rundown-wide actions. Same fields, without a segment or part |

`activePlaylist` supplies the on-air position. `currentPart.segmentId` is the current segment. When `currentPart` is null, the app uses `currentSegment.id`. `nextPart.segmentId` is the next segment. If that subscription never arrives, or both ids are missing, the segment strip is manual and the board says the current segment is unknown.

Items that are missing an id or a name are dropped. The rest of the message is still used.

## What the screen shows

The status lamp stays as before:

| Lamp | When |
| --- | --- |
| Connecting | The socket is opening, or the first `adLibs` message has not arrived |
| Gateway down | The socket closed. The app retries after 1s, then 2s, then 4s, and then every 5s |
| Rundown not active | The gateway is up and `rundownPlaylistId` is `null` |
| Connected | The gateway is up and a rundown is active |

While the gateway is down or the rundown is inactive, both panels stay empty. Buttons from the last good message are not kept on screen.

When a rundown is active, the wide panel shows one segment at a time, grouped by layer. The narrow panel shows every global adlib, independent of the selected segment. A tap does not run the adlib.

## Code

| File | Role |
| --- | --- |
| `web-app/src/features/live-status/config.ts` | Gateway URL and subscribe payloads |
| `web-app/src/features/live-status/parse-adlibs.ts` | Parses an `adLibs` message |
| `web-app/src/features/live-status/parse-playlist.ts` | Parses an `activePlaylist` message |
| `web-app/src/features/live-status/connection-state.ts` | Maps a snapshot to a connection state, blocked panel copy, and reconnect delay |
| `web-app/src/features/live-status/hooks/use-live-status.ts` | Opens the socket, subscribes, and reconnects |
| `web-app/src/shared/lib/safe-json.ts` | Narrows unknown JSON values to objects |
| `web-app/src/features/adlibs/model/adapter.ts` | Turns a raw adlib into title, group, and actions |
| `web-app/src/features/adlibs/model/segments.ts` | Groups part adlibs into the segment strip |
| `web-app/src/features/adlibs/model/global-layout.ts` | Places every global adlib into a control group |
| `web-app/src/features/live-status/components/status-bar.tsx` | Renders the lamp |
| `web-app/src/features/live-status/types.ts` | Gateway adlib, playlist, and connection types |
| `web-app/src/features/adlibs/types.ts` | Board view-model for one adapted adlib |
