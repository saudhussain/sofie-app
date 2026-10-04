type ExecuteAdLibResult =
  | { kind: 'ok' }
  | { kind: 'not-on-air' }
  | { kind: 'error' };

type ExecuteAdLibInput = {
  actionType?: string;
  adLibId: string;
  playlistId: string;
  signal?: AbortSignal;
};

/** Long enough that Sending is visible before Sent replaces it. */
const SEND_DELAY_MS = 600;

/**
 * Stands in for the Sofie POST while a story is open.
 * A catalog tap must not fire a live rundown. The delay still walks the
 * control through Sending and Sent, which is the state the operator sees.
 */
export const executeAdLib = async (
  input: ExecuteAdLibInput
): Promise<ExecuteAdLibResult> => {
  const { signal } = input;
  if (signal?.aborted) {
    return { kind: 'error' };
  }

  await new Promise<void>((resolve) => {
    const finish = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', finish);
      resolve();
    };
    const timer = window.setTimeout(finish, SEND_DELAY_MS);
    signal?.addEventListener('abort', finish, { once: true });
  });

  if (signal?.aborted) {
    return { kind: 'error' };
  }
  return { kind: 'ok' };
};
