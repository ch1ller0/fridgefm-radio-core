import { injectable } from '@fridgefm/inverter';
import { createList } from '../utils/fs';
import { captureTime } from '../utils/time';
import { createTrackMap } from '../base/Playlist/methods';
import { PUBLIC_EVENTS } from '../features/EventBus/events';
import { PLAYLIST_TOKEN, EVENT_BUS_TOKEN } from './tokens';

import type { TTrack } from '../base/Track/Track.types';
import type { InfoEvent } from '../features/EventBus/events';
import type { TrackMap, TrackList, ReorderCb, PathList, PlaylistElement } from '../base/Playlist/Playlist.types';

export const playlistProvider = injectable({
  provide: PLAYLIST_TOKEN,
  scope: 'singleton',
  useFactory: (eventBus) => {
    const folders: Set<string> = new Set();
    let currentIndex = -1;
    let tracksMap: TrackMap = new Map();
    let list: PathList = [];

    const emitInfo = (a: InfoEvent) => {
      eventBus.emit(PUBLIC_EVENTS.INFO, { name: 'playlist', ...a });
    };

    const revalidate = () => {
      const ct = captureTime();
      list = createList(Array.from(folders));
      tracksMap = createTrackMap(list);

      const result = publicPlaylist.getList();
      emitInfo({ event: 'revalidate', message: 'Playlist revalidated', timings: ct() });
      return result;
    };

    const publicPlaylist = {
      getList: (): TrackList =>
        list.map((v, i) => {
          const tra = tracksMap.get(v) as TTrack;

          return {
            ...tra,
            isPlaying: currentIndex === i,
          };
        }),
      getNext: (): PlaylistElement => {
        if (list.length - 1 === currentIndex) {
          // the playlist drained
          const ct = captureTime();
          revalidate();
          currentIndex = 0;
          eventBus.emit(PUBLIC_EVENTS.RESTART, publicPlaylist.getList(), ct());
        } else {
          currentIndex += 1;
        }
        const nextPath = list[currentIndex] as string;
        const nextTrack = tracksMap.get(nextPath);

        if (!nextTrack) {
          emitInfo({ level: 'warn', event: 'no-next-track', message: `No next track found for ${nextPath}` });
          // try next tracks
          return publicPlaylist.getNext();
        }
        nextTrack.playCount += 1;

        return { ...nextTrack, isPlaying: true };
      },
      addFolder: (folder: string) => {
        folders.add(folder);
        return revalidate();
      },
      reorder: (cb: ReorderCb) => {
        const ct = captureTime();
        const prevList = publicPlaylist.getList();
        const currentlyPlaying = prevList.find((v) => !!v.isPlaying);

        list = cb(prevList).map((b) => b.fsStats.fullPath);
        currentIndex = list.findIndex((v) => v === currentlyPlaying?.fsStats.fullPath);

        emitInfo({
          level: 'info',
          event: 'reorder',
          message: 'Playlist reordered',
          timings: ct(),
        });

        return publicPlaylist.getList();
      },
    };

    return publicPlaylist;
  },
  inject: [EVENT_BUS_TOKEN],
});
