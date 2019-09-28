import * as fs from 'fs';
import { isFormatSupported } from '../../utils/mp3';
import Track from '../Track';

export const createPlaylist = (folder: string) =>
  fs.readdirSync(folder)
    .filter(isFormatSupported)
    .map(path => new Track(`${folder}/${path}`));
