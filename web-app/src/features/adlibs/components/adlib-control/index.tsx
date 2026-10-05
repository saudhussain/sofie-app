import { SingleAdLib } from './single-adlib';
import { SplitAdLib } from './split-adlib';
import type { AdLibControlProps } from './types';

/** One adlib. Several actions become separate zones. A click posts the adlib. */
export const AdLibControl = (props: AdLibControlProps) =>
  props.item.actions.length > 1 ? (
    <SplitAdLib {...props} />
  ) : (
    <SingleAdLib {...props} />
  );
