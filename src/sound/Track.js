const { getMp3Stats, createSoundStream, getId3Tags } = require('./trackMethods');

class Track {
  constructor({ path, name }) {
    this.fsStats = getMp3Stats({ path, name });
  }

  getSound() {
    return createSoundStream(this.fsStats);
  }

  getMeta() {
    return getId3Tags(this.fsStats);
  }
}

module.exports = {
  Track,
};
