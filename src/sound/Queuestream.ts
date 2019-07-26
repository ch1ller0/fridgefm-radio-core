import * as devnull from 'dev-null';
import * as EventEmitter from 'events';
import { Transform } from 'stream';
import { logger } from '../utils/logger';
import { Prebuffer } from './Prebuffer';
import { Track } from './Track';

type QueueStreamArgs = {
  maxListeners: number;
};

export class QueueStream extends EventEmitter {
  public current: Transform;
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
  }

  public queue(track: Track) {
    this.tracks.push(track);
  }

  public next = () => {
    const nextTrack = this.tracks.shift();

    if (nextTrack) {
      this.emit('next', nextTrack);

      const trackStream = nextTrack.getSound();
      trackStream.once('error', (e: Error) => {
        logger(e, 'r');
        this.next();
      });
      trackStream.once('end', this.next);
      trackStream.pipe(this.current, { end: false });
    } else {
      this.emit('end');
    }
  }

  public getPrebuffer = () => this.prebuffer.getStorage();

  // TODO Standard Stream Methods
  // private pause() {}

  // private error() {}

  // private resume() {}
}
