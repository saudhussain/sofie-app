import type { SegmentTab } from '../../model/segments';

/**
 * Names the segment whose buttons are on screen. The tab strip can scroll
 * that tab away, so the name stays here, above the buttons.
 * While a different segment is on air, that name is shown too.
 */
export function ShownSegment({
  onAir,
  showing,
}: {
  onAir: SegmentTab | undefined;
  showing: SegmentTab;
}) {
  const status = segmentStatus(showing, onAir);
  return (
    <div className="flex shrink-0 items-baseline gap-3 border-line border-b px-5 py-2">
      <p className="min-w-0 flex-1 truncate text-sm" id="shown-segment-label">
        {showing.label}
      </p>
      {status ? (
        <p
          className={`shrink-0 truncate font-mono text-[11px] uppercase tracking-[0.14em] ${status.onAir ? 'text-ready' : 'max-w-[45%] text-standby'}`}
        >
          {status.text}
        </p>
      ) : null}
    </div>
  );
}

/** The note beside the segment name. Absent when Sofie has not named an on-air segment. */
const segmentStatus = (
  showing: SegmentTab,
  onAir: SegmentTab | undefined
): { onAir: boolean; text: string } | null => {
  if (showing.role === 'current') {
    return { onAir: true, text: 'On air' };
  }
  if (onAir) {
    return { onAir: false, text: `On air is ${onAir.label}` };
  }
  return null;
};
