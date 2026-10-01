import { useEffect, useState } from "react";
import { ADLIBS_SUBSCRIPTION, LIVE_STATUS_URL } from "../config/live-status";
import { parseAdLibsMessage } from "../helpers/common";
import {
	connectionStateFromSnapshot,
	reconnectDelay,
} from "../helpers/live-status";
import type { ConnectionState } from "../types";

/**
 * Subscribes to the live status gateway and returns the lamp state.
 * Stays on connecting until the first `adLibs` message. Reconnects with
 * backoff after the socket closes. A bad URL does not throw out of the hook.
 */
export const useLiveStatus = (
	url: string = LIVE_STATUS_URL,
): ConnectionState => {
	// An open socket is not enough. Wait for the first adLibs payload.
	const [connection, setConnection] = useState<ConnectionState>({
		kind: "connecting",
	});

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
				nextSocket = new WebSocket(url);
			} catch {
				setConnection({ kind: "gateway-down" });
				retryTimer = window.setTimeout(() => {
					connect();
				}, reconnectDelay(reconnectAttempt));
				reconnectAttempt += 1;
				return;
			}

			socket = nextSocket;

			nextSocket.addEventListener("open", () => {
				// A good open starts the backoff over. Stay on connecting until adLibs.
				reconnectAttempt = 0;
				nextSocket.send(JSON.stringify(ADLIBS_SUBSCRIPTION));
			});

			nextSocket.addEventListener("message", (message) => {
				let payload: unknown;
				// One bad frame must not clear the lists or tear down the socket.
				try {
					payload = JSON.parse(String(message.data));
				} catch {
					return;
				}

				// Non-adLibs events are ignored so the previous snapshot stays.
				const snapshot = parseAdLibsMessage(payload);
				if (!snapshot) {
					return;
				}

				setConnection(connectionStateFromSnapshot(snapshot));
			});

			nextSocket.addEventListener("close", () => {
				// A socket we already replaced, or an unmount, must not start a retry.
				if (effectStopped || socket !== nextSocket) {
					return;
				}

				// Down while we wait. Connecting only when this retry actually starts.
				setConnection({ kind: "gateway-down" });
				retryTimer = window.setTimeout(() => {
					if (effectStopped) {
						return;
					}
					setConnection({ kind: "connecting" });
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
	}, [url]);

	return connection;
};
