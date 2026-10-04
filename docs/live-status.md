# Live status

The touch app listens to Sofie's Live Status Gateway and draws the buttons it sends. It does not poll. A tap posts that adlib through Sofie's OpenAPI. The gateway pushes a new message whenever a subscription changes.

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

That wait sequence restarts only once the gateway has answered with an `adLibs` message, not merely when the socket opens. A gateway that is still starting up accepts the socket and drops it again, so an open on its own proves nothing and would otherwise hold the retry at 1s forever.

While the gateway is down or the rundown is inactive, both panels stay empty. Buttons from the last good message are not kept on screen.

When a rundown is active, the wide panel shows one segment at a time, grouped by layer. The narrow panel shows every global adlib, independent of the selected segment, grouped the same way.

Both panels group by the source layer the gateway reports, so an adlib from a layer this app has never seen still gets a heading and a button. Nothing in the code is tied to one rundown's layer names.

An adlib that offers several actions is drawn as a header plus one zone per action. Above four actions the zones become small cells behind a disclosure, because Sofie's DVE routing adlibs carry 56 each. The labels on those cells are Sofie's own.

## Firing

A completed press posts to `/api/v1.0/playlists/{rundownPlaylistId}/execute-adlib`. The body is `{ "adLibId": "<id>" }`. When the tap chose one action, either the adlib's only action or one zone of several, the body also includes `actionType`. `adLibOptions` is not sent.

The request times out after 10 seconds. While it is in flight that control says **Sending** and a second tap does nothing. The other controls stay usable. A 200 shows **Sent** for a moment, then the label returns. A 412 shows **Not on air** for a moment, then the label returns. Any other failure shows **Failed** until the next tap on that control.

Segment tabs only change the local view. So does opening a disclosure.

## Code

| File | Role |
| --- | --- |
| `web-app/src/features/live-status/config.ts` | Gateway URL and subscribe payloads |
| `web-app/src/features/live-status/parse-adlibs.ts` | Parses an `adLibs` message |
| `web-app/src/features/live-status/parse-playlist.ts` | Parses an `activePlaylist` message |
| `web-app/src/features/live-status/connection-state.ts` | Maps a snapshot to a connection state, blocked panel copy, and reconnect delay |
| `web-app/src/features/live-status/live-status-client.ts` | Opens the socket, subscribes, and reconnects |
| `web-app/src/features/live-status/hooks/use-live-status.ts` | Thin React subscription to the live-status client |
| `web-app/src/shared/lib/safe-json.ts` | Narrows unknown JSON values to objects |
| `web-app/src/features/adlibs/model/adapter.ts` | Turns a raw adlib into title, group, and actions |
| `web-app/src/features/adlibs/model/segments.ts` | Groups part adlibs into the segment strip |
| `web-app/src/features/adlibs/model/group-globals.ts` | Groups global adlibs by source layer |
| `web-app/src/features/live-status/components/status-bar/index.tsx` | Renders the lamp |
| `web-app/src/features/live-status/types.ts` | Gateway adlib, playlist, and connection types |
| `web-app/src/features/adlibs/types.ts` | Board view-model for one adapted adlib |
| `web-app/src/features/adlibs/api/execute-adlib.ts` | Posts one adlib and turns the response into a result |
| `web-app/src/features/adlibs/hooks/use-adlib-fire.ts` | Per-control sending, sent, and failed state |
