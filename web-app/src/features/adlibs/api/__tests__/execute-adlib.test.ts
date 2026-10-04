import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeAdLib } from '../execute-adlib';

const fetchMock =
  vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();

describe('executeAdLib', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the adlib id, and the chosen action when the tap picked one', async () => {
    vi.stubGlobal('window', globalThis);
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      executeAdLib({ adLibId: 'ad-1', playlistId: 'playlist-1' })
    ).resolves.toEqual({ kind: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1.0/playlists/playlist-1/execute-adlib',
      expect.objectContaining({
        body: JSON.stringify({ adLibId: 'ad-1' }),
        method: 'POST',
      })
    );

    await executeAdLib({
      actionType: 'take',
      adLibId: 'ad-1',
      playlistId: 'playlist-1',
    });
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/v1.0/playlists/playlist-1/execute-adlib',
      expect.objectContaining({
        body: JSON.stringify({ actionType: 'take', adLibId: 'ad-1' }),
      })
    );
  });

  it('turns 412 into not on air and every other failure into error', async () => {
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(new Response(null, { status: 412 }));

    await expect(
      executeAdLib({ adLibId: 'ad-1', playlistId: 'playlist-1' })
    ).resolves.toEqual({ kind: 'not-on-air' });

    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    await expect(
      executeAdLib({ adLibId: 'ad-1', playlistId: 'playlist-1' })
    ).resolves.toEqual({ kind: 'error' });
  });
});
