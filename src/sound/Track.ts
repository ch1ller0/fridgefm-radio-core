import { TrackI, TrackStats } from '../types/Track.d';
import { createSoundStream, getMeta, getStats } from './methods/sound';

export default class implements TrackI {
  public fsStats: TrackStats;

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
