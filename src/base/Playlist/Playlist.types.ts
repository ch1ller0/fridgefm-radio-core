import type { TrackI, TrackPath } from '../Track/Track.types';

export type PlaylistElement = {
  isPlaying: boolean
} & TrackI;

export type SortAlg = (a: TrackI, b: TrackI) => number;

export type ReorderCb = (current: PlaylistElement[]) => PlaylistElement[];

export type TrackList = PlaylistElement[];

export type PathList = readonly string[];

export type TrackMap = Map<TrackPath, TrackI>;

export interface PlaylistI {
  addFolder(folder: string): TrackList
  reorder(cb: ReorderCb): TrackList
  getList(): TrackList;
  getNext(): TrackI;
}
