import { PRESS_FRAME } from '@/shared/ui/pressable';
import {
  type FireStatus,
  fireStatusTone,
  fireToneClass,
} from '../../hooks/use-adlib-fire';

/**
 * A fire tone replaces the idle border. Danger text stays only while idle.
 * Every idle control flashes the cue frame on press, danger ones included:
 * the tap has to read as received before the request comes back.
 */
export const borderFor = (danger: boolean, status: FireStatus): string => {
  const tone = fireStatusTone(status);
  if (tone) {
    return fireToneClass[tone].border;
  }
  return `${danger ? 'border-danger' : 'border-line'} ${PRESS_FRAME}`;
};

export const zoneClass = (
  danger: boolean,
  compact: boolean,
  status: FireStatus
) =>
  [
    'relative overflow-hidden border px-3 py-2 text-left',
    compact ? 'min-h-12' : 'min-h-22',
    borderFor(danger, status),
    danger && status === 'idle' ? 'text-danger' : '',
  ].join(' ');
