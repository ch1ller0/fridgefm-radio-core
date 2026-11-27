import { createContainer, injectable } from '@fridgefm/inverter';
import { pathToMusic } from '../../../__tests__/test-utils.mock';
import { createConfig } from '../../config';
import { eventBusProvider } from '../../events/events.provider';
import { CONFIG_TOKEN } from '../../tokens';
import { trackProvider } from '../../track/track.provider';
import { PLAYLIST_TOKEN, playlistProvider } from '../playlist.provider';

const createPlaylist = () =>
  createContainer({
    providers: [
      injectable({ provide: CONFIG_TOKEN, useValue: createConfig({}) }),
      eventBusProvider,
      trackProvider,
      playlistProvider,
    ],
  }).get(PLAYLIST_TOKEN);

const getPlayCounts = (playlist: ReturnType<typeof createPlaylist>) => playlist.getList().map((t) => t.playCount);

describe('base/Playlist', () => {
  it.todo('test playlist interface (really big)');

  describe('play counts', () => {
    it('keeps play counts when a folder is added again', () => {
      const playlist = createPlaylist();
      playlist.addFolder(pathToMusic);
      playlist.getNext();

      const countsBefore = getPlayCounts(playlist);
      expect(countsBefore.reduce((sum, count) => sum + count, 0)).toEqual(1);

      playlist.addFolder(pathToMusic);

      expect(getPlayCounts(playlist)).toEqual(countsBefore);
    });

    it('keeps play counts when the playlist drains and restarts', () => {
      const playlist = createPlaylist();
      playlist.addFolder(pathToMusic);
      playlist.getNext();
      playlist.getNext();

      const countsBeforeRestart = getPlayCounts(playlist);
      // the third call drains the playlist, revalidates it and plays the first track again
      playlist.getNext();

      const [firstCount, ...restCounts] = countsBeforeRestart;
      expect(getPlayCounts(playlist)).toEqual([(firstCount as number) + 1, ...restCounts]);
    });
  });
});
