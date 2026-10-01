import type { AdLibsSnapshot, ConnectionState } from "../types";

// First retry waits 1s, then 2s, then 4s. Later retries stay at 5s.
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 5000;

/**
 * How long to wait before opening the socket again.
 * `attempt` is how many failures already happened. The cap avoids a long wait
 * once the gateway is back.
 */
export const reconnectDelay = (attempt: number): number =>
	Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt);

/**
 * Lamp state for a snapshot. A null playlist id means no rundown is active.
 * Pass null for no snapshot. A down gateway is decided by the socket hook.
 */
export const connectionStateFromSnapshot = (
	snapshot: AdLibsSnapshot | null,
): ConnectionState => {
	if (!snapshot || snapshot.rundownPlaylistId === null) {
		return { kind: "rundown-inactive" };
	}

	return {
		adLibs: snapshot.adLibs,
		globalAdLibs: snapshot.globalAdLibs,
		kind: "connected",
		rundownPlaylistId: snapshot.rundownPlaylistId,
	};
};
