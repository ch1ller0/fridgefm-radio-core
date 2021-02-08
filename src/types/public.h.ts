import type { Request, Response } from 'express';
import type { TrackList, ReorderCb } from '../base/Playlist/Playlist.types';
import type { Emitter } from '../features/EventBus/events';

export interface StationI {
  start(): void;
  addFolder(folder: string): void;
  next(): void;
  reorderPlaylist(cb: ReorderCb): TrackList
  getPlaylist(cb: ReorderCb): TrackList;
  connectListener(req: Request, res: Response, cb: () => void): void;
  on: Emitter['on']
}
