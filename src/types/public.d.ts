import type { ClientRequest, ServerResponse } from 'http';
import type { TrackList, ReorderCb } from '../base/Playlist/Playlist.types';
import type { TEmitter } from '../features/EventBus/events';

export interface TStation {
  start(): void;
  addFolder(folder: string): void;
  next(): void;
  reorderPlaylist(cb: ReorderCb): TrackList;
  getPlaylist(): TrackList;
  connectListener(req: ClientRequest | undefined, res: ServerResponse, cb: () => void): void;
  on: TEmitter['on'];
}
