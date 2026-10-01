import type { AdLib, GlobalAdLib } from './adlib';

/**
 * What the status lamp can show. Lists exist only while connected,
 * so a down gateway or an inactive rundown cannot keep old names.
 */
export type ConnectionState =
  | { kind: 'connecting' }
  | { kind: 'gateway-down' }
  | { kind: 'rundown-inactive' }
  | {
      kind: 'connected';
      rundownPlaylistId: string;
      adLibs: AdLib[];
      globalAdLibs: GlobalAdLib[];
    };

/** Which column to read: the current part, or the whole rundown. */
export type AdlibPanelKind = 'adLibs' | 'globalAdLibs';
