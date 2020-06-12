import type { Request, Response } from 'express';
import type { TrackI } from './Track.h';
import type { TrackList, SortAlg } from './Playlist.h';

export type HandlerStats = {
  time: number // how much time the handler took
};

export type EmitterOverload = {
  on(event: 'restart', listener: (pl: TrackList, stats: HandlerStats) => void): void;
  on(event: 'nextTrack', listener: (nextTrack: TrackI, stats: HandlerStats) => void): void;
  on(event: 'start', listener: (pl: TrackList) => void): void;
  on(event: 'error', listener: (err: Error) => void): void;
};

export interface StationI extends EmitterOverload {
  // new @TODO di container
  start(): void;
  addFolder(folder: string): void;
  next(): void;
  getPlaylist(): TrackI[];
  shufflePlaylist(alg: SortAlg): void;
  rearrangePlaylist(from: number, to: number): void;
  connectListener(req: Request, res: Response, cb: () => void): void;
}
