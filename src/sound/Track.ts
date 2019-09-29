import { TrackI, TrackStats } from '../types/Track.d';
import { createSoundStream, getMeta, getStats } from './methods/sound';

export default class Track implements TrackI {
  public isPlaying = false;
  public playCount = 0;
  public readonly fsStats: TrackStats;

  constructor(fullPath: string) {
    this.fsStats = getStats(fullPath);
  }

  public getSound() {
    return createSoundStream(this.fsStats);
  }

  public getMeta() {
    return getMeta(this.fsStats);
  }
}
