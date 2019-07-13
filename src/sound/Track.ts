import { TrackArgs, TrackStats } from '../types/Track.d';
import { createSoundStream, getId3Tags, getMp3Stats } from './methods/sound';

export class Track {
  public fsStats: TrackStats;

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
