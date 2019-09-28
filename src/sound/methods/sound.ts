import * as fs from 'fs';
import * as getMP3Duration from 'get-mp3-duration';
import * as _ from 'highland';
import * as id3 from 'node-id3';
import { Readable } from 'stream';
import { ShallowTrackMeta, TrackPath, TrackStats } from '../../types/Track.d';
import { extractLast, identity } from '../../utils/funcs';
import { getDateFromMsecs } from '../../utils/time';

const getMeta = ({ fullPath, name }: TrackStats): ShallowTrackMeta => {
  try {
    const { artist, title, ...rest } = id3.read(fullPath);
    if (!artist || !title) {
      throw new Error('id3 tags dont have enough data');
    }
    return { artist, title, ...rest, origin: 'id3' };
  }
  catch (e) {
    const [artist, title] = name.split(' - ');
    return { artist, title, origin: 'fs' };
  }
};

const getStats = (fullPath: TrackPath) => {
  const [directory, fullName] = extractLast(fullPath, '/');
  const duration = getMP3Duration(fs.readFileSync(fullPath));
  const { size } = fs.statSync(fullPath);
  const [name, format] = extractLast(fullName, '.');

  return {
    bitrate: Math.ceil(size / (duration / 1000)),
    directory,
    duration,
    format,
    fullPath,
    name,
    size,
    stringified: `${name}.${format} [${Math.floor(size / 1024) / 1000}MB/${getDateFromMsecs(duration)}]`,
  };
};

const createSoundStream = ({ fullPath, bitrate }: TrackStats): Readable => {
  try {
    const rs = _(fs.createReadStream(fullPath, { highWaterMark: bitrate }));
    const comp = _.seq(
      process.env.NODE_ENV === 'development' ? _.slice(120, 160) : identity,
      _.ratelimit(1, 1000),
      _.toNodeStream({ objectMode: false }),
    );

    return comp(rs);
  } catch (e) {
    // skip track if it is not accessible
    return _(new Array(0));
  }
};

export {
  createSoundStream,
  getMeta,
  getStats,
};
