import * as EventEmitter from 'events';
import * as express from 'express';
import { TrackArgs } from '../types/Track';
import { noop } from '../utils/funcs';
import { createHandler, Handlers } from '../utils/handlers';
import { logger } from '../utils/logger';
import { isMp3 } from '../utils/mp3';
import { shuffleArray } from '../utils/shuffle';
import { calculateScheduled, getHHMMSS } from '../utils/time';
import { QueueStream } from './Queuestream';
import { Track } from './Track';

// TODO add icy metaint
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

export class Station extends EventEmitter {
  private playlist: Track[];
  private queuestream: QueueStream;

  constructor(handlers: Handlers) {
    super();
    this.playlist = [];

    this.queuestream = new QueueStream({ maxListeners: 100 });
    this.queuestream.on('next', nextTrack => {
      const { fsStats: { stringified } } = nextTrack;
      logger(`Playing: ${stringified}`, 'g');
      this.emit('nextTrack', nextTrack);
    });
    this.queuestream.on('end', () => {
      this.start({ shuffle: true });
      this.emit('restart');
    });

    if (handlers) {
      createHandler(handlers);
    }
  }

  public start({ shuffle = false } = {}) {
    if (!this.playlist.length) {
      return;
    }

    if (shuffle) {
      this.playlist = shuffleArray(this.playlist);
    }

    logger('Playlist  schedule : trackname [size/duration]', 'r', false);
    this.playlist.forEach((track, i) => {
      const scheduled = getHHMMSS(calculateScheduled({ playlist: this.playlist }, i));
      logger(` ${scheduled} : ${track.fsStats.stringified}`);

      this.queuestream.queue(track);
    });
    this.queuestream.next();
  }

  public connectListener(req: express.Request, res: express.Response, cb = noop) {
    const { current, getPrebuffer } = this.queuestream;

    res.writeHead(200, headers);

    res.write(getPrebuffer());
    current.pipe(res);
    cb();
  }

  public addTrack({ path, name }: TrackArgs) {
    if (!isMp3(name)) {
      return;
    }

    const fullPath = `${path}/${name}`;
    const track = new Track({
      name,
      path: fullPath,
    });

    this.playlist.push(track);
  }
}
