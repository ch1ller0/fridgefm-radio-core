import { createSoundStream, getMetaAsync, getStats } from './methods';
import type { TTrack } from './Track.types';

export const createTrack = (fullPath: string): TTrack => {
  const fsStats = getStats(fullPath);

  return {
    fsStats,
    playCount: 0,
    getMetaAsync: () => getMetaAsync(fsStats),
    getSound: () => createSoundStream(fsStats),
  };
};
