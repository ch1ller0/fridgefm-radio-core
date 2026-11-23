import type { ClientRequest, ServerResponse } from 'node:http';
import { createContainer, injectable } from '@fridgefm/inverter';
import type { TStation } from '../types/public.types';
import { type Config, createConfig } from './config';
import { eventBusProvider } from './events/events.provider';
import type { TEmitter } from './events/events.types';
import { playlistProvider } from './playlist/playlist.provider';
import type { ReorderCb } from './playlist/playlist.types';
import { prebufferProvider } from './prebuffer/prebuffer.provider';
import { queuestreamProvider } from './queuestream/queuestream.provider';
import { STATION_PUBLIC_TOKEN, stationProvider } from './station/station.provider';
import { CONFIG_TOKEN } from './tokens';
import { trackProvider } from './track/track.provider';

export class Station implements TStation {
  private _station: TStation;

  constructor(extConfig?: Partial<Config>) {
    this._station = createContainer({
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

  public togglePause(val?: boolean) {
    return this._station.togglePause(val);
  }

  public getPlaylist() {
    return this._station.getPlaylist();
  }

  public reorderPlaylist(cb: ReorderCb) {
    return this._station.reorderPlaylist(cb);
  }

  public getReadableStream(): ReadableStream {
    return this._station.getReadableStream();
  }
  /**
   *
   * @deprecated
   */
  public connectListener(req: ClientRequest, res: ServerResponse, cb = () => {}) {
    this._station.connectListener(req, res, cb);
  }

  public on: TEmitter['on'] = (...args) => this._station.on(...args);
}
