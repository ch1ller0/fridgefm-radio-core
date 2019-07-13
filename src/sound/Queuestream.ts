import * as devnull from 'dev-null';
import * as EventEmitter from 'events';
import { Stream, Transform } from 'stream';
import { logger } from '../utils/logger';
import { Prebuffer } from './Prebuffer';
import { Track } from './Track';

type QueueStreamArgs = {
  maxListeners: number;
};

export class QueueStream extends EventEmitter {
  private current: Stream;
  private prebuffer: Prebuffer;
  private tracks: Track[];

  constructor({ maxListeners }: QueueStreamArgs) {
    super();
    this.prebuffer = new Prebuffer();
    this.current = new Transform({
      transform: (chunk, encoding, callback) => {
        // prebuffering for faster client response (side-effect)
        this.prebuffer.modify(chunk);
        // do not modify chunks
        callback(undefined, chunk);
      },
    });
    this.current.setMaxListeners(maxListeners);

    // set defaults
    this.tracks = [];
    this.current.pipe(devnull(), { end: false });
    this.getPrebuffer = this.getPrebuffer.bind(this);
    this.getCurrent = this.getCurrent.bind(this);
  }

  public queue(track: Track) {
    this.tracks.push(track);
  }

  public next() {
    if (this.tracks.length > 0) {
      const nextTrack = this.tracks.shift();
      this.emit('next', nextTrack);

      const trackStream = nextTrack && nextTrack.getSound();
      trackStream.once('error', (e: Error) => {
        logger(e, 'r');
      });
      trackStream.once('end', () => {
        this.next();
      });
      trackStream.pipe(this.current, { end: false });
    } else {
      this.emit('end');
    }
  }

  public getCurrent() {
    return this.current;
  }

  public getPrebuffer() {
    return this.prebuffer.getStorage();
  }

  // TODO Standard Stream Methods
  // private pause() {}

  // private error() {}

  // private resume() {}
}
