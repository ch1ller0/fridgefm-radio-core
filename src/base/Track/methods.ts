import fs from 'fs-extra';
import _ from 'highland';
import id3 from 'node-id3';
import { extractLast } from '../../utils/funcs';
import { getDateFromMsecs } from '../../utils/time';
import Mp3 from '../../utils/mp3';

import type { Readable } from 'stream';
import type { Tags } from 'node-id3';
import type { ShallowTrackMeta, TrackPath, TrackStats } from './Track.types';

const getMetaAsync = async (stats: TrackStats): Promise<ShallowTrackMeta> => {
  const { fullPath, name } = stats;

  return new Promise((res) =>
    id3.read(fullPath, (err: NodeJS.ErrnoException, meta: Tags) => {
      const { artist, title, ...rest } = meta || {};

      if (!artist || !title || err) {
        const calculated = name.split(' - ');
        res({ artist: calculated[0], title: calculated[1], origin: 'fs' });
      }
      res({
        artist,
        title,
        ...rest,
        origin: 'id3',
      });
    }),
  );
};

const getStats = (fullPath: TrackPath): TrackStats => {
  const file = fs.readFileSync(fullPath);
  const [directory, fullName] = extractLast(fullPath, '/');
  const duration = Mp3.getDuration(file);
  const tagsSize = Mp3.getTagsSize(file);
  const { size } = fs.statSync(fullPath);
  const [name, format] = extractLast(fullName, '.');

  return {
    size,
    tagsSize,
    directory,
    duration,
    format,
    fullPath,
    name,
    bitrate: Math.ceil((size - tagsSize) / (duration / 1000)),
    stringified: `${name}.${format} [${Math.floor(size / 1024) / 1000}MB/${getDateFromMsecs(duration)}]`,
  };
};

const createSoundStream = ({ fullPath, bitrate, tagsSize }: TrackStats): [Error | null, Readable] => {
  try {
    if (!fs.statSync(fullPath).isFile()) {
      throw new Error(`Not a file: '${fullPath}'`);
    }

    // @ts-ignore
    const hlStream = _(fs.createReadStream(fullPath, { highWaterMark: bitrate })) as Highland.Stream<Buffer>;

    const comp = _.seq(
      // @ts-ignore
      _.drop(Math.floor(tagsSize / bitrate)), // remove id3tags from stream
      // @ts-ignore
      // _.slice(60, 80), // for debuggine purposes
      // @ts-ignore
      _.ratelimit(1, 1000),
    );

    return [null, comp(hlStream)];
  } catch (e) {
    // skip track if it is not accessible
    // @ts-ignore
    return [e, _(new Array(0))];
  }
};

export { createSoundStream, getMetaAsync, getStats };
