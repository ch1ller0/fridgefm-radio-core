import type { ClientRequest, ServerResponse } from 'node:http';
import { createToken, injectable } from '@fridgefm/inverter';
import type { TStation } from '../../types/public.types';
import { captureTime } from '../../utils/time';
import { EVENT_BUS_TOKEN, PUBLIC_EVENTS } from '../events/events.provider';
import { PLAYLIST_TOKEN } from '../playlist/playlist.provider';
import { QUEUESTREAM_TOKEN } from '../queuestream/queuestream.provider';
import { CONFIG_TOKEN } from '../tokens';

export const STATION_PUBLIC_TOKEN = createToken<TStation>('station_root');

export const stationProvider = injectable({
  provide: STATION_PUBLIC_TOKEN,
  useFactory: (config, queuestream, eventBus, playlist) => {
    const station = {
      togglePause: queuestream.togglePause,
      getPlaylist: playlist.getList,
      addFolder: playlist.addFolder,
      reorderPlaylist: playlist.reorder,
      on: eventBus.on,
      next: queuestream.next,
      start() {
        const ct = captureTime();

        if (this.getPlaylist().length) {
          queuestream.next();
        }

        eventBus.emit(PUBLIC_EVENTS.START, this.getPlaylist(), ct());
      },
      connectListener(_: ClientRequest, res: ServerResponse, cb = () => {}) {
        const { currentPipe, getPrebuffer } = queuestream;

        res.writeHead(200, config.responseHeaders);
        res.write(getPrebuffer());
        currentPipe(res);
        cb();
      },
    };

    return station;
  },
  inject: [CONFIG_TOKEN, QUEUESTREAM_TOKEN, EVENT_BUS_TOKEN, PLAYLIST_TOKEN] as const,
});
