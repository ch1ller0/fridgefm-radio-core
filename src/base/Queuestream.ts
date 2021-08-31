import * as devnull from 'dev-null';
import { Readable, Transform, Writable } from 'stream';
import { captureTime } from '../utils/time';
import { Prebuffer } from '../features/Prebuffer';
import { EventBus } from '../features/EventBus/EventBus';
import { PUBLIC_EVENTS } from '../features/EventBus/events';
import type { TPlaylist } from './Playlist/Playlist.types';

type Deps = {
  playlist: TPlaylist;
  eventBus: EventBus;
};

export class QueueStream {
  private _deps: Deps;

  // this stream is always live
  private _current = new Transform({
    transform: (chunk, encoding, callback) => {
      this._prebuffer.modify([chunk]);
      callback(undefined, chunk);
    },
  });

  // this stream switches on each track
  private _trackStream: Readable;

  // prebuffering for faster client response (side-effect)
  private _prebuffer = new Prebuffer();

  constructor(deps: Deps) {
    this._deps = deps;
    this.currentPipe(devnull(), { end: false });
    this._trackStream = new Readable();
  }

  private _handleError(error: Error, event: string) {
    this._deps.eventBus.emit(PUBLIC_EVENTS.ERROR, { name: 'queuestream', error, event });
    this.next();
  }

  public getPrebuffer = () => this._prebuffer.getStorage();

  public currentPipe = (wrstr: Writable, opts = {}) => this._current.pipe(wrstr, opts);

  public next = () => {
    const ct = captureTime();
    const { playlist, eventBus } = this._deps;
    const nextTrack = playlist.getNext();

    // destroy previous track stream if there was one
    this._trackStream?.destroy();

    // populate newly created stream with some handlers
    const [error, newStream] = nextTrack.getSound();
    if (error) {
      this._handleError(error, 'get-sound-error');
      return;
    }

    newStream.once('error', (e) => this._handleError(e, 'stream-error'));
    newStream.once('end', this.next);
    newStream.pipe(this._current, { end: false });

    this._trackStream = newStream;

    eventBus.emit(PUBLIC_EVENTS.NEXT_TRACK, nextTrack, ct());
  };
}
