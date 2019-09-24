export type TrackPath = string;

export type TrackStats = {
  bitrate: number, // kbps
  directory: string,
  duration: number, // millisec
  format: string,
  fullPath: string,
  name: string,
  size: number, // bytes
  stringified: string,
};

export type ShallowTrackMeta = {
  artist: string,
  title: string,
  origin: 'id3' | 'fs',
};
