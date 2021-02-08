import { createSoundStream, getMetaAsync, getStats } from './methods';
import type { TrackI, TrackStats } from './Track.types';

export class Track implements TrackI {
  public playCount = 0;

  public readonly fsStats: TrackStats;

  constructor(fullPath: string) {
    this.fsStats = getStats(fullPath);
  }

  public getMetaAsync = () => getMetaAsync(this.fsStats);

  public getSound = () => createSoundStream(this.fsStats);
}
