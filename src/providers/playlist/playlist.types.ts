import type { TTrack, TrackPath } from '../track/track.types';

export type PlaylistElement = {
  isPlaying: boolean;
} & TTrack;

export type ReorderCb = (current: PlaylistElement[]) => PlaylistElement[];

export type TrackList = PlaylistElement[];

export type PathList = readonly string[];

export type TrackMap = Map<TrackPath, TTrack>;

export type TPlaylist = {
  addFolder(folder: string): TrackList;
  reorder(cb: ReorderCb): TrackList;
  getList(): TrackList;
  getNext(): TTrack;
};
