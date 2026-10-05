import { useCallback } from 'react';
import { Pressable } from '@/shared/ui/pressable';
import { fireStatusText, useAdLibFire } from '../../hooks/use-adlib-fire';
import type { ControlItem } from './types';
import { zoneClass } from './zone-class';

export function ActionZone({
  actionName,
  compact,
  danger,
  item,
  label,
}: {
  actionName: string;
  compact: boolean;
  danger?: boolean;
  item: ControlItem;
  label: string;
}) {
  const { fire, message, status } = useAdLibFire();
  const statusText = fireStatusText(status, message);
  // Each zone is one chosen action, so the action name always goes in the body.
  const onPress = useCallback(() => {
    fire(item.id, actionName);
  }, [actionName, fire, item.id]);
  return (
    <Pressable
      aria-busy={status === 'busy'}
      aria-label={`${item.title}, ${statusText ?? label}`}
      className={`${zoneClass(Boolean(danger), compact, status)} w-full bg-stage`}
      onPress={onPress}
    >
      {danger ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-0.5 bg-danger"
        />
      ) : null}
      <span className="relative font-mono text-[11px] uppercase tracking-[0.14em]">
        {statusText ?? label}
      </span>
    </Pressable>
  );
}
