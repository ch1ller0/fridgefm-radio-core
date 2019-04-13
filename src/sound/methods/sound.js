const id3 = require('node-id3');
const getMP3Duration = require('get-mp3-duration');
const { getDateFromMsecs } = require('../../utils/time');
const { logger } = require('../../utils/logger');
const { getHandler } = require('../../utils/handlers');
const { identity } = require('../../utils/funcs');
const { isMp3 } = require('../../utils/mp3');
const fs = require('fs');
const _ = require('highland');
const { Buffer } = require('buffer');

const getId3Tags = ({ path }) => {
  try {
    return id3.read(path);
  }
  catch(e) {
    const result = getHandler('error')(e, { path });
    return result || {};
  }
};

const updateId3Tags = ({ path, file }) => {
  try {
    const [ artist, title ] = file.split(' - ');
    const meta = {
      ...(isMp3(file) ? getId3Tags({ path }) : {}),
      title: title.split('.')[0].trim(),
      artist: artist.trim(),
    };

    return id3.update(meta, path);

  } catch(e) {
    console.error('Error on file: ', file);
    throw e;
  }
};

const getMp3Stats = ({ path, name }) => {
  const duration = getMP3Duration(fs.readFileSync(path));
  const size = fs.statSync(path).size;
  if (!path || !name || !duration || !size) {
    throw new Error(`insufficient parameters for getting mp3 stats ${path || name || duration || size}`, );
  }
  const bitrate = Math.ceil(size/(duration/1000));

  return {
    duration, // millisec
    size, // bytes
    bitrate, // kbps
    path,
    name,
    stringified: `${name} [${Math.floor(size/1024)/1000}MB/${getDateFromMsecs(duration)}]`,
  };
};

const createSoundStream = ({ path, bitrate }) => {
  try {
    const rs = _(fs.createReadStream(path, { highWaterMark: bitrate }));
    const comp = _.compose(
      _.append(Buffer.alloc(bitrate)),
      _.ratelimit(1,1000),
      process.env.NODE_ENV === 'development' ? _.slice(120, 160) : identity,
      _.toNodeStream({ objectMode: false })
    );

    return comp(rs);
  } catch(e) {
    logger(e, 'r');
    // skip track if it is not accessible
    return _(new Array(0));
  }
};

module.exports = {
  getMp3Stats,
  createSoundStream,
  getId3Tags,
  updateId3Tags,
};