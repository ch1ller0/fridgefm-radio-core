import { TrackI } from '../types/Track.d';
import { findWithIndex, shuffleArray } from '../utils/funcs';
import { logger } from '../utils/logger';
import { createPlaylist, rearrangePlaylist } from './methods/playlist';

type SortAlg = (a: TrackI, b: TrackI) => number;

export class Playlist {
  private tracks: TrackI[] = [];

  public createPlaylist(folder: string) {
    this.tracks = [...this.tracks, ...createPlaylist(folder)];
  }

  public getNext() {
    const [currentTrack, currentIndex] = findWithIndex(this.tracks, (t) => t.isPlaying);
    if (currentTrack) {
      currentTrack.isPlaying = false;
    }
    const next = this.tracks[currentIndex + 1];
    if (next) {
      next.isPlaying = true;
      next.playCount += 1;
    }

    return next;
  }

  public shuffle(algorithm?: SortAlg) {
    logger('Playlist:shuffle', 'bb');
    this.tracks = algorithm ? this.tracks.sort(algorithm) : shuffleArray(this.tracks);
  }

  public rearrange(from: number, to: number) {
    logger('Playlist:rearrange', 'bb');
    this.tracks = rearrangePlaylist(this.tracks, { from, to });
    return { from, to };
  }

  public getList() {
    return this.tracks;
  }
}
