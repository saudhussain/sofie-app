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
const deriveLiveStatus = (
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
  subscribe: (listener: () => void) => () => void;
};

/**
 * One websocket for the whole board.
 * Subscribes to `adLibs` and `activePlaylist`, keeps the last good payloads,
 * and derives the connection state the panels read. The first subscriber
 * opens the socket and it stays open for the life of the page; the browser
 * closes it on unload. A Strict Mode remount drops and re-adds its listener
 * in the same turn, and the socket that is already open is reused.
 */
export const createLiveStatusClient = (
  url: string = LIVE_STATUS_URL
): LiveStatusClient => {
  const listeners = new Set<() => void>();
  let socket: WebSocket | null = null;
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
      window.setTimeout(() => {
        connect();
      }, reconnectDelay(reconnectAttempt));
      reconnectAttempt += 1;
      return;
    }

    socket = nextSocket;

    nextSocket.addEventListener('open', () => {
      // The backoff is not reset here. A gateway that is still starting up
      // accepts the socket and drops it again, so an open on its own proves
      // nothing. Stay on connecting until adLibs arrives.
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

      // A gateway that answered the subscription is healthy, so the next drop
      // starts the wait sequence over. Resetting on open instead would hold
      // the delay at 1s forever while the gateway restart-loops.
      reconnectAttempt = 0;
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
      window.setTimeout(() => {
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

  /**
   * The first listener opens the socket. Later listeners share it, and
   * unsubscribing never closes it: the board is one page, and the browser
   * closes the socket when that page goes away.
   */
  const subscribe = (listener: () => void): (() => void) => {
    const shouldStart = listeners.size === 0;
    listeners.add(listener);
    if (shouldStart) {
      start();
    }
    return () => {
      listeners.delete(listener);
    };
  };

  const getSnapshot = (): ConnectionState => derived;

  return { getSnapshot, subscribe };
};

/** Shared by every `useLiveStatus` call so the board has one socket. */
export const liveStatusClient = createLiveStatusClient();
