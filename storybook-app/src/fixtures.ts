import type { ControlItem } from '@/features/adlibs/components/adlib-control/types';
import { adaptAdLib } from '@/features/adlibs/model/adapter';
import type { SegmentTab } from '@/features/adlibs/model/segments';
import type {
  AdLib,
  AdLibActionType,
  AdLibBase,
  AdLibPublicData,
  ConnectionState,
} from '@/features/live-status/types';

const take: AdLibActionType = { label: 'Take', name: 'take' };

const inOut: AdLibActionType[] = [
  { label: 'In', name: 'in' },
  { label: 'Out', name: 'out' },
];

const routingActions: AdLibActionType[] = [
  { label: 'Box 1', name: 'box-1' },
  { label: 'Box 2', name: 'box-2' },
  { label: 'Box 3', name: 'box-3' },
  { label: 'Box 4', name: 'box-4' },
  { label: 'Box 5', name: 'box-5' },
  { label: 'Mix', name: 'mix' },
];

const thumbnailSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#1c2836"/><rect x="10" y="40" width="44" height="8" fill="#3dbeff"/></svg>';

export const thumbnailUrl = `data:image/svg+xml,${encodeURIComponent(thumbnailSvg)}`;

const portraitPayload = JSON.stringify({
  content: {
    mainText: 'Guest',
    picture: {
      creators: ['NRK'],
      credit: 'NRK',
      title: 'Guest',
      url: thumbnailUrl,
    },
    secondaryText: 'Studio 1',
  },
});

const portraitData: AdLibPublicData = {
  noraPayload: portraitPayload,
  noraTiming: { duration: 8000 },
};

const forecastData: AdLibPublicData = {
  noraPayload: JSON.stringify({
    content: {
      mainText: 'Forecast',
      secondaryText: 'Rain until evening',
    },
  }),
  noraTiming: { duration: 12_000 },
};

const part = ({
  actions = [take],
  id,
  name,
  publicData,
  segmentId,
  sourceLayer,
  tags = [],
}: {
  actions?: AdLibActionType[];
  id: string;
  name: string;
  publicData?: AdLibPublicData;
  segmentId: string;
  sourceLayer: string;
  tags?: string[];
}): AdLib => {
  const adLib: AdLib = {
    actionType: actions,
    id,
    name,
    segmentId,
    sourceLayer,
    tags,
  };
  if (publicData) {
    adLib.publicData = publicData;
  }
  return adLib;
};

const globalAdLib = ({
  actions = [take],
  id,
  name,
  sourceLayer,
  tags = [],
}: {
  actions?: AdLibActionType[];
  id: string;
  name: string;
  sourceLayer: string;
  tags?: string[];
}): AdLibBase => ({
  actionType: actions,
  id,
  name,
  sourceLayer,
  tags,
});

const openingWelcome = part({
  id: 'welcome',
  name: 'Welcome',
  segmentId: 'opening',
  sourceLayer: 'Super',
});

const interviewGuest = part({
  id: 'guest',
  name: 'Guest; Studio 1',
  publicData: portraitData,
  segmentId: 'interview',
  sourceLayer: 'Super',
});

const interviewGuestAgain = part({
  id: 'guest-again',
  name: 'Guest',
  segmentId: 'interview',
  sourceLayer: 'Super',
});

const interviewPlace = part({
  id: 'oslo',
  name: 'Oslo',
  segmentId: 'interview',
  sourceLayer: 'Sted',
});

const interviewTransition = part({
  actions: inOut,
  id: 'transition',
  name: 'Lower third',
  segmentId: 'interview',
  sourceLayer: 'Grafikk',
});

const localAdLibs: AdLib[] = [
  part({
    id: 'opening-tema',
    name: 'Opening',
    segmentId: 'opening',
    sourceLayer: 'Tema',
  }),
  openingWelcome,
  part({
    id: 'interview-tema',
    name: 'Interview',
    segmentId: 'interview',
    sourceLayer: 'Tema',
  }),
  interviewGuest,
  interviewGuestAgain,
  interviewPlace,
  interviewTransition,
  part({
    id: 'weather-tema',
    name: 'Weather',
    segmentId: 'weather',
    sourceLayer: 'Tema',
  }),
  part({
    id: 'forecast',
    name: 'Forecast',
    publicData: forecastData,
    segmentId: 'weather',
    sourceLayer: 'Super',
  }),
  part({
    id: 'closing-tema',
    name: 'Closing',
    segmentId: 'closing',
    sourceLayer: 'Tema',
  }),
  part({
    actions: routingActions,
    id: 'news-wall-local',
    name: 'News wall',
    segmentId: 'closing',
    sourceLayer: 'DVE',
  }),
];

const clearAll = globalAdLib({
  actions: [],
  id: 'clear-all',
  name: 'Clear all graphics',
  sourceLayer: 'invalid',
  tags: ['clear_all'],
});

const newsWall = globalAdLib({
  actions: routingActions,
  id: 'news-wall',
  name: 'News wall',
  sourceLayer: 'DVE',
});

const globalAdLibs: AdLibBase[] = [
  globalAdLib({ id: 'cam-10', name: '10', sourceLayer: 'Camera' }),
  globalAdLib({ id: 'cam-2', name: '2', sourceLayer: 'Camera' }),
  globalAdLib({ id: 'cam-1', name: '1', sourceLayer: 'Camera' }),
  clearAll,
  newsWall,
  globalAdLib({
    actions: inOut,
    id: 'bug',
    name: 'Bug',
    sourceLayer: 'Super',
  }),
];

const onAir: ConnectionState = {
  adLibs: localAdLibs,
  currentSegmentId: 'interview',
  globalAdLibs,
  kind: 'connected',
  nextSegmentId: 'weather',
  rundownPlaylistId: 'rundown-playlist',
};

export const populatedConnection = onAir;

export const emptyConnection: ConnectionState = {
  adLibs: [],
  currentSegmentId: null,
  globalAdLibs: [],
  kind: 'connected',
  nextSegmentId: null,
  rundownPlaylistId: 'rundown-playlist',
};

export const unknownSegmentConnection: ConnectionState = {
  ...onAir,
  currentSegmentId: null,
  nextSegmentId: null,
};

export const connectingConnection: ConnectionState = { kind: 'connecting' };

export const gatewayDownConnection: ConnectionState = {
  kind: 'gateway-down',
};

export const inactiveConnection: ConnectionState = {
  kind: 'rundown-inactive',
};

export const welcomeItem: ControlItem = adaptAdLib(openingWelcome);

export const portraitItem: ControlItem = adaptAdLib(interviewGuest);

export const guestAgainItem: ControlItem = {
  ...adaptAdLib(interviewGuestAgain),
  duplicateIndex: 2,
};

export const forecastItem: ControlItem = adaptAdLib(
  part({
    id: 'forecast',
    name: 'Forecast',
    publicData: forecastData,
    segmentId: 'weather',
    sourceLayer: 'Super',
  })
);

export const clearItem: ControlItem = adaptAdLib(clearAll);

export const transitionItem: ControlItem = adaptAdLib(interviewTransition);

export const routingItem: ControlItem = adaptAdLib(newsWall);

export const openingTab: SegmentTab = {
  id: 'opening',
  label: 'Opening',
  role: 'previous',
};

export const interviewTab: SegmentTab = {
  id: 'interview',
  label: 'Interview',
  role: 'current',
};

export const weatherTab: SegmentTab = {
  id: 'weather',
  label: 'Weather',
  role: 'next',
};

export const closingTab: SegmentTab = {
  id: 'closing',
  label: 'Closing',
  role: 'other',
};

export const ministerTab: SegmentTab = {
  id: 'minister',
  label: 'Interview with the foreign minister',
  role: 'other',
};

export const segmentTabs: SegmentTab[] = [
  openingTab,
  interviewTab,
  weatherTab,
  closingTab,
];

export const longSegmentTabs: SegmentTab[] = [
  ...segmentTabs,
  ministerTab,
  { id: 'sport', label: 'Sport', role: 'other' },
  { id: 'culture', label: 'Culture', role: 'other' },
  { id: 'debate', label: 'Debate', role: 'other' },
];
