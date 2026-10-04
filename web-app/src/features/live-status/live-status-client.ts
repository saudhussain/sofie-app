import { LIVE_STATUS_SUBSCRIPTIONS, LIVE_STATUS_URL } from './config';
import { reconnectDelay } from './connection-state';
import { parseAdLibsMessage } from './parse-adlibs';
import { parseActivePlaylistMessage } from './parse-playlist';
import type {
  AdLibsSnapshot,
  ConnectionState,
  PlaylistPosition,
} from './types';

/**
 * Lamp state from whether the gateway is down and the last good payloads.
 * Gateway down wins. No adLibs message yet stays connecting.
 * A null playlist id means no rundown is active.
 */
const deriveLiveStatus = (
  gatewayDown: boolean,
  snapshot: AdLibsSnapshot | null,
  playlist: PlaylistPosition | null
): ConnectionState => {
  if (gatewayDown) {
    return { kind: 'gateway-down' };
  }
  if (!snapshot) {
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
 * A playlist push before the first `adLibs` message stays "connecting".
 * A newly parsed adlib list is a new array, so that push always reaches
 * the board. Segment ids are compared by value, so a playlist push that
 * keeps the same segments does not.
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
  let reconnectAttempt = 0;
  let started = false;
  let gatewayDown = false;
  let snapshot: AdLibsSnapshot | null = null;
  let playlist: PlaylistPosition | null = null;
  let derived: ConnectionState = { kind: 'connecting' };

  /** Recompute the lamp and lists, then tell React only when they differ. */
  const notify = () => {
    const next = deriveLiveStatus(gatewayDown, snapshot, playlist);
    if (sameConnection(derived, next)) {
      return;
    }
    derived = next;
    for (const listener of listeners) {
      listener();
    }
  };

  /**
   * The gateway stopped speaking. Clear the lists so the panels do not keep
   * buttons from it, and show Gateway down for the wait. Connecting is shown
   * only when the retry starts.
   * An invalid URL throws before a socket exists and lands here too. The
   * retry then sets Connecting and throws again in the same turn, so React
   * paints Gateway down.
   */
  const dropAndRetry = () => {
    gatewayDown = true;
    snapshot = null;
    playlist = null;
    notify();
    window.setTimeout(() => {
      gatewayDown = false;
      notify();
      connect();
    }, reconnectDelay(reconnectAttempt));
    reconnectAttempt += 1;
  };

  const connect = () => {
    let socket: WebSocket;
    // `new WebSocket` throws when the URL is invalid.
    try {
      socket = new WebSocket(url);
    } catch {
      dropAndRetry();
      return;
    }

    socket.addEventListener('open', () => {
      // The backoff is not reset here. A gateway that is still starting up
      // accepts the socket and drops it again, so an open on its own proves
      // nothing. Stay on connecting until adLibs arrives.
      for (const subscription of LIVE_STATUS_SUBSCRIPTIONS) {
        socket.send(JSON.stringify(subscription));
      }
    });

    socket.addEventListener('message', (message) => {
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

    socket.addEventListener('close', () => {
      dropAndRetry();
    });
  };

  /**
   * The first listener opens the socket. Later listeners share it, and
   * unsubscribing never closes it: the board is one page, and the browser
   * closes the socket when that page goes away.
   */
  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    if (!started) {
      started = true;
      connect();
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
