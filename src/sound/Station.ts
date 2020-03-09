import * as EventEmitter from 'events';
import type { Response, Request } from 'express';
import { noop } from '../utils/funcs';
import { QueueStream } from './Queuestream';
import { responseHeaders } from './defaults/responseHeaders';
import type { StationI } from '../types/public.h';
import type { SortAlg, TrackList } from '../types/Playlist.h';
import type { TrackI } from '../types/Track.h';

// events that should be hoisted up to the station from queuestream
const EXPOSED_EVENTS = ['start', 'restart', 'error', 'nextTrack'];

export class Station implements StationI {
  private _queuestream: QueueStream;

  private _eventBus: EventEmitter;

  constructor() {
    this._eventBus = new EventEmitter();
    this._queuestream = new QueueStream();
    EXPOSED_EVENTS.forEach((event) => {
      this._queuestream.on(event, (...args) => this._eventBus.emit(event, ...args));
    });
  }

  public start() {
    if (this.getPlaylist().length) {
      this._queuestream.start();
    }
  }

  public addFolder(folder: string) {
    return this._queuestream.addFolder(folder);
  }

  public next() {
    return this._queuestream.next();
  }

  public getPlaylist() {
    return this._queuestream.playlist.getList();
  }

  public shufflePlaylist(arg?: SortAlg) {
    return this._queuestream.playlist.shuffle(arg);
  }

  public rearrangePlaylist(from: number, to: number) {
    return this._queuestream.playlist.rearrange(from, to);
  }

  public connectListener(req: Request, res: Response, cb = noop) {
    const { currentPipe, getPrebuffer } = this._queuestream;

    res.writeHead(200, responseHeaders);
    res.write(getPrebuffer());
    currentPipe(res);
    cb();
  }

  public on(event: 'start', listener: (pl: TrackList) => void): void

  public on(event: 'restart', listener: () => void): void

  public on(event: 'nextTrack', listener: (nextTrack: TrackI) => void): void;

  public on(event: 'error', listener: (err: Error) => void): void;

  public on(event: string, listener: (...args: any[]) => void) {
    this._eventBus.on(event, listener);
  }
}
