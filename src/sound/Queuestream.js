const EventEmitter = require('events');
const devnull = require('dev-null');
const { Transform } = require('stream');

class QueueStream extends EventEmitter {
  constructor({ maxListeners }) {
    super();
    this.current = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, chunk);
      },
    });
    this.current.setMaxListeners(maxListeners);

    //set defaults
    this.tracks = [];
    this.current.pipe(devnull(), { end: false });
  }

  queue(track) {
    this.tracks.push(track);
  }

  next() {
    if (this.tracks.length > 0) {
      const nextTrack = this.tracks.shift();
      this.emit('next', nextTrack);

      const trackStream = nextTrack.getSound();
      trackStream.on('end', () => {
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
}

module.exports = {
  QueueStream,
};
