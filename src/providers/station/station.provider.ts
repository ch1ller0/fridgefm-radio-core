import { injectable, createToken } from '@fridgefm/inverter';
import { captureTime } from '../../utils/time';
import { PLAYLIST_TOKEN } from '../playlist/playlist.provider';
import { QUEUESTREAM_TOKEN } from '../queuestream/queuestream.provider';
import { PUBLIC_EVENTS, EVENT_BUS_TOKEN } from '../events/events.provider';
import { CONFIG_TOKEN } from '../tokens';

import type { ClientRequest, ServerResponse } from 'http';
import type { ReorderCb } from '../playlist/playlist.types';
import type { TEmitter } from '../events/events.types';
import type { TStation } from '../../types/public.types';

export const STATION_PUBLIC_TOKEN = createToken<TStation>('station_root');

export const stationProvider = injectable({
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
});
