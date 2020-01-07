import { TrackI, TrackStats } from '../types/Track.d';
import { createSoundStream, getMeta, getMetaAsync, getStats } from './methods/sound';

export default class Track implements TrackI {
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

  // deprecated
  // https://github.com/Kefir100/radio-ch1ller/issues/6
  public getMeta() {
    return getMeta(this.fsStats);
  }
}
