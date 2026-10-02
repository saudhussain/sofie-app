import { useSyncExternalStore } from 'react';
import { liveStatusClient } from '../live-status-client';
import type { ConnectionState } from '../types';

/**
 * Subscribes to adLibs and activePlaylist on one socket.
 * The client is a module singleton, so Strict Mode remounts reuse it.
 */
export const useLiveStatus = (): ConnectionState =>
  useSyncExternalStore(
    liveStatusClient.subscribe,
    liveStatusClient.getSnapshot,
    liveStatusClient.getSnapshot
  );
