import { logger } from '@/shared/lib/logger';

const log = logger.child({ module: 'execute-adlib' });

export type ExecuteAdLibResult =
  | { kind: 'ok' }
  | { kind: 'not-on-air' }
  | { kind: 'error' };

export type ExecuteAdLibInput = {
  actionType?: string;
  adLibId: string;
  playlistId: string;
  signal?: AbortSignal;
};

const EXECUTE_ADLIB_TIMEOUT_MS = 10_000;

/**
 * POST /api/v1.0/playlists/{playlistId}/execute-adlib
 * Body is `adLibId` and, when the tap chose one action, `actionType`.
 * `adLibOptions` is not sent.
 * 412 is the precondition Sofie returns when the rundown is not on air.
 * The caller abort and the 10s timer share one controller, so either one
 * ends the request. Network errors, timeouts, and other non-2xx responses
 * become `{ kind: 'error' }`. This function does not throw to the caller.
 */
export const executeAdLib = async ({
  actionType,
  adLibId,
  playlistId,
  signal,
}: ExecuteAdLibInput): Promise<ExecuteAdLibResult> => {
  // One controller for the caller's abort and for the timeout below.
  const controller = new AbortController();
  const onAbort = () => {
    controller.abort();
  };
  if (signal) {
    // The control unmounted before this call. Do not open the request.
    if (signal.aborted) {
      log.info(
        { adLibId, playlistId },
        'execute-adlib aborted before the request opened'
      );
      return { kind: 'error' };
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = window.setTimeout(onAbort, EXECUTE_ADLIB_TIMEOUT_MS);

  log.info(
    actionType === undefined
      ? { adLibId, playlistId }
      : { actionType, adLibId, playlistId },
    'posting execute-adlib'
  );

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
      log.warn(
        { adLibId, playlistId, status: response.status },
        'rundown is not on air'
      );
      return { kind: 'not-on-air' };
    }
    if (!response.ok) {
      log.error(
        { adLibId, playlistId, status: response.status },
        'execute-adlib rejected'
      );
      return { kind: 'error' };
    }
    log.info({ adLibId, playlistId }, 'execute-adlib accepted');
    return { kind: 'ok' };
  } catch (error) {
    if (signal?.aborted) {
      log.info({ adLibId, playlistId }, 'execute-adlib aborted');
    } else if (controller.signal.aborted) {
      log.error(
        { adLibId, playlistId, timeoutMs: EXECUTE_ADLIB_TIMEOUT_MS },
        'execute-adlib timed out'
      );
    } else {
      log.error(
        {
          adLibId,
          error: error instanceof Error ? error.message : String(error),
          playlistId,
        },
        'execute-adlib request failed'
      );
    }
    return { kind: 'error' };
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
};
