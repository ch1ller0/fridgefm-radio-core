const EventEmitter = require('events');
const devnull = require('dev-null');
const { Transform } = require('stream');
const { modifyPrebuffer, getPrebuffer } = require('./methods/prebuffer');

class QueueStream extends EventEmitter {
  constructor({ maxListeners }) {
    super();
    this.prebufferStore = [];
    this.current = new Transform({
      transform: (chunk, encoding, callback) => {
        // prebuffering for faster client response (side-effect)
        this.prebufferStore = modifyPrebuffer(chunk, this.prebufferStore);
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
    return getPrebuffer(this.prebufferStore);
  }
}

module.exports = {
  QueueStream,
};
