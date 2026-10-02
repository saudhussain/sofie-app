import type { AdLibBase } from '@/features/live-status/types';

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
