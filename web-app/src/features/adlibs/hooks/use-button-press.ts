import { useRef, useState } from 'react';
import { executeAdLib } from '../api/execute-adlib';

export type ButtonPressStatus = 'idle' | 'busy' | 'success' | 'error';

const statusMessage = (kind: 'not-on-air' | 'error'): string =>
  kind === 'not-on-air' ? 'Not on air' : 'Failed';

/**
 * Per-button fire state. Ignores taps while a request is in flight.
 * The board still does not call this from the controls; the request
 * lives in execute-adlib.ts so it has one owner.
 */
export const useButtonPress = (playlistId: string | null) => {
  const [status, setStatus] = useState<ButtonPressStatus>('idle');
  const [message, setMessage] = useState<string | undefined>(undefined);
  const statusRef = useRef(status);
  statusRef.current = status;

  const fire = async (adLibId: string, actionType?: string) => {
    if (statusRef.current === 'busy') {
      return;
    }
    if (playlistId === null) {
      setStatus('error');
      setMessage('Not on air');
      return;
    }

    setStatus('busy');
    setMessage(undefined);
    const result = await executeAdLib({
      adLibId,
      playlistId,
      ...(actionType === undefined ? {} : { actionType }),
    });
    if (result.kind === 'ok') {
      setStatus('success');
      setMessage(undefined);
      return;
    }
    setStatus('error');
    setMessage(
      statusMessage(result.kind === 'not-on-air' ? 'not-on-air' : 'error')
    );
  };

  return { fire, message, status };
};
