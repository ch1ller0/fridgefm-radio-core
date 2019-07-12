const { Buffer } = require('buffer');
const PREBUFFER_LENGTH = 12;

class Prebuffer {
  constructor() {
    this.storage = [];
  }

  modify(chunk) {
    if (this.storage.length > PREBUFFER_LENGTH) {
      this.storage.shift();
    }

    this.storage.push(chunk);
  }

  getStorage() {
    const totalPrebufferLength = (this.storage[0] || []).length * PREBUFFER_LENGTH;

    return Buffer.concat(this.storage, totalPrebufferLength);
  }
}

module.exports = Prebuffer;