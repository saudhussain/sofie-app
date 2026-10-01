/**
 * One way to fire an adlib.
 * `label` is the text a person reads. `name` is the value Sofie expects when the adlib is run.
 * The list does not show these yet.
 * @see https://github.com/Sofie-Automation/sofie-core/blob/main/packages/live-status-gateway-api/api/components/adLibs/actionType/actionType.yaml
 */
export type AdLibActionType = {
  label: string;
  name: string;
};

/**
 * The fields every adlib has.
 * `id` identifies it, `name` is the label an operator set, and `sourceLayer` is the layer it plays on.
 * `actionType` lists the ways it can be fired.
 * @see https://github.com/Sofie-Automation/sofie-core/blob/main/packages/live-status-gateway-api/api/components/adLibs/adLibBase/adLibBase.yaml
 */
export type AdLibBase = {
  actionType: AdLibActionType[];
  id: string;
  name: string;
  sourceLayer: string;
};

/**
 * An adlib for the content that is playing now.
 * `segmentId` and `partId` name the segment and the part it belongs to.
 * The gateway sends a new list when Sofie moves to another part.
 * @see https://github.com/Sofie-Automation/sofie-core/blob/main/packages/live-status-gateway-api/api/components/adLibs/adLibStatus/adLibStatus.yaml
 */
export type AdLib = AdLibBase & {
  segmentId: string;
  partId: string;
};

/**
 * An adlib for the whole rundown.
 * It stays in the list for as long as that rundown is active.
 * @see https://github.com/Sofie-Automation/sofie-core/blob/main/packages/live-status-gateway-api/api/components/adLibs/globalAdLibStatus/globalAdLibStatus.yaml
 */
export type GlobalAdLib = AdLibBase;

/**
 * One update pushed by the Live Status Gateway.
 * It holds the adlibs for the current part, the adlibs for the whole rundown, and the id of the active rundown.
 * That id is null when no rundown is active.
 * @see https://github.com/Sofie-Automation/sofie-core/blob/main/packages/live-status-gateway-api/api/components/adLibs/adLibsEvent/adLibsEvent.yaml
 */
export type AdLibsSnapshot = {
  adLibs: AdLib[];
  globalAdLibs: GlobalAdLib[];
  rundownPlaylistId: string | null;
};

/**
 * The id and name a panel shows for one adlib.
 * The other fields stay off screen.
 */
export type AdlibListItem = {
  id: string;
  name: string;
};
