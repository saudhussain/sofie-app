import type { ConnectionState } from './types';

// First retry waits 1s, then 2s, then 4s. Later retries stay at 5s.
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 5000;

/**
 * How long to wait before opening the socket again.
 * `attempt` is how many failures already happened: 0 waits 1s, 1 waits 2s,
 * 2 waits 4s, and every later attempt waits 5s. A successful open resets
 * the attempt, so the next drop starts the sequence over.
 */
export const reconnectDelay = (attempt: number): number =>
  Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt);

/**
 * Shared copy for both panels while they must not show buttons.
 * A string hides the lists. `null` means the panel may draw, including its
 * own "nothing here" line when the connected lists are empty.
 * Gateway down and an inactive rundown use this so the last good buttons
 * are not left on screen.
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
