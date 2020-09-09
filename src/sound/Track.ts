import { createSoundStream, getMetaAsync, getStats } from './methods/sound';
import type { TrackI, TrackStats } from '../types/Track.h';

export class Track implements TrackI {
  public isPlaying = false;

  public playCount = 0;

  public readonly fsStats: TrackStats;

  constructor(fullPath: string) {
    this.fsStats = getStats(fullPath);
  }

  public getMetaAsync() {
    return getMetaAsync(this.fsStats);
  }

  public getSound() {
    return createSoundStream(this.fsStats);
  }
}
