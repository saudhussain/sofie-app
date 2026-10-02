import type { AdLib, GlobalAdLib } from './adlib';

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
