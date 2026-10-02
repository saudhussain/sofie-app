import { useEffect, useState } from 'react';
import { Pressable } from '@/shared/ui/pressable';
import { formatDuration } from '../model/adapter';
import type { AdaptedAdLib } from '../types';

type ControlItem = AdaptedAdLib & { duplicateIndex?: number };

type AdlibControlProps = {
  compact?: boolean;
  danger?: boolean;
  hint?: string;
  hold?: boolean;
  item: ControlItem;
};

const detailOf = (item: ControlItem): string | undefined =>
  item.credit ?? item.subtitle;

/**
 * Preload off the button. A failed or blocked image is omitted, so the
 * control stays text-only and never shows a broken-image icon.
 */
function Thumbnail({ url }: { url: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.referrerPolicy = 'no-referrer';
    const show = () => {
      setVisible(true);
    };
    const hide = () => {
      setVisible(false);
    };
    image.addEventListener('load', show);
    image.addEventListener('error', hide);
    image.src = url;
    return () => {
      image.removeEventListener('load', show);
      image.removeEventListener('error', hide);
    };
  }, [url]);

  if (!visible) {
    return null;
  }

  return (
    <img
      alt=""
      className="size-16 shrink-0 bg-stage object-cover"
      draggable={false}
      height={64}
      referrerPolicy="no-referrer"
      src={url}
      width={64}
    />
  );
}

function DetailLine({
  detail,
  statusText,
}: {
  detail?: string;
  statusText?: string;
}) {
  if (statusText) {
    return (
      <p className="truncate font-mono text-[11px] text-standby uppercase tracking-[0.14em]">
        {statusText}
      </p>
    );
  }
  if (!detail) {
    return null;
  }
  return <p className="truncate text-muted text-sm">{detail}</p>;
}

function Face({
  item,
  statusText,
}: {
  item: ControlItem;
  statusText?: string;
}) {
  const detail = detailOf(item);
  return (
    <div className="flex min-w-0 flex-1 gap-3">
      {item.thumbnailUrl ? <Thumbnail url={item.thumbnailUrl} /> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-base text-ink">{item.title}</p>
        <DetailLine detail={detail} statusText={statusText} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
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

const zoneClass = (danger: boolean, compact: boolean) =>
  [
    'relative overflow-hidden border px-3 py-2 text-left',
    compact ? 'min-h-12' : 'min-h-22',
    danger
      ? 'border-danger text-danger'
      : 'border-line active:border-cue active:shadow-[0_0_8px_var(--color-cue)]',
  ].join(' ');

const itemTooltip = (item: ControlItem) => ({
  credit: item.credit,
  subtitle: item.subtitle,
  title: item.title,
});

function ActionZone({
  danger,
  item,
  label,
}: {
  danger?: boolean;
  item: ControlItem;
  label: string;
}) {
  return (
    <Pressable
      aria-label={`${item.title}, ${label}`}
      className={`${zoneClass(Boolean(danger), false)} w-full bg-stage`}
      tooltip={itemTooltip(item)}
    >
      {({ holdHint }) => (
        <span className="relative font-mono text-[11px] uppercase tracking-[0.14em]">
          {holdHint ?? label}
        </span>
      )}
    </Pressable>
  );
}

function SplitAdlib({
  compact = false,
  danger = false,
  hint,
  item,
}: AdlibControlProps) {
  return (
    <article
      className={`flex flex-col gap-2 border bg-stage p-3 ${compact ? 'min-h-12' : 'min-h-22'} ${danger ? 'border-danger' : 'border-line'}`}
    >
      <PreviewFace item={item} />
      {hint ? (
        <p className="font-mono text-[11px] text-muted uppercase tracking-[0.14em]">
          {hint}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {item.actions.map((action) => (
          <ActionZone
            danger={danger}
            item={item}
            key={action.name}
            label={action.label}
          />
        ))}
      </div>
    </article>
  );
}

function SingleAdlib({
  compact = false,
  danger = false,
  hint,
  hold = false,
  item,
}: AdlibControlProps) {
  const [action] = item.actions;

  return (
    <Pressable
      className={`${zoneClass(danger, compact)} flex w-full flex-col gap-2 bg-stage p-3`}
      holdFill
      mode={hold ? 'hold' : 'tap'}
      tooltip={itemTooltip(item)}
    >
      {({ holdHint }) => (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-y-3 left-0 w-0.5 bg-cue"
          />
          <Face item={item} statusText={holdHint} />
          {hint ? (
            <span className="font-mono text-[11px] text-muted uppercase tracking-[0.14em]">
              {hint}
            </span>
          ) : null}
          {action && !holdHint ? (
            <span className="font-mono text-[11px] text-cue uppercase tracking-[0.14em]">
              {action.label}
            </span>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

/** One adlib. Several actions become separate zones. A hold control ignores a quick tap. Taps do not call Sofie. */
export const AdlibControl = (props: AdlibControlProps) =>
  props.item.actions.length > 1 ? (
    <SplitAdlib {...props} />
  ) : (
    <SingleAdlib {...props} />
  );

function PreviewFace({ item }: { item: ControlItem }) {
  return (
    <Pressable
      as="div"
      className="relative min-w-0 pl-3"
      mode="preview"
      tooltip={itemTooltip(item)}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 bg-cue"
      />
      <Face item={item} />
    </Pressable>
  );
}
