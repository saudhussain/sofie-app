import { GlobalPanel } from '../features/adlibs/components/global-panel';
import { LocalPanel } from '../features/adlibs/components/local-panel';
import { StatusBar } from '../features/live-status/components/status-bar';
import { useLiveStatus } from '../features/live-status/hooks/use-live-status';

/**
 * Landscape touch screen. Part adlibs take the wide column.
 * Global controls stay in the narrow column for the whole rundown.
 * Both panels read lists from the same connection. Taps do not call Sofie yet.
 */
export const App = () => {
  const connection = useLiveStatus();

  return (
    <main className="flex h-full flex-col gap-3 overflow-hidden p-4">
      <StatusBar connection={connection} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3">
        <LocalPanel connection={connection} />
        <GlobalPanel connection={connection} />
      </div>
    </main>
  );
};
