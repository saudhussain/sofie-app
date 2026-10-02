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
