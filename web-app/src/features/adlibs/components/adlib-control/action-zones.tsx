import { ActionZone } from './action-zone';
import type { ControlItem } from './types';

/** One cell per action the gateway offers, using Sofie's own labels. */
export function ActionZones({
  compact,
  danger,
  item,
}: {
  compact: boolean;
  danger: boolean;
  item: ControlItem;
}) {
  return (
    <div
      className={
        compact
          ? 'grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-1'
          : 'grid grid-cols-2 gap-2'
      }
    >
      {item.actions.map((action) => (
        <ActionZone
          actionName={action.name}
          compact={compact}
          danger={danger}
          item={item}
          key={action.name}
          label={action.label}
        />
      ))}
    </div>
  );
}
