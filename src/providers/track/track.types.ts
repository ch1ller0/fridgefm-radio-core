import type { Readable } from 'stream';
import type { Tags } from 'node-id3';

export type TrackPath = string;

export type TrackStats = {
  bitrate: number; // kbps
  directory: string;
  duration: number; // millisec
  format: string;
  fullPath: string;
  name: string;
  size: number; // bytes
  tagsSize: number; // bytes
  stringified: string;
};

export type ShallowTrackMeta = Tags & {
  origin: 'id3' | 'fs';
};

export type TTrack = {
  playCount: number;
  fsStats: TrackStats;
  getSound: () => [Error | null, Readable];
  getMetaAsync: () => Promise<ShallowTrackMeta>;
};
