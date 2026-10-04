import type { AdLibBase } from '@/features/live-status/types';
import { isJsonObject } from '@/shared/lib/safe-json';
import type { AdaptedAdLib } from '../types';

type NoraPicture = {
  credit?: string;
  creators: string[];
  title?: string;
  url?: string;
};

type NoraContent = {
  mainText?: string;
  picture?: NoraPicture;
  secondaryText?: string;
};

/** A non-empty string. Blank and non-strings are treated as missing. */
const readString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Packed gateway names look like "Title; subtitle; variant".
 * Empty pieces and a trailing literal "variant" are not titles.
 */
const titleFromName = (name: string): { subtitle?: string; title: string } => {
  const parts = name
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (parts.at(-1) === 'variant') {
    parts.pop();
  }
  const [titlePart, subtitle] = parts;
  const title = titlePart ?? name.trim();
  return subtitle ? { subtitle, title } : { title };
};

const readPicture = (value: unknown): NoraPicture | undefined => {
  if (!isJsonObject(value)) {
    return undefined;
  }
  const creators = Array.isArray(value.creators)
    ? value.creators.flatMap((creator) => {
        const name = readString(creator);
        return name ? [name] : [];
      })
    : [];
  return {
    creators,
    credit: readString(value.credit),
    title: readString(value.title),
    url: readString(value.url),
  };
};

/**
 * Nora stores a JSON string on `publicData.noraPayload`.
 * A payload that is missing, not JSON, or has no `content` object leaves
 * the title to the packed gateway name.
 */
const parseNoraContent = (payload: string): NoraContent | null => {
  try {
    const parsed: unknown = JSON.parse(payload);
    if (!(isJsonObject(parsed) && isJsonObject(parsed.content))) {
      return null;
    }
    return {
      mainText: readString(parsed.content.mainText),
      picture: readPicture(parsed.content.picture),
      secondaryText: readString(parsed.content.secondaryText),
    };
  } catch {
    return null;
  }
};

/**
 * Keyed on the payload string. Every `adLibs` push rebuilds the lists, and
 * parsing the same JSON again is the expensive part of adapting. A failed
 * payload is cached too, so a bad one is not reparsed on the next push.
 */
const noraContentCache = new Map<string, NoraContent | null>();

const readNoraContent = (payload: string | undefined): NoraContent | null => {
  if (!payload) {
    return null;
  }
  const cached = noraContentCache.get(payload);
  if (cached !== undefined) {
    return cached;
  }
  const content = parseNoraContent(payload);
  noraContentCache.set(payload, content);
  return content;
};

const groupOf = (sourceLayer: string): string => {
  // The gateway uses this layer for controls that are not on a real output.
  if (sourceLayer === 'invalid') {
    return 'Control';
  }
  if (sourceLayer.length === 0) {
    return 'Other';
  }
  return sourceLayer;
};

/**
 * Display fields for one gateway adlib.
 * The title prefers a Nora picture title, then Nora main text, then the
 * packed gateway name. A subtitle is Nora secondary text, then the picture
 * credit or creators. The packed-name subtitle is used only when Nora did
 * not already supply a title, so a leftover "; variant" piece is not shown
 * under a Nora title. `group` is the source layer the local panel buckets by.
 */
export const adaptAdLib = <T extends AdLibBase>(raw: T): AdaptedAdLib<T> => {
  const content = readNoraContent(raw.publicData?.noraPayload);
  const fallback = titleFromName(raw.name);
  const picture = content?.picture;
  const title = picture?.title ?? content?.mainText ?? fallback.title;
  const imageSubtitle =
    picture?.credit ??
    (picture && picture.creators.length > 0
      ? picture.creators.join(', ')
      : undefined);
  // A Nora title already replaced the packed name, so do not also show
  // the leftover "; variant" piece as a subtitle.
  const subtitle =
    content?.secondaryText ??
    imageSubtitle ??
    (picture?.title || content?.mainText ? undefined : fallback.subtitle);
  const duration = raw.publicData?.noraTiming?.duration;

  return {
    actions: raw.actionType.map((action) => ({
      label: action.label,
      name: action.name,
    })),
    credit: picture?.credit,
    durationMs:
      typeof duration === 'number' && Number.isFinite(duration)
        ? duration
        : undefined,
    group: groupOf(raw.sourceLayer),
    id: raw.id,
    raw,
    subtitle,
    thumbnailUrl: picture?.url,
    title,
  };
};

/** Seconds badge such as "8 s". Tenths are kept when the duration is not whole. */
export const formatDuration = (durationMs: number): string => {
  const seconds = Math.round((durationMs / 1000) * 10) / 10;
  return `${seconds} s`;
};
