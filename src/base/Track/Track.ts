import { createSoundStream, getMetaAsync, getStats } from './methods';
import type { TTrack, TrackStats } from './Track.types';

export class Track implements TTrack {
  public playCount = 0;

  public readonly fsStats: TrackStats;

  constructor(fullPath: string) {
    this.fsStats = getStats(fullPath);
  }

  public getMetaAsync = () => getMetaAsync(this.fsStats);

  public getSound = () => createSoundStream(this.fsStats);
}
