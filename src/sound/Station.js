const EventEmitter = require('events');
const { QueueStream } = require('./Queuestream');
const { Track } = require('./Track');
const { shuffleArray } = require('../utils/shuffle');
const { calculateScheduled, getHHMMSS } = require('../utils/time');
const { createHandler } = require('../utils/handlers');
const { logger } = require('../utils/logger');
const { noop } = require('../utils/funcs');
const { isMp3 } = require('../utils/mp3');

// TODO add icy metaint
const headers = {
  'icy-name': '@kefir100/radio-engine',
  'icy-genre': 'house',
  'icy-url': 'https://',
  'icy-pub':'0',
  'icy-br':'56',
  'icy-metaint': '0',
  'icy-notice1': 'Live radio powered by https://www.npmjs.com/package/@kefir100/radio-engine',
  'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=0',
  'Content-Type': 'audio/mpeg',
};

class Station extends EventEmitter {
  constructor(handlers) {
    super();
    this.playlist = [];

    this.queuestream = new QueueStream({ maxListeners: 100 });
    this.queuestream.on('next', nextTrack => {
      const { fsStats: { stringified } } = nextTrack;
      logger(`Playing: ${stringified}`, 'g');
      this.emit('nextTrack', nextTrack);
    });
    this.queuestream.on('end', () => {
      this.start({ shuffle: true });
      this.emit('restart');
    });

    handlers && createHandler(handlers);
  }

  start({ shuffle = false } = {}) {
    if (!this.playlist.length) {
      return;
    }

    if (shuffle) {
      this.playlist = shuffleArray(this.playlist);
    }

    logger('Playlist  schedule : trackname [size/duration]', 'r', false);
    this.playlist.forEach(({ track }, i) => {
      const scheduled = getHHMMSS(calculateScheduled({ playlist: this.playlist }, i));
      logger(` ${scheduled} : ${track.fsStats.stringified}`);

      this.queuestream.queue(track);
    });
    this.queuestream.next();
  }

  connectListener(req, res, cb = noop) {
    const { current, getPrebuffer } = this.queuestream;
    current.on('error', e => {
      logger(e, 'r');
    });

    res.writeHead(200, headers);

    res.write(getPrebuffer());
    current.pipe(res);
    cb();
  }

  addTrack({ path, file }) {
    if (!isMp3(file)) {
      return;
    }

    const fullPath = `${path}/${file}`;
    const track = new Track({
      path: fullPath,
      name: file,
    });

    this.playlist.push({ track });
  }
}

module.exports = {
  Station,
};
