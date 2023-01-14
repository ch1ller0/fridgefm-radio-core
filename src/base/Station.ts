import { createEventBus, EventBus } from '../features/EventBus/EventBus';
import { PUBLIC_EVENTS } from '../features/EventBus/events';
import { captureTime } from '../utils/time';
import { mergeConfig, Config } from '../config/index';
import { createPlaylist } from './Playlist/Playlist';
import { QueueStream } from './Queuestream';

import type { ClientRequest, ServerResponse } from 'http';
import type { TStation } from '../types/public';
import type { TEmitter } from '../features/EventBus/events';
import type { TPlaylist, ReorderCb } from './Playlist/Playlist.types';

interface StationDeps {
  queuestream: QueueStream;
  eventBus: EventBus;
  playlist: TPlaylist;
  config: Config;
}

export class Station implements TStation {
  private _deps: StationDeps;

  constructor(extConfig?: Partial<Config>) {
    const config = mergeConfig(extConfig || {});
    const eventBus = createEventBus({ config });
    const playlist = createPlaylist({ eventBus });
    const queuestream = new QueueStream({ playlist, eventBus });

    this._deps = {
      playlist,
      eventBus,
      queuestream,
      config,
    };
  }

  public start() {
    const ct = captureTime();
    const { eventBus, queuestream } = this._deps;

    if (this.getPlaylist().length) {
      queuestream.next();
    }

    eventBus.emit(PUBLIC_EVENTS.START, this.getPlaylist(), ct());
  }

  public togglePause(): void {}

  public addFolder(folder: string) {
    return this._deps.playlist.addFolder(folder);
  }

  public next() {
    return this._deps.queuestream.next();
  }

  public getPlaylist() {
    return this._deps.playlist.getList();
  }

  public connectListener(_: ClientRequest, res: ServerResponse, cb = () => {}) {
    const { currentPipe, getPrebuffer } = this._deps.queuestream;

    res.writeHead(200, this._deps.config.responseHeaders);
    res.write(getPrebuffer());
    currentPipe(res);
    cb();
  }

  public reorderPlaylist(cb: ReorderCb) {
    return this._deps.playlist.reorder(cb);
  }

  public on: TEmitter['on'] = (...args) => this._deps.eventBus.on(...args);
}
