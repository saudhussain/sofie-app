import type { AdLib } from '@/features/live-status/types';
import type { AdaptedAdLib } from '../types';

const LOCAL_LAYER_ORDER = ['Tema', 'Super', 'Sted', 'Grafikk'] as const;

type IndexedAdLib = AdaptedAdLib<AdLib> & {
  duplicateIndex?: number;
};

type SegmentGroup = {
  id: string;
  items: IndexedAdLib[];
  label: string;
};

type SegmentTabRole = 'current' | 'next' | 'other' | 'previous';

export type SegmentTab = {
  id: string;
  label: string;
  role: SegmentTabRole;
};

type SegmentStrip = {
  currentKnown: boolean;
  defaultSegmentId: string | null;
  tabs: SegmentTab[];
};

const segmentIdOf = (item: AdaptedAdLib<AdLib>): string | null =>
  item.raw.segmentId.length > 0 ? item.raw.segmentId : null;

const knownLayers = new Set<string>(LOCAL_LAYER_ORDER);

const segmentLabel = (items: AdaptedAdLib<AdLib>[], index: number): string => {
  const tema = items.find((item) => item.group === 'Tema' && item.title);
  return tema?.title ?? `Segment ${index + 1}`;
};

/**
 * Identical titles in one segment get #1, #2, and so on, in array order.
 * A unique title gets no badge. Credit and thumbnails stay as well.
 */
const withDuplicateIndexes = (items: AdaptedAdLib<AdLib>[]): IndexedAdLib[] => {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.title, (totals.get(item.title) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  return items.map((item) => {
    if ((totals.get(item.title) ?? 0) < 2) {
      return item;
    }
    const duplicateIndex = (seen.get(item.title) ?? 0) + 1;
    seen.set(item.title, duplicateIndex);
    return { ...item, duplicateIndex };
  });
};

/**
 * Groups part adlibs by segment in gateway array order.
 * That order is the rundown order. The label prefers the segment's Tema title.
 */
export const groupSegments = (items: AdaptedAdLib<AdLib>[]): SegmentGroup[] => {
  const order: string[] = [];
  const groups = new Map<string, AdaptedAdLib<AdLib>[]>();

  for (const item of items) {
    const segmentId = segmentIdOf(item);
    if (!segmentId) {
      continue;
    }
    const existing = groups.get(segmentId);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(segmentId, [item]);
      order.push(segmentId);
    }
  }

  return order.map((id, index) => {
    const segmentItems = groups.get(id) ?? [];
    return {
      id,
      items: withDuplicateIndexes(segmentItems),
      label: segmentLabel(segmentItems, index),
    };
  });
};

/** Layer buckets for one segment. Known layers stay in front; the rest follow. */
export const groupByLayer = (
  items: IndexedAdLib[]
): { group: string; items: IndexedAdLib[] }[] => {
  const buckets = new Map<string, IndexedAdLib[]>();
  const extras: string[] = [];

  for (const item of items) {
    const key = item.group;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
      if (!knownLayers.has(key)) {
        extras.push(key);
      }
    }
  }

  const keys = [
    ...LOCAL_LAYER_ORDER.filter((key) => buckets.has(key)),
    ...extras,
  ];
  return keys.map((group) => ({
    group,
    items: buckets.get(group) ?? [],
  }));
};

const tab = (segment: SegmentGroup, role: SegmentTabRole): SegmentTab => ({
  id: segment.id,
  label: segment.label,
  role,
});

/**
 * Previous, on-air, and next come first. The rest stay in rundown order.
 * Without a current segment id, every tab is manual and the first is selected.
 */
export const buildSegmentStrip = (
  segments: SegmentGroup[],
  currentSegmentId: string | null,
  nextSegmentId: string | null
): SegmentStrip => {
  if (!currentSegmentId) {
    return {
      currentKnown: false,
      defaultSegmentId: segments[0]?.id ?? null,
      tabs: segments.map((segment) => tab(segment, 'other')),
    };
  }

  // The on-air segment can be missing from adLibs. Keep a tab for it anyway.
  const listed = segments.some((segment) => segment.id === currentSegmentId)
    ? segments
    : [{ id: currentSegmentId, items: [], label: 'On air' }, ...segments];
  const currentIndex = listed.findIndex(
    (segment) => segment.id === currentSegmentId
  );
  const current = listed[currentIndex];
  if (!current) {
    return {
      currentKnown: false,
      defaultSegmentId: segments[0]?.id ?? null,
      tabs: segments.map((segment) => tab(segment, 'other')),
    };
  }

  const previous = currentIndex > 0 ? listed[currentIndex - 1] : undefined;
  const playlistNext = listed.find(
    (segment) => segment.id === nextSegmentId && segment.id !== currentSegmentId
  );
  const adjacentNext = listed[currentIndex + 1];
  // Prefer the playlist's next part. Fall back to the following segment.
  const next =
    playlistNext ??
    (adjacentNext && adjacentNext.id !== previous?.id
      ? adjacentNext
      : undefined);
  const reserved = new Set(
    [previous?.id, current.id, next?.id].filter(
      (id): id is string => typeof id === 'string'
    )
  );

  const tabs: SegmentTab[] = [];
  if (previous) {
    tabs.push(tab(previous, 'previous'));
  }
  tabs.push(tab(current, 'current'));
  if (next) {
    tabs.push(tab(next, 'next'));
  }
  for (const segment of listed) {
    if (!reserved.has(segment.id)) {
      tabs.push(tab(segment, 'other'));
    }
  }

  return {
    currentKnown: true,
    defaultSegmentId: current.id,
    tabs,
  };
};
