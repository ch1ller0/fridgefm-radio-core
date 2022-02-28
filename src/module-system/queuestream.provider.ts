import { Readable, Transform, Writable } from 'stream';
import { injectable } from '@fridgefm/inverter';
import devnull from 'dev-null';
import { captureTime } from '../utils/time';
import { PUBLIC_EVENTS } from '../features/EventBus/events';
import { QUEUESTREAM_TOKEN, EVENT_BUS_TOKEN, PLAYLIST_TOKEN, PREBUFFER_TOKEN, CONFIG_TOKEN } from './tokens';

export const prebufferProvider = injectable({
  provide: PREBUFFER_TOKEN,
  scope: 'scoped',
  useFactory: (config) => {
    const { prebufferLength } = config;
    const storage: Buffer[] = [];

    return {
      modify: (chunks) => {
        chunks.forEach((ch) => {
          if (storage.length >= prebufferLength) {
            storage.shift();
          }

          storage.push(ch);
        });
      },
      getStorage: () => {
        const totalPrebufferLength = (storage[0] || []).length * prebufferLength;
        return Buffer.concat(storage, totalPrebufferLength);
      },
    };
  },
  inject: [CONFIG_TOKEN],
});

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
