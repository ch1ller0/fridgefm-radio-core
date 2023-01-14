import { createList } from '../../utils/fs';
import { captureTime } from '../../utils/time';
import { PUBLIC_EVENTS } from '../../features/EventBus/events';
import { createTrackMap } from './methods';

import type { TPlaylist, TrackMap, ReorderCb, PathList } from './Playlist.types';
import type { EventBus } from '../../features/EventBus/EventBus';
import type { InfoEvent } from '../../features/EventBus/events';
import type { TTrack } from '../Track/Track.types';

type Deps = { eventBus: EventBus };

export const createPlaylist = (deps: Deps) => {
  const folders = new Set<string>();
  const emitInfo = (a: InfoEvent) => deps.eventBus.emit(PUBLIC_EVENTS.INFO, { name: 'playlist', ...a });

  let currentIndex = -1;
  let list: PathList = [];
  let tracksMap: TrackMap = new Map();

  const instance: TPlaylist = {
    addFolder: (folder: string) => {
      folders.add(folder);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return revalidate();
    },
    getList: () => {
      return list.map((v, i) => {
        const tra = tracksMap.get(v) as TTrack;

        return {
          ...tra,
          isPlaying: currentIndex === i,
        };
      });
    },
    reorder: (cb: ReorderCb) => {
      const ct = captureTime();
      const prevList = instance.getList();
      const currentlyPlaying = prevList.find((v) => !!v.isPlaying);

      list = cb(prevList).map((b) => b.fsStats.fullPath);
      currentIndex = list.findIndex((v) => v === currentlyPlaying?.fsStats.fullPath);

      emitInfo({
        level: 'info',
        event: 'reorder',
        message: 'Playlist reordered',
        timings: ct(),
      });

      return instance.getList();
    },
    getNext: () => {
      if (list.length - 1 === currentIndex) {
        // the playlist drained
        const ct = captureTime();
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        revalidate();
        currentIndex = 0;
        deps.eventBus.emit(PUBLIC_EVENTS.RESTART, instance.getList(), ct());
      } else {
        currentIndex += 1;
      }
      const nextPath = list[currentIndex] as string;
      const nextTrack = tracksMap.get(nextPath);

      if (!nextTrack) {
        emitInfo({ level: 'warn', event: 'no-next-track', message: `No next track found for ${nextPath}` });
        // try next tracks
        return instance.getNext();
      }
      nextTrack.playCount += 1;

      return { ...nextTrack, isPlaying: true };
    },
  };

  const revalidate = () => {
    const ct = captureTime();
    list = createList(Array.from(folders));
    tracksMap = createTrackMap(list);

    const result = instance.getList();
    emitInfo({ event: 'revalidate', message: 'Playlist revalidated', timings: ct() });
    return result;
  };

  return instance;
};
