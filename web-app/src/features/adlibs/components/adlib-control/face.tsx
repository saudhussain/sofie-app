import type { FireTone } from '../../hooks/use-adlib-fire';
import { formatDuration } from '../../model/adapter';
import { DetailLine } from './detail-line';
import { Thumbnail } from './thumbnail';
import type { ControlItem } from './types';

/** Second line while idle. Credit wins over the packed-name subtitle. */
const detailOf = (item: ControlItem): string | undefined =>
  item.credit ?? item.subtitle;

/**
 * Thumbnail, title, and detail. Shared by the single button and the split
 * header. A status, when passed, replaces the idle credit or subtitle.
 */
export function Face({
  item,
  statusText,
  tone,
}: {
  item: ControlItem;
  statusText?: string;
  tone?: FireTone;
}) {
  const detail = detailOf(item);
  return (
    <div className="flex min-w-0 flex-1 gap-3">
      {item.thumbnailUrl ? <Thumbnail url={item.thumbnailUrl} /> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-base text-ink">{item.title}</p>
        <DetailLine detail={detail} statusText={statusText} tone={tone} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {/* Repeated titles in one segment are numbered in gateway order. */}
        {item.duplicateIndex ? (
          <span className="font-mono text-[11px] text-cue">
            #{item.duplicateIndex}
          </span>
        ) : null}
        {typeof item.durationMs === 'number' ? (
          <span className="border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted">
            {formatDuration(item.durationMs)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
