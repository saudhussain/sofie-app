import type { AdaptedAdLib } from '../../types';

export type ControlItem = AdaptedAdLib & { duplicateIndex?: number };

export type AdLibControlProps = {
  compact?: boolean;
  danger?: boolean;
  hint?: string;
  item: ControlItem;
};
