import type { Request, Response } from 'express';
import type { TrackI } from './Track.d';
import type { SortAlg } from './Playlist.d';

export interface StationI {
  // new @TODO di container
  start: () => void;
  addFolder: (folder: string) => void;
  next: () => void;
  getPlaylist: () => TrackI[];
  shufflePlaylist: (alg: SortAlg) => void;
  rearrangePlaylist: (from: number, to: number) => void;
  connectListener: (req: Request, res: Response, cb: () => void) => void;
}
