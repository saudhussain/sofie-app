import type {
  AdLib,
  AdlibPanelKind,
  ConnectionState,
  GlobalAdLib,
} from '../../types';

/**
 * Empty-panel copy. The sentence depends on why the list is empty:
 * gateway trouble, no active rundown, or a rundown with nothing in this column.
 */
export const adLibPanelEmptyMessage = (
  connection: ConnectionState,
  panel: AdlibPanelKind
): string => {
  if (connection.kind === 'connecting' || connection.kind === 'gateway-down') {
    return 'Waiting for the live status gateway.';
  }
  if (connection.kind === 'rundown-inactive') {
    return 'Activate a rundown in Sofie.';
  }
  return panel === 'adLibs'
    ? 'No adlibs for the current part.'
    : 'No global adlibs for this rundown.';
};

/**
 * Names for one column. Anything but an active rundown yields an empty list
 * so names from the last good message do not stay on screen.
 */
export const adLibsToDisplay = (
  connection: ConnectionState,
  panel: AdlibPanelKind
): AdLib[] | GlobalAdLib[] => {
  if (connection.kind !== 'connected') {
    return [];
  }
  return panel === 'adLibs' ? connection.adLibs : connection.globalAdLibs;
};
