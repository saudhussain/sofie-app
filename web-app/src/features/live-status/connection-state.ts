import type { ConnectionState } from './types';

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
 * Copy for a panel that cannot show buttons yet.
 * A connected board uses its own empty sentence instead.
 */
export const blockedPanelMessage = (
  connection: ConnectionState
): string | null => {
  if (connection.kind === 'connecting' || connection.kind === 'gateway-down') {
    return 'Waiting for the live status gateway.';
  }
  if (connection.kind === 'rundown-inactive') {
    return 'Activate a rundown in Sofie.';
  }
  return null;
};
