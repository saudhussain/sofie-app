/**
 * Segment ids taken from an `activePlaylist` push.
 * Both stay null when that part is missing. The board then uses manual tabs.
 */
export type PlaylistPosition = {
  currentSegmentId: string | null;
  nextSegmentId: string | null;
};
