import { declareModule, injectable } from '@fridgefm/inverter';
import { PUBLIC_EVENTS } from '../features/EventBus/events';
import { captureTime } from '../utils/time';
import { STATION_PUBLIC_TOKEN, CONFIG_TOKEN, QUEUESTREAM_TOKEN, EVENT_BUS_TOKEN, PLAYLIST_TOKEN } from './tokens';

import type { ReorderCb } from '../base/Playlist/Playlist.types';
import type { ClientRequest, ServerResponse } from 'http';
import type { TEmitter } from '../features/EventBus/events';

export const BaseModule = declareModule({
  name: 'BaseModule',
  providers: [
    injectable({
      provide: STATION_PUBLIC_TOKEN,
      useFactory: (config, queuestream, eventBus, playlist) => {
        const station = {
          start() {
            const ct = captureTime();

            if (this.getPlaylist().length) {
              queuestream.next();
            }

            eventBus.emit(PUBLIC_EVENTS.START, this.getPlaylist(), ct());
          },
          getPlaylist: () => playlist.getList(),
          addFolder: (folder: string) => playlist.addFolder(folder),
          next: () => queuestream.next(),
          connectListener(_: ClientRequest, res: ServerResponse, cb = () => {}) {
            const { currentPipe, getPrebuffer } = queuestream;

            res.writeHead(200, config.responseHeaders);
            res.write(getPrebuffer());
            currentPipe(res);
            cb();
          },
          reorderPlaylist: (cb: ReorderCb) => playlist.reorder(cb),
          on: (...args: Parameters<TEmitter['on']>) => eventBus.on(...args),
        };

        return station;
      },
      inject: [CONFIG_TOKEN, QUEUESTREAM_TOKEN, EVENT_BUS_TOKEN, PLAYLIST_TOKEN] as const,
    }),
  ],
});
