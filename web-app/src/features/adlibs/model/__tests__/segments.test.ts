import { describe, expect, it } from 'vitest';
import type { AdLib } from '@/features/live-status/types';
import { adaptAdLib } from '../adapter';
import { buildSegmentStrip, groupSegments } from '../segments';

const part = (id: string, name: string, segmentId: string) =>
  adaptAdLib<AdLib>({
    actionType: [],
    id,
    name,
    segmentId,
    sourceLayer: 'Tema',
    tags: [],
  });

const segments = groupSegments([
  part('a', 'Alpha', 'seg-a'),
  part('b', 'Beta', 'seg-b'),
  part('c', 'Gamma', 'seg-c'),
  part('d', 'Delta', 'seg-d'),
]);

describe('buildSegmentStrip', () => {
  it('puts on air and the playlist next ahead of the rundown order', () => {
    expect(buildSegmentStrip(segments, 'seg-a', 'seg-c')).toEqual({
      currentKnown: true,
      defaultSegmentId: 'seg-a',
      tabs: [
        { id: 'seg-a', label: 'Alpha', role: 'current' },
        { id: 'seg-c', label: 'Gamma', role: 'next' },
        { id: 'seg-b', label: 'Beta', role: 'other' },
        { id: 'seg-d', label: 'Delta', role: 'other' },
      ],
    });
  });
});
