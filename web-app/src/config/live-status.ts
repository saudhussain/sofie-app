/** Gateway websocket. Unset env uses the local Docker port. */
export const LIVE_STATUS_URL =
  import.meta.env.VITE_LIVE_STATUS_URL ?? 'ws://localhost:8080';

/**
 * Sent once on open. Same body as Sofie's sample client.
 * reqid stays 1 because this app only subscribes once. No adlibs arrive before this.
 */
export const ADLIBS_SUBSCRIPTION = {
  event: 'subscribe',
  reqid: 1,
  subscription: { name: 'adLibs' },
} as const;
