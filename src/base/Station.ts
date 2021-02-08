import { noop } from 'lodash';
import type { Response, Request } from 'express';
import { QueueStream } from './Queuestream';
import { responseHeaders } from '../config/responseHeaders';
import { Playlist } from './Playlist/Playlist';
import { EventBus } from '../features/EventBus/EventBus';
import { PUBLIC_EVENTS } from '../features/EventBus/events';
import { captureTime } from '../utils/time';
import { defaultConfig } from '../config/index';

import type { StationI } from '../types/public.h';
import type { Emitter } from '../features/EventBus/events';
import type { PlaylistI, ReorderCb } from './Playlist/Playlist.types';

interface StationDeps {
  queuestream: QueueStream,
  eventBus: EventBus,
  playlist: PlaylistI
}

export class Station implements StationI {
  private _deps: StationDeps;

  constructor(config = defaultConfig) {
    const eventBus = new EventBus({ config });
    const playlist = new Playlist({
      eventBus,
    });
    const queuestream = new QueueStream({
      playlist,
      eventBus,
    });

    this._deps = {
      playlist,
      eventBus,
      queuestream,
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

  public addFolder(folder: string) {
    return this._deps.playlist.addFolder(folder);
  }

  public next() {
    return this._deps.queuestream.next();
  }

  public getPlaylist() {
    return this._deps.playlist.getList();
  }

  public connectListener(req: Request, res: Response, cb = noop) {
    const { currentPipe, getPrebuffer } = this._deps.queuestream;

    res.writeHead(200, responseHeaders);
    res.write(getPrebuffer());
    currentPipe(res);
    cb();
  }

  public reorderPlaylist(cb: ReorderCb) {
    return this._deps.playlist.reorder(cb);
  }

  public on: Emitter['on'] = (...args) => this._deps.eventBus.on(...args);
}
