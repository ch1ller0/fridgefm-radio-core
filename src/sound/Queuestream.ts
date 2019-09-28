import * as devnull from 'dev-null';
import * as EventEmitter from 'events';
import { Transform, Writable } from 'stream';
import { TrackI } from '../types/Track.d';
import { logger } from '../utils/logger';
import { createPlaylist } from './methods/playlist';
import { Prebuffer } from './Prebuffer';

export class QueueStream extends EventEmitter {
  private current: Transform;
  private prebuffer: Prebuffer;
  private playlist: TrackI[];

  constructor() {
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
    this.currentPipe(devnull(), { end: false });

    // set defaults
    this.playlist = [];
  }

  public getPrebuffer = () => this.prebuffer.getStorage();

  public currentPipe = (wrstr: Writable, opts = {}) => this.current.pipe(wrstr, opts);

  public next = () => {
    const nextTrack = this.playlist.shift();

    if (nextTrack) {
      this.emit('next', nextTrack);

      const trackStream = nextTrack.getSound();
      trackStream.once('error', (e: Error) => {
        logger(e, 'r');
        this.emit('error');
      });
      trackStream.once('end', this.next);
      trackStream.pipe(this.current, { end: false });
    } else {
      this.emit('end');
    }
  }

  public addFolder(folder: string) {
    this.playlist = createPlaylist(folder);
  }

  public start() {
    this.emit('start', this.playlist);
    this.next();
  }

  // public rearrange() {

  // }

  // TODO Standard Stream Methods
  // private pause() {}

  // private error() {}

  // private resume() {}
}
