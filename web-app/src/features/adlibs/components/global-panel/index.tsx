import { useMemo } from 'react';
import { blockedPanelMessage } from '@/features/live-status/connection-state';
import type { ConnectionState } from '@/features/live-status/types';
import {
  EmptyLine,
  PanelShell,
  PanelSubheading,
} from '@/shared/ui/panel-shell';
import { adaptAdLib } from '../../model/adapter';
import { groupGlobalAdLibs, isDangerAdLib } from '../../model/group-globals';
import { AdlibControl } from '../adlib-control';

/**
 * Rundown-wide controls. They stay up no matter which segment is selected.
 * One section per source layer, so an adlib from a layer this board has
 * never seen still gets a heading and a button.
 * A blocked connection replaces the list. Buttons from the last good
 * message are not kept.
 */
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
  const sections = useMemo(() => groupGlobalAdLibs(adapted), [adapted]);

  return (
    <PanelShell
      count={blocked ? undefined : adapted.length}
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
              <section className="mb-5" key={section.title}>
                <PanelSubheading
                  count={section.items.length}
                  title={section.title}
                />
                {/* `items-start` so expanding one adlib's actions does not
                    stretch the other cards in its row. */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] items-start gap-2">
                  {section.items.map((item) => (
                    <AdlibControl
                      danger={isDangerAdLib(item)}
                      item={item}
                      key={item.id}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}
    </PanelShell>
  );
};
