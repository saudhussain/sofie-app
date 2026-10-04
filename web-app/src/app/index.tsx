import { GlobalPanel } from '@/features/adlibs/components/global-panel';
import { LocalPanel } from '@/features/adlibs/components/local-panel';
import { StatusBar } from '@/features/live-status/components/status-bar';
import { useLiveStatus } from '@/features/live-status/hooks/use-live-status';
import { PlaylistIdProvider } from '@/features/live-status/playlist-id';

/**
 * Landscape touch screen.
 * The wide column is the part adlibs for one segment. The narrow column is
 * every global adlib, and it does not change when a segment tab is selected.
 * Both columns read the same connection snapshot. A control tap posts that
 * adlib. A segment tab only changes what is drawn.
 */
export const App = () => {
  const connection = useLiveStatus();
  const playlistId =
    connection.kind === 'connected' ? connection.rundownPlaylistId : null;

  return (
    <PlaylistIdProvider playlistId={playlistId}>
      <main className="flex h-full flex-col gap-3 overflow-hidden p-4">
        <StatusBar connection={connection} />
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3">
          <LocalPanel connection={connection} />
          <GlobalPanel connection={connection} />
        </div>
      </main>
    </PlaylistIdProvider>
  );
};
