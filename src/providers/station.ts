import { declareContainer, injectable } from '@fridgefm/inverter';
import { createConfig, Config } from './config';
import { eventBusProvider } from './events/events.provider';
import { playlistProvider } from './playlist/playlist.provider';
import { queuestreamProvider } from './queuestream/queuestream.provider';
import { prebufferProvider } from './prebuffer/prebuffer.provider';
import { trackProvider } from './track/track.provider';
import { stationProvider, STATION_PUBLIC_TOKEN } from './station/station.provider';
import { CONFIG_TOKEN } from './tokens';

import type { TStation } from '../types/public';
import type { ReorderCb } from './playlist/playlist.types';
import type { ClientRequest, ServerResponse } from 'http';
import type { TEmitter } from './events/events.types';

export class Station implements TStation {
  private _station: TStation;

  constructor(extConfig?: Partial<Config>) {
    this._station = declareContainer({
      providers: [
        injectable({
          provide: CONFIG_TOKEN,
          useValue: createConfig(extConfig || {}),
        }),
        trackProvider,
        eventBusProvider,
        playlistProvider,
        prebufferProvider,
        queuestreamProvider,
        stationProvider,
      ],
    }).get(STATION_PUBLIC_TOKEN);
  }

  public start() {
    this._station.start();
  }

  public addFolder(folder: string) {
    this._station.addFolder(folder);
  }

  public next() {
    this._station.next();
  }

  public getPlaylist() {
    return this._station.getPlaylist();
  }

  public reorderPlaylist(cb: ReorderCb) {
    return this._station.reorderPlaylist(cb);
  }

  public connectListener(req: ClientRequest, res: ServerResponse, cb = () => {}) {
    this._station.connectListener(req, res, cb);
  }

  public on: TEmitter['on'] = (...args) => this._station.on(...args);
}
