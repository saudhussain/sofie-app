/**
 * One way to fire an adlib, as the gateway sent it.
 * `label` is what the operator reads. `name` is sent as `actionType` when
 * the tap chose this action and no other.
 */
export type AdLibActionType = {
  label: string;
  name: string;
};

/** Nora fields the adapter reads. Anything else in `publicData` is ignored. */
export type AdLibPublicData = {
  noraPayload?: string;
  noraTiming?: {
    duration?: number;
  };
};

/**
 * Fields shared by part adlibs and global adlibs.
 * `id` is the gateway id, kept unchanged.
 */
export type AdLibBase = {
  actionType: AdLibActionType[];
  id: string;
  name: string;
  publicData?: AdLibPublicData;
  sourceLayer: string;
  tags: string[];
};

/** An adlib tied to one segment of the rundown. */
export type AdLib = AdLibBase & {
  segmentId: string;
};

/**
 * One `adLibs` push from the Live Status Gateway.
 * `globalAdLibs` are `AdLibBase` because a rundown-wide adlib has no segment.
 * `rundownPlaylistId` is null when no rundown is active.
 */
export type AdLibsSnapshot = {
  adLibs: AdLib[];
  globalAdLibs: AdLibBase[];
  rundownPlaylistId: string | null;
};

/**
 * Segment ids taken from an `activePlaylist` push.
 * Both stay null when that part is missing. The board then uses manual tabs.
 */
export type PlaylistPosition = {
  currentSegmentId: string | null;
  nextSegmentId: string | null;
};

/**
 * What the status lamp can show. Lists exist only while connected,
 * so a down gateway or an inactive rundown cannot keep old buttons.
 * Segment ids come from the active playlist. Null means the on-air segment
 * is not known yet. `rundownPlaylistId` is the id execute-adlib posts to.
 */
export type ConnectionState =
  | { kind: 'connecting' }
  | { kind: 'gateway-down' }
  | { kind: 'rundown-inactive' }
  | {
      kind: 'connected';
      adLibs: AdLib[];
      currentSegmentId: string | null;
      globalAdLibs: AdLibBase[];
      nextSegmentId: string | null;
      rundownPlaylistId: string;
    };
