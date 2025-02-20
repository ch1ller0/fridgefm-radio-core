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
        // don't swtich to next track if the stream is on pause
        if (trackStream.isPaused()) {
          return;
        }
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
      togglePause: (shouldBePaused) => {
        const applyPause = () => {
          const isPaused = trackStream.isPaused();

          if ((typeof shouldBePaused === 'undefined' && !isPaused) || (shouldBePaused === true && !isPaused)) {
            trackStream.pause();
            return !isPaused;
          }
          if ((typeof shouldBePaused === 'undefined' && isPaused) || (shouldBePaused === false && isPaused)) {
            trackStream.resume();
            return !isPaused;
          }
          return isPaused;
        };

        const newIsPaused = applyPause();
        eventBus.emit(PUBLIC_EVENTS.PAUSE, newIsPaused);

        return newIsPaused;
      },
    } satisfies Queuestream;

    publicQueuestream.currentPipe(devnull(), { end: false });

    return publicQueuestream;
  },
  inject: [EVENT_BUS_TOKEN, PLAYLIST_TOKEN, PREBUFFER_TOKEN] as const,
});
