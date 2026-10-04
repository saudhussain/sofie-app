import { useEffect, useMemo, useState } from 'react';
import { blockedPanelMessage } from '@/features/live-status/connection-state';
import type { ConnectionState } from '@/features/live-status/types';
import {
  EmptyLine,
  PanelShell,
  PanelSubheading,
} from '@/shared/ui/panel-shell';
import { adaptAdLib } from '../model/adapter';
import {
  buildSegmentStrip,
  groupByLayer,
  groupSegments,
} from '../model/segments';
import { AdlibControl } from './adlib-control';
import { SegmentStrip } from './segment-strip';

/**
 * The wide column: part adlibs, one segment at a time.
 * Tabs follow rundown order. `pinnedId` is a tab the operator opened. It is
 * cleared when Sofie changes the on-air segment, so the board follows a Take
 * unless the operator has picked a tab since that Take. Only the selected
 * segment's buttons are rendered, grouped by source layer.
 */
export const LocalPanel = ({ connection }: { connection: ConnectionState }) => {
  const blocked = blockedPanelMessage(connection);
  const adLibs = connection.kind === 'connected' ? connection.adLibs : [];
  const currentSegmentId =
    connection.kind === 'connected' ? connection.currentSegmentId : null;
  const nextSegmentId =
    connection.kind === 'connected' ? connection.nextSegmentId : null;
  const adapted = useMemo(
    () => adLibs.map((adLib) => adaptAdLib(adLib)),
    [adLibs]
  );
  const segments = useMemo(() => groupSegments(adapted), [adapted]);
  const strip = useMemo(
    () => buildSegmentStrip(segments, currentSegmentId, nextSegmentId),
    [currentSegmentId, nextSegmentId, segments]
  );
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // A manual tab stays until Sofie moves the on-air segment. Then follow it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentSegmentId is the reset trigger
  useEffect(() => {
    setPinnedId(null);
  }, [currentSegmentId]);

  // No pin means the on-air segment, or the first segment when that is unknown.
  const selectedId = pinnedId ?? strip.defaultSegmentId;
  const selected =
    segments.find((segment) => segment.id === selectedId)?.items ?? [];
  const layers = useMemo(() => groupByLayer(selected), [selected]);

  return (
    <PanelShell headingId="adlibs-heading" title="Adlibs">
      {blocked ? (
        <EmptyLine message={blocked} />
      ) : (
        <>
          {/* The playlist never named an on-air segment, so every tab is manual. */}
          {strip.currentKnown ? null : (
            <p className="px-5 pt-3 font-mono text-[11px] text-standby uppercase tracking-[0.14em]">
              Current segment is unknown.
            </p>
          )}
          <SegmentStrip
            onSelect={setPinnedId}
            selectedId={selectedId}
            tabs={strip.tabs}
          />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
            {layers.length === 0 ? (
              <EmptyLine message="No adlibs in this segment" />
            ) : (
              layers.map((layer) => (
                <section className="mb-4" key={layer.group}>
                  <PanelSubheading
                    count={layer.items.length}
                    title={layer.group}
                  />
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2">
                    {layer.items.map((item) => (
                      <AdlibControl item={item} key={item.id} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </>
      )}
    </PanelShell>
  );
};
