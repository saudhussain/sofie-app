import type { ReactNode } from 'react';
import { PlaylistIdProvider } from '@/features/live-status/playlist-id';

/**
 * Every story sits on the touch-screen stage, with a playlist id so a tap
 * can leave idle. The id is local to the catalog. Nothing here is a rundown.
 */
export function Stage({ children }: { children: ReactNode }) {
  return (
    <PlaylistIdProvider playlistId="rundown-playlist">
      <div className="min-h-screen bg-stage p-6 text-ink">{children}</div>
    </PlaylistIdProvider>
  );
}

/** The width of one control in a panel column. */
export function CardFrame({ children }: { children: ReactNode }) {
  return <div className="w-80">{children}</div>;
}

/** A panel column. The wide frame is the part-adlib side of the board. */
export function PanelFrame({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={
        wide ? 'h-[40rem] w-full max-w-4xl' : 'h-[40rem] w-full max-w-md'
      }
    >
      {children}
    </div>
  );
}

/** Cancels the stage padding so a full board can use the viewport. */
export function FullBleed({ children }: { children: ReactNode }) {
  return <div className="-m-6 h-screen overflow-hidden">{children}</div>;
}
