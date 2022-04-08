import { Readable, Transform, Writable } from 'stream';
import { injectable, createToken } from '@fridgefm/inverter';
import devnull from 'dev-null';
import { captureTime } from '../../utils/time';
import { PUBLIC_EVENTS, EVENT_BUS_TOKEN } from '../events/events.provider';
import { PREBUFFER_TOKEN } from '../prebuffer/prebuffer.provider';
import { PLAYLIST_TOKEN } from '../playlist/playlist.provider';
import type { Queuestream } from './queuestream.types';

export const QUEUESTREAM_TOKEN = createToken<Queuestream>('queuestream');

export const queuestreamProvider = injectable({
  provide: QUEUESTREAM_TOKEN,
  scope: 'singleton',
  useFactory: (eventBus, playlist, prebuffer) => {
    let trackStream = new Readable();
    const currentStream = new Transform({
      transform: (chunk, _, callback) => {
        prebuffer.modify([chunk]);
        callback(undefined, chunk);
      },
    });

    const handleError = (error: Error, event: string) => {
      eventBus.emit(PUBLIC_EVENTS.ERROR, {
        name: 'queuestream',
        error,
        event,
      });
      publicQueuestream.next();
    };

    const publicQueuestream = {
      getPrebuffer: () => prebuffer.getStorage(),
      currentPipe: (wrstr: Writable, opts?: { end?: boolean }) => currentStream.pipe(wrstr, opts),
      next: () => {
        const ct = captureTime();
        const nextTrack = playlist.getNext();

        // destroy previous track stream if there was one
        trackStream?.destroy();

        // populate newly created stream with some handlers
        const [error, newStream] = nextTrack.getSound();
        if (error) {
          handleError(error, 'get-sound-error');
          return;
        }

        newStream.once('error', (e) => handleError(e, 'stream-error'));
        newStream.once('end', publicQueuestream.next);
        newStream.pipe(currentStream, { end: false });

        trackStream = newStream;

        eventBus.emit(PUBLIC_EVENTS.NEXT_TRACK, nextTrack, ct());
      },
    };

    publicQueuestream.currentPipe(devnull(), { end: false });

    return publicQueuestream;
  },
  inject: [EVENT_BUS_TOKEN, PLAYLIST_TOKEN, PREBUFFER_TOKEN] as const,
});
