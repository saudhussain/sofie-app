import { ActionZone } from './action-zone';
import type { ControlItem } from './types';

/** One cell per action the gateway offers, using Sofie's own labels. */
export function ActionZones({
  danger,
  dense,
  item,
}: {
  danger: boolean;
  dense: boolean;
  item: ControlItem;
}) {
  return (
    <div
      className={
        dense
          ? 'grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-1'
          : 'grid grid-cols-2 gap-2'
      }
    >
      {item.actions.map((action) => (
        <ActionZone
          actionName={action.name}
          compact={dense}
          danger={danger}
          item={item}
          key={action.name}
          label={action.label}
        />
      ))}
    </div>
  );
}
