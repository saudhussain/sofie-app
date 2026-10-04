import { LIVE_STATUS_SUBSCRIPTIONS, LIVE_STATUS_URL } from './config';
import { reconnectDelay } from './connection-state';
import { parseAdLibsMessage } from './parse-adlibs';
import { parseActivePlaylistMessage } from './parse-playlist';
import type {
  AdLibsSnapshot,
  ConnectionState,
  PlaylistPosition,
} from './types';

export type SocketLink = 'connecting' | 'gateway-down' | 'open';

/**
 * Lamp state from the socket link and the last good payloads.
 * Gateway down wins. An open socket without an adLibs message stays
 * connecting. A null playlist id means no rundown is active.
 */
export const deriveLiveStatus = (
  link: SocketLink,
  snapshot: AdLibsSnapshot | null,
  playlist: PlaylistPosition | null
): ConnectionState => {
  if (link === 'gateway-down') {
    return { kind: 'gateway-down' };
  }
  if (link !== 'open' || !snapshot) {
    return { kind: 'connecting' };
  }
  if (snapshot.rundownPlaylistId === null) {
    return { kind: 'rundown-inactive' };
  }
  return {
    adLibs: snapshot.adLibs,
    currentSegmentId: playlist?.currentSegmentId ?? null,
    globalAdLibs: snapshot.globalAdLibs,
    kind: 'connected',
    nextSegmentId: playlist?.nextSegmentId ?? null,
    rundownPlaylistId: snapshot.rundownPlaylistId,
  };
};

/**
 * Skips the listener fan-out when the lamp and the lists are unchanged.
 * Opening the socket before the first `adLibs` message stays "connecting",
 * so that open does not render twice. A newly parsed snapshot is a new
 * array, so an `adLibs` or `activePlaylist` push always reaches the board.
 */
const sameConnection = (
  left: ConnectionState,
  right: ConnectionState
): boolean => {
  if (left.kind !== right.kind) {
    return false;
  }
  if (left.kind !== 'connected' || right.kind !== 'connected') {
    return true;
  }
  return (
    left.adLibs === right.adLibs &&
    left.currentSegmentId === right.currentSegmentId &&
    left.globalAdLibs === right.globalAdLibs &&
    left.nextSegmentId === right.nextSegmentId &&
    left.rundownPlaylistId === right.rundownPlaylistId
  );
};

type LiveStatusClient = {
  getSnapshot: () => ConnectionState;
  start: () => void;
  stop: () => void;
  subscribe: (listener: () => void) => () => void;
};

/**
 * One websocket for the whole board.
 * Subscribes to `adLibs` and `activePlaylist`, keeps the last good payloads,
 * and derives the connection state the panels read. The first subscriber
 * opens the socket. The last one closes it on the next turn.
 */
export const createLiveStatusClient = (
  url: string = LIVE_STATUS_URL
): LiveStatusClient => {
  const listeners = new Set<() => void>();
  let socket: WebSocket | null = null;
  let retryTimer: number | undefined;
  let stopTimer: number | undefined;
  let reconnectAttempt = 0;
  let stopped = true;
  let link: SocketLink = 'connecting';
  let snapshot: AdLibsSnapshot | null = null;
  let playlist: PlaylistPosition | null = null;
  let derived: ConnectionState = { kind: 'connecting' };

  /** Recompute the lamp and lists, then tell React only when they differ. */
  const notify = () => {
    const next = deriveLiveStatus(link, snapshot, playlist);
    if (sameConnection(derived, next)) {
      return;
    }
    derived = next;
    for (const listener of listeners) {
      listener();
    }
  };

  const connect = () => {
    if (stopped) {
      return;
    }

    let nextSocket: WebSocket;
    // `new WebSocket` throws when the URL is invalid. Treat that like a drop:
    // clear the lists, show Gateway down, and try again. Unlike a normal
    // close, this retry calls connect() directly, so the lamp stays down for
    // the wait instead of flipping to Connecting when the timer fires.
    try {
      nextSocket = new WebSocket(url);
    } catch {
      link = 'gateway-down';
      snapshot = null;
      playlist = null;
      notify();
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
      link = 'open';
      notify();
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

      // A frame is one event. Playlist is checked first, then adlibs.
      // Anything else, including the subscribe ack, leaves both payloads.
      const nextPlaylist = parseActivePlaylistMessage(payload);
      if (nextPlaylist) {
        playlist = nextPlaylist;
        notify();
        return;
      }

      // Non-adLibs events are ignored so the previous snapshot stays.
      const nextSnapshot = parseAdLibsMessage(payload);
      if (!nextSnapshot) {
        return;
      }

      snapshot = nextSnapshot;
      notify();
    });

    nextSocket.addEventListener('close', () => {
      // A socket we already replaced, or a stop, must not start a retry.
      // Lists are cleared on purpose: the panels must not keep buttons from
      // a gateway that is no longer speaking. Connecting is shown only when
      // this retry actually starts, so the wait itself reads Gateway down.
      if (stopped || socket !== nextSocket) {
        return;
      }

      // Down while we wait. Connecting only when this retry actually starts.
      link = 'gateway-down';
      snapshot = null;
      playlist = null;
      notify();
      retryTimer = window.setTimeout(() => {
        if (stopped) {
          return;
        }
        link = 'connecting';
        notify();
        connect();
      }, reconnectDelay(reconnectAttempt));
      reconnectAttempt += 1;
    });
  };

  const start = () => {
    if (!stopped) {
      return;
    }
    stopped = false;
    reconnectAttempt = 0;
    link = 'connecting';
    snapshot = null;
    playlist = null;
    notify();
    connect();
  };

  const stop = () => {
    stopped = true;
    window.clearTimeout(retryTimer);
    window.clearTimeout(stopTimer);
    retryTimer = undefined;
    stopTimer = undefined;
    socket?.close();
    socket = null;
  };

  /**
   * The first listener opens the socket. The last one does not close it in
   * this turn: React Strict Mode unsubscribes and subscribes again before
   * the timeout, and the timeout then sees a listener and leaves the socket up.
   */
  const subscribe = (listener: () => void): (() => void) => {
    window.clearTimeout(stopTimer);
    stopTimer = undefined;
    const shouldStart = listeners.size === 0;
    listeners.add(listener);
    if (shouldStart) {
      start();
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        // Strict Mode unsubscribes and resubscribes in the same turn.
        stopTimer = window.setTimeout(() => {
          if (listeners.size === 0) {
            stop();
          }
        }, 0);
      }
    };
  };

  const getSnapshot = (): ConnectionState => derived;

  return { getSnapshot, start, stop, subscribe };
};

/** Shared by every `useLiveStatus` call so the board has one socket. */
export const liveStatusClient = createLiveStatusClient();
