import { TrackArgs, TrackStats } from '../types/Track.d';
import { createSoundStream, getId3Tags, getMp3Stats } from './methods/sound';

class Track {
  private fsStats: TrackStats;

  constructor({ path, name }: TrackArgs) {
    this.fsStats = getMp3Stats({ path, name });
  }

  public getSound() {
    return createSoundStream(this.fsStats);
  }

  public getMeta() {
    return getId3Tags(this.fsStats);
  }
}

module.exports = {
  Track,
};
