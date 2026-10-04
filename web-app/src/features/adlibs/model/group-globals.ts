import type { AdaptedAdLib } from '../types';

/** Tags whose adlibs take something off air. Those colour the cue in danger. */
const DANGER_TAGS = ['clear', 'clear_all', 'exit-bts-dve'];

export type GlobalSection = {
  items: AdaptedAdLib[];
  title: string;
};

export const isDangerAdLib = (item: AdaptedAdLib): boolean =>
  DANGER_TAGS.some((tag) => item.raw.tags.includes(tag));

/**
 * A group whose titles are all numbers sorts numerically.
 * Cameras are named "1" to "8", and string order would put "10" before "2".
 */
const sortGroup = (items: AdaptedAdLib[]): AdaptedAdLib[] => {
  const numeric = items.every(
    (item) => item.title.length > 0 && Number.isFinite(Number(item.title))
  );
  return numeric
    ? [...items].sort((left, right) => Number(left.title) - Number(right.title))
    : items;
};

/**
 * One section per source layer, in the order the gateway first names it.
 * `adaptAdLib` already maps the "invalid" layer to Control and a missing
 * layer to Other, so every adlib lands in exactly one section.
 */
export const groupGlobalAdLibs = (items: AdaptedAdLib[]): GlobalSection[] => {
  const order: string[] = [];
  const groups = new Map<string, AdaptedAdLib[]>();

  for (const item of items) {
    const existing = groups.get(item.group);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(item.group, [item]);
      order.push(item.group);
    }
  }

  return order.map((title) => ({
    items: sortGroup(groups.get(title) ?? []),
    title,
  }));
};
