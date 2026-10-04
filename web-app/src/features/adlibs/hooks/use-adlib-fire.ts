import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveStatus } from '@/features/live-status/hooks/use-live-status';
import { executeAdLib } from '../api/execute-adlib';

export type FireStatus = 'idle' | 'busy' | 'success' | 'error';

export type FireTone = 'danger' | 'ready' | 'standby';

/** How long "Sent" stays on the control before its own label returns. */
const SUCCESS_VISIBLE_MS = 1200;

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
 * flight does nothing. Success clears itself. An error stays until the next tap.
 * The playlist id comes from the live connection. With no active rundown the
 * tap is not sent.
 */
export const useAdLibFire = () => {
  const connection = useLiveStatus();
  const playlistId =
    connection.kind === 'connected' ? connection.rundownPlaylistId : null;
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

      if (statusRef.current === 'busy') {
        return;
      }
      window.clearTimeout(clearTimer.current);
      clearTimer.current = undefined;

      // The connection can drop between render and the tap. Do not post.
      if (playlistId === null) {
        apply('error', 'Not on air');
        return;
      }

      const request = generation.current + 1;
      generation.current = request;
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
            return;
          }
          if (result.kind === 'ok') {
            apply('success', 'Sent');
            clearTimer.current = window.setTimeout(() => {
              if (request !== generation.current) {
                return;
              }
              apply('idle');
            }, SUCCESS_VISIBLE_MS);
            return;
          }
          // 412 is "Not on air". Every other result, including a timeout, is "Failed".
          apply(
            'error',
            result.kind === 'not-on-air' ? 'Not on air' : 'Failed'
          );
        } catch {
          if (request !== generation.current) {
            return;
          }
          apply('error', 'Failed');
        }
      };

      // executeAdLib returns a result. This covers a rejection that escaped it.
      send().catch(() => undefined);
    },
    [playlistId]
  );

  return { fire, message, status };
};
