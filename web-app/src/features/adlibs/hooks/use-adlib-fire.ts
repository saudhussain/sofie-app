import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlaylistId } from '@/features/live-status/playlist-id';
import { logger } from '@/shared/lib/logger';
import { executeAdLib } from '../api/execute-adlib';

const log = logger.child({ module: 'adlib-fire' });

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export type FireStatus = 'idle' | 'busy' | 'success' | 'error';

export type FireTone = 'danger' | 'ready' | 'standby';

/** How long "Sent" and "Not on air" stay before the control's own text returns. */
const STATUS_VISIBLE_MS = 1200;

/**
 * Label that replaces the button text while a tap is in flight or just finished.
 * Idle has no label, so the control shows its own name again.
 */
export const fireStatusText = (
  status: FireStatus,
  message?: string
): string | undefined => {
  if (status === 'busy') {
    return 'Sending';
  }
  if (status === 'success' || status === 'error') {
    return message;
  }
  return undefined;
};

/** Border and text color for a control that is sending, sent, or failed. */
export const fireStatusTone = (status: FireStatus): FireTone | undefined => {
  if (status === 'busy') {
    return 'standby';
  }
  if (status === 'success') {
    return 'ready';
  }
  if (status === 'error') {
    return 'danger';
  }
  return undefined;
};

/** The one place a fire tone becomes classes. */
export const fireToneClass: Record<FireTone, { border: string; text: string }> =
  {
    danger: { border: 'border-danger', text: 'text-danger' },
    ready: { border: 'border-ready', text: 'text-ready' },
    standby: { border: 'border-standby', text: 'text-standby' },
  };

/**
 * One control's execute-adlib state. A second tap while the request is in
 * flight does nothing. Sent and Not on air clear themselves. A failure stays
 * until the next tap. The playlist id comes from the provider in `App`.
 * With no active rundown the tap is not sent.
 */
export const useAdLibFire = (): {
  fire: (adLibId: string, actionType?: string) => void;
  message: string | undefined;
  status: FireStatus;
} => {
  const playlistId = usePlaylistId();
  const [status, setStatus] = useState<FireStatus>('idle');
  const [message, setMessage] = useState<string | undefined>(undefined);
  // Written in apply, so a second tap before the next paint still sees busy.
  const statusRef = useRef<FireStatus>('idle');
  // Identifies this press. Unmount and a newer tap move it on, and a late
  // response that no longer matches is ignored.
  const generation = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const clearTimer = useRef<number | undefined>(undefined);

  // Drop the in-flight request when this control leaves the tree.
  useEffect(
    () => () => {
      generation.current += 1;
      window.clearTimeout(clearTimer.current);
      abortRef.current?.abort();
    },
    []
  );

  const fire = useCallback(
    (adLibId: string, actionType?: string) => {
      const apply = (next: FireStatus, nextMessage?: string) => {
        statusRef.current = next;
        setStatus(next);
        setMessage(nextMessage);
      };

      const showThenRestore = (
        press: number,
        next: FireStatus,
        nextMessage: string
      ) => {
        apply(next, nextMessage);
        clearTimer.current = window.setTimeout(() => {
          if (press !== generation.current) {
            return;
          }
          apply('idle');
        }, STATUS_VISIBLE_MS);
      };

      if (statusRef.current === 'busy') {
        log.debug(
          { adLibId },
          'ignored a tap while execute-adlib is in flight'
        );
        return;
      }
      window.clearTimeout(clearTimer.current);
      clearTimer.current = undefined;

      const request = generation.current + 1;
      generation.current = request;

      // The connection can drop between render and the tap. Do not post.
      if (playlistId === null) {
        log.warn({ adLibId }, 'tap was not sent; no rundown is active');
        showThenRestore(request, 'error', 'Not on air');
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      apply('busy');

      const send = async () => {
        try {
          const result = await executeAdLib({
            // A blank action is no choice, so the body stays the id alone.
            actionType: actionType || undefined,
            adLibId,
            playlistId,
            signal: controller.signal,
          });
          // This press was replaced or the control unmounted.
          if (request !== generation.current) {
            log.debug({ adLibId }, 'ignored a late execute-adlib response');
            return;
          }
          if (result.kind === 'ok') {
            showThenRestore(request, 'success', 'Sent');
            return;
          }
          // 412 is "Not on air", and the label returns. Every other result,
          // including a timeout, stays "Failed" until the next tap.
          if (result.kind === 'not-on-air') {
            showThenRestore(request, 'error', 'Not on air');
            return;
          }
          apply('error', 'Failed');
        } catch (error) {
          if (request !== generation.current) {
            log.debug({ adLibId }, 'ignored a late execute-adlib response');
            return;
          }
          log.error(
            { adLibId, error: errorMessage(error) },
            'execute-adlib rejected'
          );
          apply('error', 'Failed');
        }
      };

      // executeAdLib returns a result. This covers a rejection that escaped it.
      send().catch((error: unknown) => {
        log.error({ adLibId, error: errorMessage(error) }, 'adlib fire failed');
      });
    },
    [playlistId]
  );

  return { fire, message, status };
};
