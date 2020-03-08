import type { TrackI } from './Track.d';

export type SortAlg = (a: TrackI, b: TrackI) => number;

export type TrackList = TrackI[];

export interface PlaylistI {
  createPlaylist(folder: string): TrackList;
  getNext(): TrackI;
  shuffle(alg?: SortAlg): TrackList;
  rearrange(from: number, to: number): TrackList;
  getList(): TrackList;
}
