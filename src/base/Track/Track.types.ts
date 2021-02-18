import type { Readable } from 'stream';
import type { Tags } from 'node-id3';

export type TrackPath = string;

export type TrackStats = {
  bitrate: number, // kbps
  directory: string,
  duration: number, // millisec
  format: string,
  fullPath: string,
  name: string,
  size: number, // bytes
  tagsSize: number, // bytes
  stringified: string,
};

export interface ShallowTrackMeta extends Tags {
  origin: 'id3' | 'fs',
}

export interface TTrack {
  playCount: number
  fsStats: TrackStats;
  getSound: () => [Error | null, Readable];
  getMetaAsync: () => Promise<ShallowTrackMeta>;
}
