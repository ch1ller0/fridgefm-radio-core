// @ts-ignore

import * as fs from 'fs';
import * as getMP3Duration from 'get-mp3-duration';
import * as _ from 'highland';
import * as id3 from 'node-id3';
import { TrackStats } from '../../types/Track.d';
import { identity } from '../../utils/funcs';
import { getHandler } from '../../utils/handlers';
import { logger } from '../../utils/logger';
import { isMp3 } from '../../utils/mp3';
import { getDateFromMsecs } from '../../utils/time';

type ShallowStats = {
  path: string,
  name?: string,
};

const getId3Tags = ({ path }: ShallowStats) => {
  try {
    return id3.read(path);
  }
  catch (e) {
    getHandler('error')(e);
    return {};
  }
};

const updateId3Tags = ({ path, name = '' }: ShallowStats) => {
  try {
    const [ artist, title ] = name.split(' - ');
    const meta = {
      ...(isMp3(name) ? getId3Tags({ path }) : {}),
      artist: artist.trim(),
      title: title.split('.')[0].trim(),
    };

    return id3.update(meta, path);

  } catch (e) {
    logger(`Error on file: ${path + name}`);
    throw e;
  }
};

const getMp3Stats = ({ path, name }: ShallowStats) => {
  const duration = getMP3Duration(fs.readFileSync(path));
  const size = fs.statSync(path).size;
  if (!path || !name || !duration || !size) {
    throw new Error(`insufficient parameters for getting mp3 stats ${path || name || duration || size}`);
  }
  const bitrate = Math.ceil(size / (duration / 1000));

  return {
    bitrate, // kbps
    duration, // millisec
    name,
    path,
    size, // bytes
    stringified: `${name} [${Math.floor(size / 1024) / 1000}MB/${getDateFromMsecs(duration)}]`,
  };
};

const createSoundStream = ({ path, bitrate }: TrackStats) => {
  try {
    const rs = _(fs.createReadStream(path, { highWaterMark: bitrate }));
    const comp = _.compose(
      _.ratelimit(1, 1000),
      process.env.NODE_ENV === 'development' ? _.slice(120, 160) : identity,
      _.toNodeStream({ objectMode: false }),
    );

    return comp(rs);
  } catch (e) {
    logger(e, 'r');
    // skip track if it is not accessible
    return _(new Array(0));
  }
};

export {
  createSoundStream,
  getId3Tags,
  getMp3Stats,
  updateId3Tags,
};
