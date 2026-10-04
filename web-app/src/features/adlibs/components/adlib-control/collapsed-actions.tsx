import { type ToggleEvent, useCallback, useState } from 'react';
import { ActionZones } from './action-zones';
import type { ControlItem } from './types';

/**
 * The zones of an adlib with many actions. They are mounted only while the
 * disclosure is open: a closed `<details>` still renders its children, and
 * three routing adlibs would otherwise mount 168 buttons that post nothing
 * the operator can see.
 */
export function CollapsedActions({
  danger,
  item,
}: {
  danger: boolean;
  item: ControlItem;
}) {
  const [open, setOpen] = useState(false);
  const onToggle = useCallback((event: ToggleEvent<HTMLDetailsElement>) => {
    setOpen(event.currentTarget.open);
  }, []);
  return (
    <details onToggle={onToggle}>
      <summary className="cursor-pointer select-none py-1 font-mono text-[11px] text-cue uppercase tracking-[0.14em]">
        {item.actions.length} actions
      </summary>
      {open ? (
        <div className="pt-2">
          <ActionZones danger={danger} dense item={item} />
        </div>
      ) : null}
    </details>
  );
}
