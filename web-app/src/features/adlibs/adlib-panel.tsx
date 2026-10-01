import { ListPanel } from '../../components/list-panel';
import type { AdlibListItem } from '../../types';

type AdlibPanelProps = {
  adLibs: AdlibListItem[];
  emptyStateMessage: string;
  headingId: string;
  title: string;
};

/** Adlib column. Lists names only. A tap does not fire the action yet. */
export const AdlibPanel = ({
  adLibs,
  emptyStateMessage,
  headingId,
  title,
}: AdlibPanelProps) => (
  <ListPanel
    emptyStateMessage={emptyStateMessage}
    headingId={headingId}
    items={adLibs}
    title={title}
  />
);
