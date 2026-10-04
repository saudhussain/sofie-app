import { useCallback, useEffect, useState } from 'react';
import { Pressable } from '@/shared/ui/pressable';
import {
  type FireStatus,
  type FireTone,
  fireStatusText,
  fireStatusTone,
  useAdLibFire,
} from '../hooks/use-adlib-fire';
import { formatDuration } from '../model/adapter';
import type { AdaptedAdLib } from '../types';

type ControlItem = AdaptedAdLib & { duplicateIndex?: number };

type AdlibControlProps = {
  compact?: boolean;
  danger?: boolean;
  hint?: string;
  item: ControlItem;
};

/** Second line while idle. Credit wins over the packed-name subtitle. */
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

const toneClass: Record<FireTone, string> = {
  danger: 'text-danger',
  ready: 'text-ready',
  standby: 'text-standby',
};

/**
 * The second line of a control.
 * A fire status replaces the credit or subtitle for as long as that status
 * shows. Idle with neither credit nor subtitle draws nothing.
 */
function DetailLine({
  detail,
  statusText,
  tone,
}: {
  detail?: string;
  statusText?: string;
  tone?: FireTone;
}) {
  if (statusText) {
    return (
      <p
        aria-live="polite"
        className={`truncate font-mono text-[11px] uppercase tracking-[0.14em] ${toneClass[tone ?? 'standby']}`}
      >
        {statusText}
      </p>
    );
  }
  if (!detail) {
    return null;
  }
  return <p className="truncate text-muted text-sm">{detail}</p>;
}

/**
 * Thumbnail, title, and detail. Shared by the single button and the split
 * header. A status, when passed, replaces the idle credit or subtitle.
 */
function Face({
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

/** A fire tone replaces the idle border. Danger text stays only while idle. */
const borderFor = (danger: boolean, status: FireStatus): string => {
  const tone = fireStatusTone(status);
  if (tone === 'standby') {
    return 'border-standby';
  }
  if (tone === 'ready') {
    return 'border-ready';
  }
  if (tone === 'danger' || danger) {
    return 'border-danger';
  }
  return 'border-line active:border-cue active:shadow-[0_0_8px_var(--color-cue)]';
};

const zoneClass = (danger: boolean, compact: boolean, status: FireStatus) =>
  [
    'relative overflow-hidden border px-3 py-2 text-left',
    compact ? 'min-h-12' : 'min-h-22',
    borderFor(danger, status),
    danger && status === 'idle' ? 'text-danger' : '',
  ].join(' ');

function ActionZone({
  actionName,
  danger,
  item,
  label,
}: {
  actionName: string;
  danger?: boolean;
  item: ControlItem;
  label: string;
}) {
  const { fire, message, status } = useAdLibFire();
  const statusText = fireStatusText(status, message);
  // Each zone is one chosen action, so the action name always goes in the body.
  const onFire = useCallback(() => {
    fire(item.id, actionName);
  }, [actionName, fire, item.id]);
  return (
    <Pressable
      aria-busy={status === 'busy'}
      aria-label={`${item.title}, ${statusText ?? label}`}
      className={`${zoneClass(Boolean(danger), false, status)} w-full bg-stage`}
      onFire={onFire}
    >
      <span className="relative font-mono text-[11px] uppercase tracking-[0.14em]">
        {statusText ?? label}
      </span>
    </Pressable>
  );
}

/**
 * Header plus one zone per action. The header does not post.
 * Each zone posts this adlib with that action's name as `actionType`.
 */
function SplitAdlib({
  compact = false,
  danger = false,
  hint,
  item,
}: AdlibControlProps) {
  return (
    <article
      className={`flex flex-col gap-2 border bg-stage p-3 ${compact ? 'min-h-12' : 'min-h-22'} ${danger ? 'border-danger text-danger' : 'border-line'}`}
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
            actionName={action.name}
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

/**
 * The whole face is the button.
 * One action is sent as `actionType`. No actions, as on Clear All Graphics,
 * send the id alone. Status text replaces the action label while it shows.
 */
function SingleAdlib({
  compact = false,
  danger = false,
  hint,
  item,
}: AdlibControlProps) {
  const { fire, message, status } = useAdLibFire();
  const statusText = fireStatusText(status, message);
  const [action] = item.actions;
  // One action is the choice. Several actions are separate zones above.
  // None, as on Clear All Graphics, sends the id alone.
  const actionType = item.actions.length === 1 ? action?.name : undefined;
  const onFire = useCallback(() => {
    fire(item.id, actionType);
  }, [actionType, fire, item.id]);

  return (
    <Pressable
      aria-busy={status === 'busy'}
      className={`${zoneClass(danger, compact, status)} flex w-full flex-col gap-2 bg-stage p-3`}
      onFire={onFire}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-3 left-0 w-0.5 bg-cue"
      />
      <Face item={item} statusText={statusText} tone={fireStatusTone(status)} />
      {hint ? (
        <span className="font-mono text-[11px] text-muted uppercase tracking-[0.14em]">
          {hint}
        </span>
      ) : null}
      {action && !statusText ? (
        <span className="font-mono text-[11px] text-cue uppercase tracking-[0.14em]">
          {action.label}
        </span>
      ) : null}
    </Pressable>
  );
}

/** One adlib. Several actions become separate zones. A click posts the adlib. */
export const AdlibControl = (props: AdlibControlProps) =>
  props.item.actions.length > 1 ? (
    <SplitAdlib {...props} />
  ) : (
    <SingleAdlib {...props} />
  );

/** Non-pressable header of a split control. The zones underneath post. */
function PreviewFace({ item }: { item: ControlItem }) {
  return (
    <div className="relative min-w-0 pl-3">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-0.5 bg-cue"
      />
      <Face item={item} />
    </div>
  );
}
