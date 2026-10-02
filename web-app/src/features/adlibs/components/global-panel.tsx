import { useMemo } from 'react';
import {
  EmptyLine,
  PanelShell,
  PanelSubheading,
} from '../../../shared/ui/panel-shell';
import { Pressable } from '../../../shared/ui/pressable';
import { blockedPanelMessage } from '../../live-status/connection-state';
import type { ConnectionState } from '../../live-status/types';
import { adaptAdLib } from '../model/adapter';
import {
  type GlobalSection,
  globalLayout,
  layoutGlobalAdLibs,
  needsHold,
  sectionCount,
} from '../model/global-layout';
import { AdlibControl } from './adlib-control';
import { DveRouting } from './dve-routing';

function CameraButton({ indexLabel }: { indexLabel: string }) {
  return (
    <Pressable className="min-h-12 border border-line bg-stage px-1 font-mono text-[11px] text-ink uppercase tracking-[0.08em] active:border-cue">
      {`Cam ${indexLabel}`}
    </Pressable>
  );
}

function ModeZone({
  action,
  title,
}: {
  action: { label: string; name: string };
  title: string;
}) {
  return (
    <Pressable
      aria-label={`${title}, ${action.label}`}
      className="min-h-12 border border-line bg-stage px-2 font-mono text-[11px] uppercase tracking-[0.12em] active:border-cue"
    >
      {action.label}
    </Pressable>
  );
}

function ModeControl({ item }: { item: ReturnType<typeof adaptAdLib> }) {
  const order = ['out', 'toggle', 'in'];
  const actions = [...item.actions].sort(
    (left, right) => order.indexOf(left.name) - order.indexOf(right.name)
  );
  return (
    <div className="flex flex-col gap-2">
      <p className="truncate text-sm">{item.title}</p>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <ModeZone action={action} key={action.name} title={item.title} />
        ))}
      </div>
    </div>
  );
}

function ButtonGroup({
  danger,
  items,
}: {
  danger: boolean;
  items: ReturnType<typeof adaptAdLib>[];
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2">
      {items.map((item) => (
        <AdlibControl
          danger={danger || needsHold(item)}
          hold={needsHold(item)}
          item={item}
          key={item.id}
        />
      ))}
    </div>
  );
}

function SectionBody({ section }: { section: GlobalSection }) {
  switch (section.kind) {
    case 'cameras':
      return (
        <div className="grid grid-cols-4 gap-2">
          {section.items.map((item) => (
            <CameraButton indexLabel={item.raw.name} key={item.id} />
          ))}
        </div>
      );
    case 'remotes':
      return (
        <div className="flex flex-col gap-3">
          {section.pairs.map((pair) => (
            <div
              className="grid grid-cols-1 gap-2 xl:grid-cols-2"
              key={pair.sound.id}
            >
              <AdlibControl
                compact
                hint={
                  pair.sound.raw.tags.includes(globalLayout.remotes.silentTag)
                    ? 'Video only'
                    : 'With sound'
                }
                item={pair.sound}
              />
              {pair.silent ? (
                <AdlibControl compact hint="Video only" item={pair.silent} />
              ) : null}
            </div>
          ))}
        </div>
      );
    case 'layouts':
      return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
          {section.items.map((item) => (
            <AdlibControl compact item={item} key={item.id} />
          ))}
        </div>
      );
    case 'routing':
      return <DveRouting modes={section.modes} />;
    case 'pairs':
      return (
        <div className="flex flex-col gap-3">
          {section.pairs.map((pair) => (
            <div key={pair.up.id}>
              <p className="mb-2 font-mono text-[11px] text-muted uppercase tracking-[0.14em]">
                {pair.label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <AdlibControl compact item={pair.up} />
                <AdlibControl compact item={pair.down} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'modes':
      return (
        <div className="flex flex-col gap-3">
          {section.items.map((item) => (
            <ModeControl item={item} key={item.id} />
          ))}
        </div>
      );
    case 'buttons':
      return <ButtonGroup danger={section.danger} items={section.items} />;
    default:
      return null;
  }
}

/** Rundown-wide controls. They stay up no matter which segment is selected. */
export const GlobalPanel = ({
  connection,
}: {
  connection: ConnectionState;
}) => {
  const blocked = blockedPanelMessage(connection);
  const globalAdLibs =
    connection.kind === 'connected' ? connection.globalAdLibs : [];
  const adapted = useMemo(
    () => globalAdLibs.map((adLib) => adaptAdLib(adLib)),
    [globalAdLibs]
  );
  const sections = useMemo(() => layoutGlobalAdLibs(adapted), [adapted]);
  const total = sections.reduce(
    (sum, section) => sum + sectionCount(section),
    0
  );

  return (
    <PanelShell
      count={blocked ? undefined : total}
      headingId="global-adlibs-heading"
      title="Global Adlibs"
    >
      {blocked ? (
        <EmptyLine message={blocked} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-4">
          {sections.length === 0 ? (
            <EmptyLine message="No global adlibs" />
          ) : (
            sections.map((section) => (
              <section
                className="mb-5"
                key={`${section.kind}-${section.title}`}
              >
                <PanelSubheading
                  count={sectionCount(section)}
                  title={section.title}
                />
                <SectionBody section={section} />
              </section>
            ))
          )}
        </div>
      )}
    </PanelShell>
  );
};
