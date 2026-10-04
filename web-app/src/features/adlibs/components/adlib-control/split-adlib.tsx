import { ActionZones } from './action-zones';
import { CollapsedActions } from './collapsed-actions';
import { PreviewFace } from './preview-face';
import type { AdlibControlProps } from './types';

/**
 * Above this, an adlib's actions are drawn as small cells behind a disclosure
 * instead of full-width zones. Sofie's DVE routing adlibs carry 56 each.
 */
const MANY_ACTIONS = 4;

/**
 * Header plus one zone per action. The header does not post.
 * Each zone posts this adlib with that action's name as `actionType`.
 * An adlib with many actions keeps them collapsed, so one of them cannot
 * push the rest of the panel off screen.
 */
export function SplitAdlib({
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
      {item.actions.length > MANY_ACTIONS ? (
        <CollapsedActions danger={danger} item={item} />
      ) : (
        <ActionZones danger={danger} dense={false} item={item} />
      )}
    </article>
  );
}
