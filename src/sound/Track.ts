import { TrackI, TrackStats } from '../types/Track.d';
import { deprecateError } from '../utils/deprecate';
import { createSoundStream, getMetaAsync, getStats } from './methods/sound';

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

  public getMeta() {
    return deprecateError('getMeta', 'getMetaAsync', 'https://github.com/Kefir100/radio-ch1ller/issues/6');
  }
}
