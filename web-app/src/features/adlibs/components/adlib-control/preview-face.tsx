import { Face } from './face';
import type { ControlItem } from './types';

/** Non-pressable header of a split control. The zones underneath post. */
export function PreviewFace({ item }: { item: ControlItem }) {
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
