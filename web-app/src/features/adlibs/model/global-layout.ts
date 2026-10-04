import type { AdaptedAdLib } from '../types';

/**
 * How global adlibs are drawn. Match sourceLayer and tags in this order.
 * Anything that matches nothing lands in Other, so a new adlib cannot vanish.
 */
export const globalLayout = {
  cameras: { sourceLayer: 'Kam', title: 'Cameras' },
  clearTags: ['clear', 'clear_all'],
  control: { sourceLayer: 'invalid', title: 'Control' },
  dveLayouts: { tag: 'dve-layout', title: 'DVE layouts' },
  dveModes: [
    { label: 'Set', tag: 'auto' },
    { label: 'Next', tag: 'next' },
    { label: 'Current', tag: 'current' },
  ],
  dveRouting: { tag: 'dve-routing', title: 'DVE input' },
  modeActions: ['toggle', 'in', 'out'],
  namedGroups: [
    { tag: 'last-item', title: 'Last' },
    { tag: 'transition-mix', title: 'Transition' },
    { tag: 'continue', title: 'Continue' },
    { tag: 'takeout-screen', title: 'Screens' },
  ],
  otherTitle: 'Other',
  pairs: { tags: ['up', 'down'], title: 'Up / Down' },
  remotes: {
    silentTag: 'no-audio',
    soundTag: 'with-audio',
    sourceLayer: 'DIR',
    title: 'Remote feeds',
  },
} as const;

type RemotePair = {
  silent: AdaptedAdLib | null;
  sound: AdaptedAdLib;
};

type UpDownPair = {
  down: AdaptedAdLib;
  label: string;
  up: AdaptedAdLib;
};

export type RoutingModes = {
  auto?: AdaptedAdLib;
  current?: AdaptedAdLib;
  next?: AdaptedAdLib;
};

export type GlobalSection =
  | { items: AdaptedAdLib[]; kind: 'cameras'; title: string }
  | { kind: 'remotes'; pairs: RemotePair[]; title: string }
  | { items: AdaptedAdLib[]; kind: 'layouts'; title: string }
  | { kind: 'routing'; modes: RoutingModes; title: string }
  | { kind: 'pairs'; pairs: UpDownPair[]; title: string }
  | { items: AdaptedAdLib[]; kind: 'modes'; title: string }
  | {
      danger: boolean;
      items: AdaptedAdLib[];
      kind: 'buttons';
      title: string;
    };

const hasTag = (item: AdaptedAdLib, tag: string): boolean =>
  item.raw.tags.includes(tag);

/** True when the adlib offers toggle, in, and out. Those become three zones. */
const isModeItem = (item: AdaptedAdLib): boolean => {
  const names = new Set(item.actions.map((action) => action.name));
  return globalLayout.modeActions.every((name) => names.has(name));
};

/**
 * Puts a sound feed beside its video-only partner.
 * The silent feed is named like the sound feed plus a trailing "v".
 * A silent feed with no partner, and any item that has neither tag, is still
 * shown as a single button so it cannot disappear.
 */
const pairRemotes = (items: AdaptedAdLib[]): RemotePair[] => {
  const silentByName = new Map<string, AdaptedAdLib>();
  const sound: AdaptedAdLib[] = [];
  const rest: AdaptedAdLib[] = [];

  for (const item of items) {
    if (hasTag(item, globalLayout.remotes.silentTag)) {
      silentByName.set(item.raw.name, item);
    } else if (hasTag(item, globalLayout.remotes.soundTag)) {
      sound.push(item);
    } else {
      rest.push(item);
    }
  }

  const consumed = new Set<string>();
  const pairs: RemotePair[] = sound.map((item) => {
    // Video-only feeds are named like the sound feed plus a trailing "v".
    const partner = silentByName.get(`${item.raw.name}v`);
    if (partner) {
      consumed.add(partner.id);
    }
    return { silent: partner ?? null, sound: item };
  });

  for (const item of silentByName.values()) {
    if (!consumed.has(item.id)) {
      pairs.push({ silent: null, sound: item });
    }
  }
  for (const item of rest) {
    pairs.push({ silent: null, sound: item });
  }
  return pairs;
};

const pairsForLayer = (
  layer: string,
  bucket: { down: AdaptedAdLib[]; up: AdaptedAdLib[] }
): { leftover: AdaptedAdLib[]; pairs: UpDownPair[] } => {
  const ups = [...bucket.up];
  const downs = [...bucket.down];
  const pairs: UpDownPair[] = [];
  while (ups.length > 0 && downs.length > 0) {
    const up = ups.shift();
    const down = downs.shift();
    if (up && down) {
      pairs.push({ down, label: layer, up });
    }
  }
  return { leftover: [...ups, ...downs], pairs };
};

/**
 * Pairs up and down on the same source layer.
 * An up with no down is leftover on purpose: Direkte and Klokke are tagged
 * `up` only, and Other must still show them.
 */
const pairUpDown = (
  items: AdaptedAdLib[]
): { leftover: AdaptedAdLib[]; pairs: UpDownPair[] } => {
  const layers: string[] = [];
  const byLayer = new Map<
    string,
    { down: AdaptedAdLib[]; up: AdaptedAdLib[] }
  >();

  for (const item of items) {
    const layer = item.raw.sourceLayer;
    const bucket = byLayer.get(layer);
    const side = hasTag(item, 'down') ? 'down' : 'up';
    if (bucket) {
      bucket[side].push(item);
    } else {
      byLayer.set(layer, {
        down: side === 'down' ? [item] : [],
        up: side === 'up' ? [item] : [],
      });
      layers.push(layer);
    }
  }

  const pairs: UpDownPair[] = [];
  const leftover: AdaptedAdLib[] = [];
  for (const layer of layers) {
    const bucket = byLayer.get(layer);
    if (!bucket) {
      continue;
    }
    const layerPairs = pairsForLayer(layer, bucket);
    pairs.push(...layerPairs.pairs);
    leftover.push(...layerPairs.leftover);
  }
  return { leftover, pairs };
};

const routingModes = (items: AdaptedAdLib[]): RoutingModes => {
  const modes: RoutingModes = {};
  for (const mode of globalLayout.dveModes) {
    const item = items.find((candidate) => hasTag(candidate, mode.tag));
    if (item) {
      modes[mode.tag] = item;
    }
  }
  return modes;
};

/** How many gateway adlibs a section represents. Routing counts items, not actions. */
export const sectionCount = (section: GlobalSection): number => {
  switch (section.kind) {
    case 'cameras':
    case 'layouts':
    case 'modes':
    case 'buttons':
      return section.items.length;
    case 'remotes':
      return section.pairs.reduce(
        (sum, pair) => sum + 1 + (pair.silent ? 1 : 0),
        0
      );
    case 'routing':
      return globalLayout.dveModes.filter((mode) => section.modes[mode.tag])
        .length;
    case 'pairs':
      return section.pairs.length * 2;
    default:
      return 0;
  }
};

/**
 * Every global adlib is in exactly one section. The counts add up to the input.
 * Order matters: mode items are also tagged `up`, so they are taken before
 * up/down pairs. Exit is taken before Other, or that one button lands in Other.
 * Named tags such as takeout-screen are taken before the invalid layer, so a
 * screen control is not filed under Control.
 */
export const layoutGlobalAdLibs = (items: AdaptedAdLib[]): GlobalSection[] => {
  const used = new Set<string>();
  const remaining = (): AdaptedAdLib[] =>
    items.filter((item) => !used.has(item.id));
  const take = (predicate: (item: AdaptedAdLib) => boolean): AdaptedAdLib[] => {
    const found = remaining().filter(predicate);
    for (const item of found) {
      used.add(item.id);
    }
    return found;
  };

  const sections: GlobalSection[] = [];

  // Camera numbers live in the gateway name, so they sort numerically.
  const cameras = take(
    (item) => item.raw.sourceLayer === globalLayout.cameras.sourceLayer
  ).sort((left, right) => Number(left.raw.name) - Number(right.raw.name));
  if (cameras.length > 0) {
    sections.push({
      items: cameras,
      kind: 'cameras',
      title: globalLayout.cameras.title,
    });
  }

  // DIR feeds tagged with or without audio. Pairing happens after the take.
  const remotes = pairRemotes(
    take(
      (item) =>
        item.raw.sourceLayer === globalLayout.remotes.sourceLayer &&
        (hasTag(item, globalLayout.remotes.soundTag) ||
          hasTag(item, globalLayout.remotes.silentTag))
    )
  );
  if (remotes.length > 0) {
    sections.push({
      kind: 'remotes',
      pairs: remotes,
      title: globalLayout.remotes.title,
    });
  }

  // One button per layout. These post the adlib, unlike the routing grid below.
  const layouts = take((item) => hasTag(item, globalLayout.dveLayouts.tag));
  if (layouts.length > 0) {
    sections.push({
      items: layouts,
      kind: 'layouts',
      title: globalLayout.dveLayouts.title,
    });
  }

  // One adlib per mode (Set, Next, Current). The grid picks the mode locally
  // and posts a source action on that adlib.
  const routingItems = take(
    (item) =>
      hasTag(item, globalLayout.dveRouting.tag) &&
      globalLayout.dveModes.some((mode) => hasTag(item, mode.tag))
  );
  const modes = routingModes(routingItems);
  if (routingItems.length > 0) {
    sections.push({
      kind: 'routing',
      modes,
      title: globalLayout.dveRouting.title,
    });
  }

  // Taken before up/down. These items are also tagged `up`.
  const modeItems = take(isModeItem);
  if (modeItems.length > 0) {
    sections.push({ items: modeItems, kind: 'modes', title: 'Modes' });
  }

  const upDownCandidates = remaining().filter(
    (item) => hasTag(item, 'up') || hasTag(item, 'down')
  );
  // Only the paired items are marked used. Leftovers stay for Other.
  const { pairs } = pairUpDown(upDownCandidates);
  for (const pair of pairs) {
    used.add(pair.up.id);
    used.add(pair.down.id);
  }
  if (pairs.length > 0) {
    sections.push({ kind: 'pairs', pairs, title: globalLayout.pairs.title });
  }

  // Taken now so Other cannot swallow them. Drawn later, in red, after Exit.
  const clearItems = take((item) =>
    globalLayout.clearTags.some((tag) => hasTag(item, tag))
  );

  // Named tags before the invalid layer, so a screen is not filed under Control.
  for (const group of globalLayout.namedGroups) {
    const grouped = take((item) => hasTag(item, group.tag));
    if (grouped.length > 0) {
      sections.push({
        danger: false,
        items: grouped,
        kind: 'buttons',
        title: group.title,
      });
    }
  }

  // Taken before Other, or this button would land there.
  const exitItems = take((item) => hasTag(item, 'exit-bts-dve'));
  // Everything still unused except the invalid layer, which is Control below.
  const other = take(
    (item) => item.raw.sourceLayer !== globalLayout.control.sourceLayer
  );
  if (other.length > 0) {
    sections.push({
      danger: false,
      items: other,
      kind: 'buttons',
      title: globalLayout.otherTitle,
    });
  }

  if (exitItems.length > 0) {
    sections.push({
      danger: true,
      items: exitItems,
      kind: 'buttons',
      title: 'Exit DVE',
    });
  }
  if (clearItems.length > 0) {
    sections.push({
      danger: true,
      items: clearItems,
      kind: 'buttons',
      title: 'Clear',
    });
  }

  // Last on purpose. These are sourceLayer "invalid", not a real output.
  const control = take(
    (item) => item.raw.sourceLayer === globalLayout.control.sourceLayer
  );
  if (control.length > 0) {
    sections.push({
      danger: false,
      items: control,
      kind: 'buttons',
      title: globalLayout.control.title,
    });
  }

  return sections;
};
