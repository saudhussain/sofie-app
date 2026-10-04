import type { AdaptedAdLib } from '../../types';

export type ControlItem = AdaptedAdLib & { duplicateIndex?: number };

export type AdlibControlProps = {
  compact?: boolean;
  danger?: boolean;
  hint?: string;
  item: ControlItem;
};
