/** Gateway websocket. Unset env uses the local Docker port. */
export const LIVE_STATUS_URL =
  import.meta.env.VITE_LIVE_STATUS_URL ?? 'ws://localhost:8080';

/**
 * Sent once on open. Names come from the gateway `subscriptionName` enum.
 * `adLibs` is the button list. `activePlaylist` carries the current and next
 * part, including each part's segment id. reqid is a client integer echoed back.
 */
export const LIVE_STATUS_SUBSCRIPTIONS = [
  { event: 'subscribe', reqid: 1, subscription: { name: 'adLibs' } },
  { event: 'subscribe', reqid: 2, subscription: { name: 'activePlaylist' } },
] as const;
