import * as EventEmitter from 'events';
import * as express from 'express';
import { TrackI } from '../types/Track.d';
import { noop } from '../utils/funcs';
import { logger } from '../utils/logger';
import { QueueStream } from './Queuestream';

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
  private queuestream: QueueStream;

  constructor() {
    super();
    this.queuestream = new QueueStream();
    this.queuestream.on('end', () => {
      this.queuestream.start();
      this.emit('restart');
    });

    // logging stuff
    this.queuestream.on('next', nextTrack => {
      const { fsStats: { stringified } } = nextTrack;
      logger(`Playing: ${stringified}`, 'g');
      this.emit('nextTrack', nextTrack);
    });
    this.queuestream.on('start', playlist => {
      playlist.forEach((track: TrackI) => {
        logger(`Scheduled: ${track.fsStats.stringified}`);
      });
    });
  }

  public start() {
    this.queuestream.start();
  }

  public connectListener(req: express.Request, res: express.Response, cb = noop) {
    const { currentPipe, getPrebuffer } = this.queuestream;

    res.writeHead(200, headers);

    res.write(getPrebuffer());
    currentPipe(res);
    cb();
  }

  public addFolder(folder: string) {
    this.queuestream.addFolder(folder);
  }
}
