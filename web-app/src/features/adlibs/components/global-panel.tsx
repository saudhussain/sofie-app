import { useCallback, useMemo } from 'react';
import { blockedPanelMessage } from '@/features/live-status/connection-state';
import type { ConnectionState } from '@/features/live-status/types';
import {
  EmptyLine,
  PanelShell,
  PanelSubheading,
} from '@/shared/ui/panel-shell';
import { Pressable } from '@/shared/ui/pressable';
import {
  fireFrameClass,
  fireStatusText,
  useAdLibFire,
} from '../hooks/use-adlib-fire';
import { adaptAdLib } from '../model/adapter';
import {
  type GlobalSection,
  globalLayout,
  layoutGlobalAdLibs,
  sectionCount,
} from '../model/global-layout';
import { AdlibControl } from './adlib-control';
import { DveRouting } from './dve-routing';

function CameraButton({ item }: { item: ReturnType<typeof adaptAdLib> }) {
  const { fire, message, status } = useAdLibFire();
  const statusText = fireStatusText(status, message);
  const [action] = item.actions;
  // A camera's only action is the choice. With none, the body is the id alone.
  const actionType = item.actions.length === 1 ? action?.name : undefined;
  const onFire = useCallback(() => {
    fire(item.id, actionType);
  }, [actionType, fire, item.id]);

  return (
    <Pressable
      aria-busy={status === 'busy'}
      aria-live={statusText ? 'polite' : undefined}
      className={`min-h-12 truncate border bg-stage px-1 font-mono text-[11px] uppercase tracking-[0.08em] ${fireFrameClass(status) ?? 'border-line text-ink active:border-cue'}`}
      onFire={onFire}
    >
      {statusText ?? `Cam ${item.raw.name}`}
    </Pressable>
  );
}

function ModeZone({
  action,
  itemId,
  title,
}: {
  action: { label: string; name: string };
  itemId: string;
  title: string;
}) {
  const { fire, message, status } = useAdLibFire();
  const statusText = fireStatusText(status, message);
  // Each zone is one chosen action, so the action name always goes in the body.
  const onFire = useCallback(() => {
    fire(itemId, action.name);
  }, [action.name, fire, itemId]);

  return (
    <Pressable
      aria-busy={status === 'busy'}
      aria-label={`${title}, ${statusText ?? action.label}`}
      aria-live={statusText ? 'polite' : undefined}
      className={`min-h-12 truncate border bg-stage px-2 font-mono text-[11px] uppercase tracking-[0.12em] ${fireFrameClass(status) ?? 'border-line text-ink active:border-cue'}`}
      onFire={onFire}
    >
      {statusText ?? action.label}
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
          <ModeZone
            action={action}
            itemId={item.id}
            key={action.name}
            title={item.title}
          />
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
        <AdlibControl danger={danger} item={item} key={item.id} />
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
            <CameraButton item={item} key={item.id} />
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
