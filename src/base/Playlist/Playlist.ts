import { createList } from '../../utils/fs';
import { createTrackMap } from './methods';
import { captureTime } from '../../utils/time';
import { PUBLIC_EVENTS } from '../../features/EventBus/events';

import type {
  TPlaylist,
  TrackMap,
  TrackList,
  ReorderCb,
  PathList,
  PlaylistElement,
} from './Playlist.types';
import type { EventBus } from '../../features/EventBus/EventBus';
import type { InfoEvent } from '../../features/EventBus/events';
import type { TTrack } from '../Track/Track.types';

type Deps = { eventBus: EventBus };

export class Playlist implements TPlaylist {
  private _currentIndex = -1;

  private _list: PathList = [];

  private _tracksMap: TrackMap = new Map();

  private _folders: Set<string> = new Set();

  private _deps: Deps;

  private revalidate() {
    const ct = captureTime();
    this._list = createList(Array.from(this._folders));
    this._tracksMap = createTrackMap(this._list);

    const result = this.getList();
    this._emitInfo({ event: 'revalidate', message: 'Playlist revalidated', timings: ct() });
    return result;
  }

  private _emitInfo(a: InfoEvent) {
    this._deps.eventBus.emit(PUBLIC_EVENTS.INFO, { name: 'playlist', ...a });
  }

  constructor(deps: Deps) {
    this._deps = deps;
  }

  public addFolder(folder: string) {
    this._folders.add(folder);
    return this.revalidate();
  }

  public getNext(): PlaylistElement {
    if (this._list.length - 1 === this._currentIndex) { // the playlist drained
      const ct = captureTime();
      this.revalidate();
      this._currentIndex = 0;
      this._deps.eventBus.emit(PUBLIC_EVENTS.RESTART, this.getList(), ct());
    } else {
      this._currentIndex += 1;
    }
    const nextPath = this._list[this._currentIndex];
    const nextTrack = this._tracksMap.get(nextPath);

    if (!nextTrack) {
      this._emitInfo({ level: 'warn', event: 'no-next-track', message: `No next track found for ${nextPath}` });
      // try next tracks
      return this.getNext();
    }
    nextTrack.playCount += 1;

    return { ...nextTrack, isPlaying: true };
  }

  public reorder(cb: ReorderCb) {
    const ct = captureTime();
    const prevList = this.getList();
    const currentlyPlaying = prevList.find((v) => !!v.isPlaying);

    this._list = cb(prevList).map((b) => b.fsStats.fullPath);
    this._currentIndex = this._list.findIndex((v) => v === currentlyPlaying?.fsStats.fullPath);

    this._emitInfo({
      level: 'info',
      event: 'reorder',
      message: 'Playlist reordered',
      timings: ct(),
    });

    return this.getList();
  }

  public getList(): TrackList {
    return this._list.map((v, i) => {
      const tra = this._tracksMap.get(v) as TTrack;

      return {
        ...tra,
        isPlaying: this._currentIndex === i,
      };
    });
  }
}
