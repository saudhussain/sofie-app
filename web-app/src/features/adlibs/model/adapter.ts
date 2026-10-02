import { isJsonObject } from '../../../shared/lib/safe-json';
import type { AdLibBase } from '../../live-status/types';
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
    ...(readString(value.credit) ? { credit: readString(value.credit) } : {}),
    ...(readString(value.title) ? { title: readString(value.title) } : {}),
    ...(readString(value.url) ? { url: readString(value.url) } : {}),
  };
};

const readNoraContent = (payload: string | undefined): NoraContent | null => {
  if (!payload) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(payload);
    if (!(isJsonObject(parsed) && isJsonObject(parsed.content))) {
      return null;
    }
    const picture = readPicture(parsed.content.picture);
    return {
      ...(readString(parsed.content.mainText)
        ? { mainText: readString(parsed.content.mainText) }
        : {}),
      ...(picture ? { picture } : {}),
      ...(readString(parsed.content.secondaryText)
        ? { secondaryText: readString(parsed.content.secondaryText) }
        : {}),
    };
  } catch {
    return null;
  }
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

/** Turns one gateway adlib into the fields the board draws. */
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
    group: groupOf(raw.sourceLayer),
    id: raw.id,
    raw,
    title,
    ...(picture?.credit ? { credit: picture.credit } : {}),
    ...(typeof duration === 'number' && Number.isFinite(duration)
      ? { durationMs: duration }
      : {}),
    ...(subtitle ? { subtitle } : {}),
    ...(picture?.url ? { thumbnailUrl: picture.url } : {}),
  };
};

/** Seconds badge such as "8 s". Tenths are kept when the duration is not whole. */
export const formatDuration = (durationMs: number): string => {
  const seconds = Math.round((durationMs / 1000) * 10) / 10;
  return `${seconds} s`;
};
