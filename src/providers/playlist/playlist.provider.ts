import { createToken, injectable } from '@fridgefm/inverter';
import { createList } from '../../utils/fs';
import { extractLast } from '../../utils/funcs';
import Mp3 from '../../utils/mp3';
import { captureTime } from '../../utils/time';
import { EVENT_BUS_TOKEN, PUBLIC_EVENTS } from '../events/events.provider';
import type { InfoEvent } from '../events/events.types';
import { TRACK_FACTORY_TOKEN } from '../track/track.provider';
import type { TTrack } from '../track/track.types';
import type { PathList, PlaylistElement, ReorderCb, TPlaylist, TrackList, TrackMap } from './playlist.types';

export const PLAYLIST_TOKEN = createToken<TPlaylist>('playlist');

export const playlistProvider = injectable({
  provide: PLAYLIST_TOKEN,
  scope: 'singleton',
  useFactory: (createTrack, eventBus) => {
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
      tracksMap = list
        .filter((path) => {
          const f = extractLast(path, '/');

          return Mp3.isSupported(f[1]);
        })
        .reduce((acc, path) => {
          // deduplicate if already in map
          if (acc.has(path)) {
            return acc;
          }

          return acc.set(path, createTrack(path));
        }, new Map() as TrackMap);

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

        if (!currentlyPlaying) {
          return publicPlaylist.getList();
        }

        list = cb(prevList).map((b) => b.fsStats.fullPath);
        currentIndex = list.indexOf(currentlyPlaying?.fsStats.fullPath);

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
  inject: [TRACK_FACTORY_TOKEN, EVENT_BUS_TOKEN] as const,
});
