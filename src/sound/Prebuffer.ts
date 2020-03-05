import { Buffer } from 'buffer';

const PREBUFFER_LENGTH = 12;

export class Prebuffer {
  private storage: Buffer[];

  constructor() {
    this.storage = [];
  }

  public modify(chunk: Buffer) {
    if (this.storage.length > PREBUFFER_LENGTH) {
      this.storage.shift();
    }

    this.storage.push(chunk);
  }

  public getStorage() {
    const totalPrebufferLength = (this.storage[0] || []).length * PREBUFFER_LENGTH;

    return Buffer.concat(this.storage, totalPrebufferLength);
  }
}
