import type { Request, Response } from 'express';
import type { TrackI } from './Track.h';
import type { PlaylistI, SortAlg } from './Playlist.h';

export interface StationI {
  // new @TODO di container
  start(): void;
  addFolder(folder: string): void;
  next(): void;
  getPlaylist(): TrackI[];
  shufflePlaylist(alg: SortAlg): void;
  rearrangePlaylist(from: number, to: number): void;
  connectListener(req: Request, res: Response, cb: () => void): void;
  // exposed events
  on(event: 'start', listener: (pl: PlaylistI) => void): void;
  on(event: 'restart', listener: () => void): void;
  on(event: 'nextTrack', listener: (nextTrack: TrackI) => void): void;
  on(event: 'error', listener: (err: Error) => never): void;
}
