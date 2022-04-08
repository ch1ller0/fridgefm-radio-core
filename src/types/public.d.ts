import type { ClientRequest, ServerResponse } from 'http';
import type { TrackList, ReorderCb } from '../providers/playlist/playlist.types';
import type { TEmitter } from '../providers/events/events.types';

export type TStation = {
  start(): void;
  addFolder(folder: string): void;
  next(): void;
  reorderPlaylist(cb: ReorderCb): TrackList;
  getPlaylist(): TrackList;
  connectListener(req: ClientRequest | undefined, res: ServerResponse, cb: () => void): void;
  on: TEmitter['on'];
};
