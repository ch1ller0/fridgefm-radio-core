import * as Mp3 from '../../utils/mp3';
import { extractLast, shuffleArray } from '../../utils/funcs';
import { Track } from '../Track/Track';

import type { TrackList, TrackMap } from './Playlist.types';

export const createTrackMap = (paths: readonly string[]): TrackMap => paths
  .filter((path) => {
    const f = extractLast(path, '/');

    return Mp3.isSupported(f[1]);
  })
  .reduce((acc, path) => {
    // deduplicate if already in map
    if (acc.has(path)) {
      return acc;
    }

    return acc.set(path, new Track(path));
  }, new Map() as TrackMap);

export const SHUFFLE_METHODS = {
  rearrange: ({ to, from }: { to: number, from: number }) => (arr: TrackList) => {
    const movedElement = arr.splice(from, 1)[0];
    arr.splice(to, 0, movedElement);

    return arr;
  },
  randomShuffle: () => shuffleArray,
};
