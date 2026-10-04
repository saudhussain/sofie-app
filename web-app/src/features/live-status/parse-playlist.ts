import { isJsonObject } from '@/shared/lib/safe-json';
import type { PlaylistPosition } from './types';

/** A part object contributes its segment id. Null, or any other shape, does not. */
const readSegmentId = (part: unknown): string | null => {
  if (!isJsonObject(part) || typeof part.segmentId !== 'string') {
    return null;
  }
  return part.segmentId.length > 0 ? part.segmentId : null;
};

/**
 * Reads the on-air and next segment from an `activePlaylist` message.
 * `currentPart.segmentId` and `nextPart.segmentId` come from partStatus.
 * When `currentPart` is null, `currentSegment.id` is the fallback.
 * Returns null for every other event so the caller keeps the previous position.
 */
export const parseActivePlaylistMessage = (
  value: unknown
): PlaylistPosition | null => {
  if (!isJsonObject(value) || value.event !== 'activePlaylist') {
    return null;
  }

  const { currentPart, currentSegment, nextPart } = value;
  const currentFromPart = readSegmentId(currentPart);
  const currentFromSegment =
    isJsonObject(currentSegment) &&
    typeof currentSegment.id === 'string' &&
    currentSegment.id.length > 0
      ? currentSegment.id
      : null;

  return {
    currentSegmentId: currentFromPart ?? currentFromSegment,
    nextSegmentId: readSegmentId(nextPart),
  };
};
