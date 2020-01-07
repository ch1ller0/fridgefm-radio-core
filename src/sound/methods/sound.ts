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

const getMetaAsync = async ({ fullPath, name }: TrackStats): Promise<ShallowTrackMeta> => {
  return new Promise(res => {
    return id3.read(fullPath, (err: Error, { artist, title, ...rest }: ShallowTrackMeta) => {
      if (!artist || !title || err) {
        const calculated = name.split(' - ');
        res({ artist: calculated[0], title: calculated[1], origin: 'fs' });
      }
      res({ artist, title, ...rest, origin: 'id3' });
    });
  });
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

const createSoundStream = ({ fullPath, bitrate, duration }: TrackStats): Readable => {
  const shouldTrim = process.env.NODE_ENV === 'development' && duration > 120000;

  try {
    const rs = _(fs.createReadStream(fullPath, { highWaterMark: bitrate }));
    const comp = _.seq(
      shouldTrim ? _.slice(120, 150) : identity,
      _.ratelimit(1, 1000),
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
  getMetaAsync,
  getStats,
};
