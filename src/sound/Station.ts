import * as EventEmitter from 'events';
import type { Response, Request } from 'express';
import { noop } from '../utils/funcs';
import { logger } from '../utils/logger';
import { QueueStream } from './Queuestream';
import type { StationI } from '../types/public.h';
import type { SortAlg } from '../types/Playlist.h';

// TODO add icy metaint https://github.com/Kefir100/radio-ch1ller/issues/16
const headers = {
  'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=0',
  'Content-Type': 'audio/mpeg',
  'icy-br': '56',
  'icy-genre': 'house',
  'icy-metaint': '0',
  'icy-name': '@kefir100/radio-engine',
  'icy-notice1': 'Live radio powered by https://www.npmjs.com/package/@kefir100/radio-engine',
  'icy-pub': '0',
  'icy-url': 'https://',
};

// events that should be hoisted up to the station from queuestream
const EXPOSED_EVENTS = ['start', 'restart'];

export class Station extends EventEmitter implements StationI {
  private _queuestream: QueueStream;

  constructor() {
    super();
    this._queuestream = new QueueStream();
    // logging stuff
    this._queuestream.on('next', (nextTrack) => {
      const { fsStats: { stringified } } = nextTrack;
      logger(`Playing: ${stringified}`, 'g');
      this.emit('nextTrack', nextTrack);
    });
    EXPOSED_EVENTS.forEach((e) => {
      this._queuestream.on(e, () => this.emit(e));
    });
    this._queuestream.on('error', () => {
      // capture the error
    });
  }

  public start() {
    this._queuestream.start();
  }

  public addFolder(folder: string) {
    this._queuestream.addFolder(folder);
  }

  public next() {
    this._queuestream.next();
  }

  public getPlaylist() {
    return this._queuestream.playlist.getList();
  }

  public shufflePlaylist(arg: SortAlg) {
    this._queuestream.playlist.shuffle(arg);
  }

  public rearrangePlaylist(from: number, to: number) {
    return this._queuestream.playlist.rearrange(from, to);
  }

  public connectListener(req: Request, res: Response, cb = noop) {
    const { currentPipe, getPrebuffer } = this._queuestream;

    res.writeHead(200, headers);
    res.write(getPrebuffer());
    currentPipe(res);
    cb();
  }
}
