import { isJsonObject } from '@/shared/lib/safe-json';
import type {
  AdLib,
  AdLibBase,
  AdLibPublicData,
  AdLibsSnapshot,
} from './types';

// A bad action type is skipped. The adlib itself can still be shown.
const parseActionTypes = (value: unknown): AdLibBase['actionType'] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((actionType) => {
    if (!isJsonObject(actionType)) {
      return [];
    }
    if (
      typeof actionType.name !== 'string' ||
      typeof actionType.label !== 'string'
    ) {
      return [];
    }
    return [{ label: actionType.label, name: actionType.name }];
  });
};

/** Non-strings are dropped. A missing tags field is an empty list, not a reject. */
const parseTags = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === 'string')
    : [];

/**
 * Keeps only the Nora fields the adapter displays.
 * Other publicData keys are ignored. No payload and no duration means the
 * field is omitted, and the adapter falls back to the gateway name.
 */
const parsePublicData = (value: unknown): AdLibPublicData | undefined => {
  if (!isJsonObject(value)) {
    return undefined;
  }

  const noraPayload =
    typeof value.noraPayload === 'string' ? value.noraPayload : undefined;
  const timing = isJsonObject(value.noraTiming) ? value.noraTiming : undefined;
  const duration =
    timing && typeof timing.duration === 'number' ? timing.duration : undefined;

  if (noraPayload === undefined && duration === undefined) {
    return undefined;
  }

  return {
    ...(noraPayload === undefined ? {} : { noraPayload }),
    ...(duration === undefined ? {} : { noraTiming: { duration } }),
  };
};

const parseAdLibBase = (value: unknown): AdLibBase | null => {
  if (!isJsonObject(value)) {
    return null;
  }
  // No id means no stable list key. No name means nothing to show.
  if (typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }

  const publicData = parsePublicData(value.publicData);

  return {
    actionType: parseActionTypes(value.actionType),
    id: value.id,
    name: value.name,
    ...(publicData ? { publicData } : {}),
    // A missing layer still keeps the item. "invalid" is filtered in the adapter.
    sourceLayer: typeof value.sourceLayer === 'string' ? value.sourceLayer : '',
    tags: parseTags(value.tags),
  };
};

/**
 * A part adlib must name its segment and part. Global adlibs do not, so they
 * are parsed with `parseAdLibBase` and never reach this check.
 */
const parsePartAdLib = (value: unknown): AdLib | null => {
  const base = parseAdLibBase(value);
  if (!(base && isJsonObject(value))) {
    return null;
  }
  // Part adlibs are tied to the content on air. No segment or part means drop it.
  if (typeof value.segmentId !== 'string' || typeof value.partId !== 'string') {
    return null;
  }

  return {
    ...base,
    segmentId: value.segmentId,
  };
};

/**
 * Turns one gateway message into the adlibs to show.
 * Ignores every event except `adLibs`. Returns null on a bad shape so the
 * previous lists stay up. Items missing an id or a name are left out.
 */
export const parseAdLibsMessage = (value: unknown): AdLibsSnapshot | null => {
  // The subscribe ack and other events are not a new snapshot.
  if (!isJsonObject(value) || value.event !== 'adLibs') {
    return null;
  }
  if (!(Array.isArray(value.adLibs) && Array.isArray(value.globalAdLibs))) {
    return null;
  }

  const { rundownPlaylistId } = value;
  // Null means no rundown is active. Any other type is a payload we cannot trust.
  if (!(typeof rundownPlaylistId === 'string' || rundownPlaylistId === null)) {
    return null;
  }

  return {
    adLibs: value.adLibs.flatMap((entry) => {
      const partAdLib = parsePartAdLib(entry);
      return partAdLib ? [partAdLib] : [];
    }),
    globalAdLibs: value.globalAdLibs.flatMap((entry) => {
      const globalAdLib = parseAdLibBase(entry);
      return globalAdLib ? [globalAdLib] : [];
    }),
    rundownPlaylistId,
  };
};
