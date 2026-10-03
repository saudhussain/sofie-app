import { useCallback } from 'react';
import { Pressable } from '@/shared/ui/pressable';
import type { SegmentTab } from '../model/segments';

const roleLabel: Partial<Record<SegmentTab['role'], string>> = {
  current: 'On air',
  next: 'Next',
};

function SegmentChip({
  onSelect,
  selected,
  tab,
}: {
  onSelect: (id: string) => void;
  selected: boolean;
  tab: SegmentTab;
}) {
  const marker = roleLabel[tab.role];
  const fire = useCallback(() => {
    onSelect(tab.id);
  }, [onSelect, tab.id]);

  return (
    <li className="shrink-0">
      <Pressable
        aria-current={tab.role === 'current' ? 'true' : undefined}
        aria-pressed={selected}
        className={`flex min-h-12 max-w-44 flex-col justify-center border px-3 text-left ${
          tab.role === 'current'
            ? 'border-ready text-ready'
            : 'border-line text-ink'
        } ${selected ? 'border-cue' : ''}`}
        onFire={fire}
      >
        {marker ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
            {marker}
          </span>
        ) : null}
        <span className="truncate text-sm">{tab.label}</span>
      </Pressable>
    </li>
  );
}

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
