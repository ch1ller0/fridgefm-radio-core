import * as fs from 'fs';
import { TrackI } from '../../types/Track.d';
import { isFormatSupported } from '../../utils/mp3';
import Track from '../Track';

type List = TrackI[];

export const createPlaylist = (folder: string): List =>
  fs.readdirSync(folder)
    .filter(isFormatSupported)
    .map(path => new Track(`${folder}/${path}`));

type RearrangeOpts = { to: number, from: number };

export const rearrangePlaylist = (arr: List, { to, from }: RearrangeOpts): List => {
  const movedElement = arr.splice(from, 1)[0];
  arr.splice(to, 0, movedElement);

  return arr;
};
