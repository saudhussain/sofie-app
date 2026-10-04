/** Gateway websocket. Unset env uses the local Docker port. */
export const LIVE_STATUS_URL =
  import.meta.env.VITE_LIVE_STATUS_URL ?? 'ws://localhost:8080';

/**
 * Sent once each time the socket opens. Names come from the gateway
 * `subscriptionName` enum. `adLibs` is the button list for the rundown.
 * `activePlaylist` carries the on-air and next part, including each part's
 * segment id. `reqid` is a client integer the gateway echoes on the ack.
 * The ack is not a snapshot, so the parsers ignore it.
 */
export const LIVE_STATUS_SUBSCRIPTIONS = [
  { event: 'subscribe', reqid: 1, subscription: { name: 'adLibs' } },
  { event: 'subscribe', reqid: 2, subscription: { name: 'activePlaylist' } },
] as const;
