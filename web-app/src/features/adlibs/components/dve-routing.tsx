import { useCallback, useState } from 'react';
import { Chip } from '@/shared/ui/pressable';
import { globalLayout, type RoutingModes } from '../model/global-layout';
import type { AdaptedAdLib } from '../types';

const IPS = [1, 2, 3, 4] as const;
const CAMERAS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const REMOTES = [1, 2, 3, 4, 5, 6] as const;

/** `ip2 camera,3` and `ip2 remote,3`, matching the gateway action names. */
const routingActionName = (
  ip: number,
  kind: 'camera' | 'remote',
  source: number
): string => `ip${ip} ${kind},${source}`;

function ModeChip({
  disabled,
  label,
  onSelect,
  pressed,
  tag,
}: {
  disabled?: boolean;
  label: string;
  onSelect: (tag: (typeof globalLayout.dveModes)[number]['tag']) => void;
  pressed: boolean;
  tag: (typeof globalLayout.dveModes)[number]['tag'];
}) {
  const select = useCallback(() => {
    onSelect(tag);
  }, [onSelect, tag]);
  return (
    <Chip disabled={disabled} label={label} onFire={select} pressed={pressed} />
  );
}

function IpChip({
  onSelect,
  pressed,
  value,
}: {
  onSelect: (value: (typeof IPS)[number]) => void;
  pressed: boolean;
  value: (typeof IPS)[number];
}) {
  const select = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);
  return <Chip label={`IP ${value}`} onFire={select} pressed={pressed} />;
}

/**
 * A source cell is enabled only when the selected mode's item lists that
 * exact action name. Taps do not call Sofie yet.
 */
function SourceGrid({
  ip,
  item,
  kind,
  label,
  sources,
}: {
  ip: number;
  item: AdaptedAdLib | undefined;
  kind: 'camera' | 'remote';
  label: string;
  sources: readonly number[];
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sources.map((source) => {
        const actionName = routingActionName(ip, kind, source);
        const known = item
          ? item.actions.some((action) => action.name === actionName)
          : false;
        return (
          <Chip
            disabled={!known}
            key={actionName}
            label={`${label} ${source}`}
          />
        );
      })}
    </div>
  );
}

/** One control for the three dve-routing adlibs. Modes are chosen by tag, never by id. */
export const DveRouting = ({ modes }: { modes: RoutingModes }) => {
  const available = globalLayout.dveModes.filter((mode) => modes[mode.tag]);
  const [modeTag, setModeTag] = useState(available[0]?.tag ?? 'auto');
  const [ip, setIp] = useState<(typeof IPS)[number]>(1);
  const selected = available.some((mode) => mode.tag === modeTag)
    ? modeTag
    : (available[0]?.tag ?? 'auto');
  const item = modes[selected];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {globalLayout.dveModes.map((mode) => (
          <ModeChip
            disabled={!modes[mode.tag]}
            key={mode.tag}
            label={mode.label}
            onSelect={setModeTag}
            pressed={selected === mode.tag}
            tag={mode.tag}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {IPS.map((value) => (
          <IpChip
            key={value}
            onSelect={setIp}
            pressed={ip === value}
            value={value}
          />
        ))}
      </div>
      <SourceGrid
        ip={ip}
        item={item}
        kind="camera"
        label="KAM"
        sources={CAMERAS}
      />
      <SourceGrid
        ip={ip}
        item={item}
        kind="remote"
        label="BM"
        sources={REMOTES}
      />
    </div>
  );
};
