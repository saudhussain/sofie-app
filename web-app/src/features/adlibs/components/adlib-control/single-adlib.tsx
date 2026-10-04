import { useCallback } from 'react';
import { Pressable } from '@/shared/ui/pressable';
import {
  fireStatusText,
  fireStatusTone,
  useAdLibFire,
} from '../../hooks/use-adlib-fire';
import { Face } from './face';
import type { AdlibControlProps } from './types';
import { cueClass, zoneClass } from './zone-class';

/**
 * The whole face is the button.
 * One action is sent as `actionType`. No actions, as on Clear All Graphics,
 * send the id alone. Status text replaces the action label while it shows.
 */
export function SingleAdlib({
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
        className={`absolute inset-y-3 left-0 w-0.5 ${cueClass(danger)}`}
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
