export type TrackArgs = {
  path: string,
  name: string,
};

export type TrackStats = {
  duration: number,
  size: number,
  bitrate: number,
  stringified: string,
} & TrackArgs;
