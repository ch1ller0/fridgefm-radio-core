import type { Request, Response } from 'express';
import type { TrackList, ReorderCb } from '../base/Playlist/Playlist.types';
import type { TEmitter } from '../features/EventBus/events';

export interface TStation {
  start(): void;
  addFolder(folder: string): void;
  next(): void;
  reorderPlaylist(cb: ReorderCb): TrackList
  getPlaylist(): TrackList;
  connectListener(req: Request | undefined, res: Response, cb: () => void): void;
  on: TEmitter['on']
}
