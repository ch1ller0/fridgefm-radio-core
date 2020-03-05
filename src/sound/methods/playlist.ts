import * as klaw from 'klaw-sync';
import { TrackI } from '../../types/Track.d';
import { extractLast } from '../../utils/funcs';
import { isFormatSupported } from '../../utils/mp3';
import { Track } from '../Track';

type List = TrackI[];

type KlawObj = { path: string };

export const createPlaylist = (folder: string): List => klaw(folder, { nodir: true })
  .filter(({ path }: KlawObj) => {
    const f = extractLast(path, '/');

    return isFormatSupported(f[1]);
  })
  .map(({ path }: KlawObj) => new Track(path));

type RearrangeOpts = { to: number, from: number };

export const rearrangePlaylist = (arr: List, { to, from }: RearrangeOpts): List => {
  const movedElement = arr.splice(from, 1)[0];
  arr.splice(to, 0, movedElement);

  return arr;
};
