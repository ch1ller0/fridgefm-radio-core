import { shuffleArray } from '../../utils/funcs';
import type { TrackList } from './playlist.types';

export const SHUFFLE_METHODS = {
  rearrange:
    ({ to, from }: { to: number; from: number }) =>
    (arr: TrackList) => {
      const movedElement = arr.splice(from, 1)[0];
      if (movedElement) {
        arr.splice(to, 0, movedElement);
      }

      return arr;
    },
  randomShuffle: () => shuffleArray,
};
