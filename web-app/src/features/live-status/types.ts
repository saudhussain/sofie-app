/**
 * One way to fire an adlib.
 * `label` is what the operator reads. `name` is the action name from the gateway.
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

/** An adlib for the whole rundown. It has no segment. */
export type GlobalAdLib = AdLibBase;

/**
 * One `adLibs` push from the Live Status Gateway.
 * `rundownPlaylistId` is null when no rundown is active.
 */
export type AdLibsSnapshot = {
  adLibs: AdLib[];
  globalAdLibs: GlobalAdLib[];
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
 * is not known yet.
 */
export type ConnectionState =
  | { kind: 'connecting' }
  | { kind: 'gateway-down' }
  | { kind: 'rundown-inactive' }
  | {
      kind: 'connected';
      adLibs: AdLib[];
      globalAdLibs: GlobalAdLib[];
      currentSegmentId: string | null;
      nextSegmentId: string | null;
    };
