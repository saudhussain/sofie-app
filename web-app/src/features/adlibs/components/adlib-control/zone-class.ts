import { PRESS_FRAME } from '@/shared/ui/pressable';
import {
  type FireStatus,
  fireStatusTone,
  fireToneClass,
} from '../../hooks/use-adlib-fire';

/**
 * Press flash for an idle control. It matches the cue: blue, or danger when
 * the cue is danger. The tap has to read as received before the request comes back.
 */
const pressFrame = (danger: boolean): string =>
  danger
    ? 'active:border-danger active:shadow-[0_0_8px_var(--color-danger)]'
    : PRESS_FRAME;

/**
 * A fire tone replaces the idle border. Danger text stays only while idle.
 * The idle frame stays the line; a danger adlib colours its cue instead.
 */
export const borderFor = (danger: boolean, status: FireStatus): string => {
  const tone = fireStatusTone(status);
  if (tone) {
    return fireToneClass[tone].border;
  }
  return `border-line ${pressFrame(danger)}`;
};

/** Left mark on a control. Danger adlibs use the danger colour in place of cue. */
export const cueClass = (danger: boolean): string =>
  danger ? 'bg-danger' : 'bg-cue';

export const zoneClass = (
  danger: boolean,
  compact: boolean,
  status: FireStatus
): string =>
  [
    'relative overflow-hidden border px-3 py-2 text-left',
    compact ? 'min-h-12' : 'min-h-22',
    borderFor(danger, status),
    danger && status === 'idle' ? 'text-danger' : '',
  ].join(' ');
