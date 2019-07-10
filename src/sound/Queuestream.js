const EventEmitter = require('events');
const devnull = require('dev-null');
const { Transform } = require('stream');
const Prebuffer = require('./Prebuffer');
const { logger } = require('../utils/logger');

class QueueStream extends EventEmitter {
  constructor({ maxListeners }) {
    super();
    this.prebuffer = new Prebuffer();
    this.current = new Transform({
      transform: (chunk, encoding, callback) => {
        // prebuffering for faster client response (side-effect)
        this.prebuffer.modify(chunk);
        // do not modify chunks
        callback(null, chunk);
      },
    });
    this.current.setMaxListeners(maxListeners);

    //set defaults
    this.tracks = [];
    this.current.pipe(devnull(), { end: false });
    this.getPrebuffer = this.getPrebuffer.bind(this);
  }

  queue(track) {
    this.tracks.push(track);
  }

  next() {
    if (this.tracks.length > 0) {
      const nextTrack = this.tracks.shift();
      this.emit('next', nextTrack);

      const trackStream = nextTrack.getSound();
      trackStream.once('error', e => {
        logger(e, 'r');
      });
      trackStream.once('end', () => {
        this.next();
      });
      trackStream.pipe(this.current, { end: false });
    } else {
      this.emit('end');
    }
  }

  // Standard Stream Methods
  pause() {}

  error() {}

  resume() {}

  getPrebuffer() {
    return this.prebuffer.getStorage();
  }
}

module.exports = {
  QueueStream,
};
