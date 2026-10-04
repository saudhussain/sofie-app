import { useSyncExternalStore } from 'react';
import { liveStatusClient } from '../live-status-client';
import type { ConnectionState } from '../types';

/**
 * React view of the live-status client.
 * `useSyncExternalStore` re-renders when the client tells its listeners the
 * derived state changed. The third argument is the server snapshot. This app
 * does not render on a server, so it is the same function.
 * The client is a module singleton. The first subscriber opens the socket
 * and it stays open, so a Strict Mode remount keeps the connection.
 */
export const useLiveStatus = (): ConnectionState =>
  useSyncExternalStore(
    liveStatusClient.subscribe,
    liveStatusClient.getSnapshot,
    // No server render. The client snapshot is the only snapshot.
    liveStatusClient.getSnapshot
  );
