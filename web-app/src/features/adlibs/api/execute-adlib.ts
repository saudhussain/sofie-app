export type ExecuteAdLibResult =
  | { kind: 'ok' }
  | { kind: 'not-on-air' }
  | { kind: 'error'; status?: number };

export type ExecuteAdLibInput = {
  actionType?: string;
  adLibId: string;
  playlistId: string;
  signal?: AbortSignal;
};

const EXECUTE_ADLIB_TIMEOUT_MS = 10_000;

/**
 * POST /api/v1.0/playlists/{playlistId}/execute-adlib
 * Body is `adLibId` and, when a zone or DVE cell chose one, `actionType`.
 * `adLibOptions` is not sent. Network errors, timeouts, and non-2xx
 * responses become a result. This function does not throw to the caller.
 */
export const executeAdLib = async ({
  actionType,
  adLibId,
  playlistId,
  signal,
}: ExecuteAdLibInput): Promise<ExecuteAdLibResult> => {
  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
  };
  if (signal) {
    if (signal.aborted) {
      return { kind: 'error' };
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = window.setTimeout(onAbort, EXECUTE_ADLIB_TIMEOUT_MS);

  try {
    const response = await fetch(
      `/api/v1.0/playlists/${encodeURIComponent(playlistId)}/execute-adlib`,
      {
        body: JSON.stringify(
          actionType === undefined ? { adLibId } : { actionType, adLibId }
        ),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        signal: controller.signal,
      }
    );
    if (response.status === 412) {
      return { kind: 'not-on-air' };
    }
    if (!response.ok) {
      return { kind: 'error', status: response.status };
    }
    return { kind: 'ok' };
  } catch {
    return { kind: 'error' };
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
};
