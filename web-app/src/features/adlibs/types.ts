import type { AdLibBase } from '@/features/live-status/types';

/**
 * One way to fire this adlib.
 * `label` is what the operator reads. `name` is sent as `actionType` when
 * the tap chose this action. Several of these become separate zones.
 */
type AdaptedAction = {
  label: string;
  name: string;
};

/**
 * One gateway adlib, ready to draw.
 * `id` is the original gateway id. `raw` keeps the parsed item for tags and grouping.
 */
export type AdaptedAdLib<T extends AdLibBase = AdLibBase> = {
  actions: AdaptedAction[];
  credit?: string;
  durationMs?: number;
  group: string;
  id: string;
  raw: T;
  subtitle?: string;
  thumbnailUrl?: string;
  title: string;
};
