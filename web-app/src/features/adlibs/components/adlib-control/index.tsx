import { SingleAdlib } from './single-adlib';
import { SplitAdlib } from './split-adlib';
import type { AdlibControlProps } from './types';

/** One adlib. Several actions become separate zones. A click posts the adlib. */
export const AdlibControl = (props: AdlibControlProps) =>
  props.item.actions.length > 1 ? (
    <SplitAdlib {...props} />
  ) : (
    <SingleAdlib {...props} />
  );
