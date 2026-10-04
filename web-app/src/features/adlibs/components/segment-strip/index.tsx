import type { SegmentTab } from '../../model/segments';
import { SegmentChip } from './segment-chip';

/** Horizontal rundown strip. On air stays marked even when another segment is open. */
export const SegmentStrip = ({
  onSelect,
  selectedId,
  tabs,
}: {
  onSelect: (id: string) => void;
  selectedId: string | null;
  tabs: SegmentTab[];
}) => (
  <ul className="flex shrink-0 gap-2 overflow-x-auto px-3 py-3">
    {tabs.map((tab) => (
      <SegmentChip
        key={tab.id}
        onSelect={onSelect}
        selected={tab.id === selectedId}
        tab={tab}
      />
    ))}
  </ul>
);
