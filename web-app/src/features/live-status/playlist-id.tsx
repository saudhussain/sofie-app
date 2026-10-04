import { createContext, type ReactNode, useContext } from 'react';

/**
 * The active rundown's id, or null when none is on air.
 * `App` is the only subscriber to the live connection and publishes the id
 * here, so a button can post without subscribing to the gateway itself.
 * The value is a string, compared by content, so an `adLibs` push that keeps
 * the same rundown does not re-render the buttons.
 */
const PlaylistIdContext = createContext<string | null>(null);

export const PlaylistIdProvider = ({
  children,
  playlistId,
}: {
  children: ReactNode;
  playlistId: string | null;
}) => (
  <PlaylistIdContext.Provider value={playlistId}>
    {children}
  </PlaylistIdContext.Provider>
);

export const usePlaylistId = (): string | null => useContext(PlaylistIdContext);
