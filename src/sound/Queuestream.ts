import * as devnull from 'dev-null';
import * as EventEmitter from 'events';
import { Readable, Transform, Writable } from 'stream';
import { logger } from '../utils/logger';
import { Playlist } from './Playlist';
import { Prebuffer } from './features/Prebuffer';

export class QueueStream {
  public playlist = new Playlist();

  // this stream is always live
  private current = new Transform({
    transform: (chunk, encoding, callback) => {
      this.prebuffer.modify(chunk);
      callback(undefined, chunk);
    },
  });

  private eventBus = new EventEmitter();

  // this stream switches on a each track
  private trackStream: Readable;

  // prebuffering for faster client response (side-effect)
  private prebuffer = new Prebuffer();

  private folders: string[] = [];

  constructor() {
    this.currentPipe(devnull(), { end: false });
    this.trackStream = new Readable();
  }

  public getPrebuffer = () => this.prebuffer.getStorage();

  public currentPipe = (wrstr: Writable, opts = {}) => this.current.pipe(wrstr, opts);

  public next = () => {
    const nextTrack = this.playlist.getNext();

    if (nextTrack) {
      // destroy previous track stream
      if (this.trackStream) {
        this.trackStream.destroy();
      }

      const newStream = nextTrack.getSound();
      newStream.once('error', (e: Error) => {
        logger('Queuestream:error', 'r');
        logger(e, 'r', false);
        this.eventBus.emit('error', e);
      });
      newStream.once('end', this.next);
      newStream.pipe(this.current, { end: false });
      this.trackStream = newStream;
      this.eventBus.emit('nextTrack', nextTrack);
      logger(`Queuestream:nextTrack "${nextTrack.fsStats.stringified}"`, 'g');
    } else {
      this.restart();
    }
  };

  public addFolder(folder: string) {
    this.folders = [...this.folders || [], folder];
    this.playlist.createPlaylist(folder);
  }

  public start() {
    logger('Queuestream:start', 'bb');
    this.eventBus.emit('start', this.playlist);
    this.next();
  }

  public on(event: string, listener: (...args: any[]) => void) {
    return this.eventBus.on(event, listener);
  }

  private restart = () => {
    logger('Queuestream:restart', 'bb');
    this.playlist = new Playlist();
    this.folders.forEach((folder) => {
      this.playlist.createPlaylist(folder);
    });
    this.eventBus.emit('restart', this.playlist);
    this.next();
  };
}
