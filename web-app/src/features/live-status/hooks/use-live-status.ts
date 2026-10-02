import { useEffect, useState } from 'react';
import type {
  AdLibsSnapshot,
  ConnectionState,
  PlaylistPosition,
} from '../../../types';
import { LIVE_STATUS_SUBSCRIPTIONS, LIVE_STATUS_URL } from '../config';
import {
  connectionStateFromSnapshot,
  reconnectDelay,
} from '../connection-state';
import { parseAdLibsMessage } from '../parse-adlibs';
import { parseActivePlaylistMessage } from '../parse-playlist';

type SocketLink = 'connecting' | 'gateway-down' | 'open';

const deriveConnection = (
  link: SocketLink,
  snapshot: AdLibsSnapshot | null,
  playlist: PlaylistPosition | null
): ConnectionState => {
  if (link === 'gateway-down') {
    return { kind: 'gateway-down' };
  }
  // An open socket is not enough. Wait for the first adLibs payload.
  if (link !== 'open' || !snapshot) {
    return { kind: 'connecting' };
  }
  return connectionStateFromSnapshot(snapshot, playlist);
};

/**
 * Subscribes to adLibs and activePlaylist on one socket.
 * Stays on connecting until the first adLibs message. Reconnects with
 * backoff after the socket closes. A bad URL does not throw out of the hook.
 */
export const useLiveStatus = (): ConnectionState => {
  const [link, setLink] = useState<SocketLink>('connecting');
  const [snapshot, setSnapshot] = useState<AdLibsSnapshot | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistPosition | null>(null);

  useEffect(() => {
    // Stops a reconnect after unmount. Dev Strict Mode remounts this effect.
    let effectStopped = false;
    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;
    // Failures so far. The delay uses this value, then the count goes up.
    let reconnectAttempt = 0;

    const connect = () => {
      if (effectStopped) {
        return;
      }

      let nextSocket: WebSocket;
      // The constructor throws on an invalid URL. Retry instead of crashing.
      // NOTE: unclear why this path skips the "connecting" lamp a normal close uses.
      try {
        nextSocket = new WebSocket(LIVE_STATUS_URL);
      } catch {
        setLink('gateway-down');
        setSnapshot(null);
        setPlaylist(null);
        retryTimer = window.setTimeout(() => {
          connect();
        }, reconnectDelay(reconnectAttempt));
        reconnectAttempt += 1;
        return;
      }

      socket = nextSocket;

      nextSocket.addEventListener('open', () => {
        // A good open starts the backoff over. Stay on connecting until adLibs.
        reconnectAttempt = 0;
        setLink('open');
        for (const subscription of LIVE_STATUS_SUBSCRIPTIONS) {
          nextSocket.send(JSON.stringify(subscription));
        }
      });

      nextSocket.addEventListener('message', (message) => {
        let payload: unknown;
        // One bad frame must not clear the lists or tear down the socket.
        try {
          payload = JSON.parse(String(message.data));
        } catch {
          return;
        }

        const nextPlaylist = parseActivePlaylistMessage(payload);
        if (nextPlaylist) {
          setPlaylist(nextPlaylist);
          return;
        }

        // Non-adLibs events are ignored so the previous snapshot stays.
        const nextSnapshot = parseAdLibsMessage(payload);
        if (!nextSnapshot) {
          return;
        }

        setSnapshot(nextSnapshot);
      });

      nextSocket.addEventListener('close', () => {
        // A socket we already replaced, or an unmount, must not start a retry.
        if (effectStopped || socket !== nextSocket) {
          return;
        }

        // Down while we wait. Connecting only when this retry actually starts.
        setLink('gateway-down');
        setSnapshot(null);
        setPlaylist(null);
        retryTimer = window.setTimeout(() => {
          if (effectStopped) {
            return;
          }
          setLink('connecting');
          connect();
        }, reconnectDelay(reconnectAttempt));
        reconnectAttempt += 1;
      });
    };

    connect();

    return () => {
      // Set before close. The close handler would otherwise reconnect.
      effectStopped = true;
      window.clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);

  return deriveConnection(link, snapshot, playlist);
};
