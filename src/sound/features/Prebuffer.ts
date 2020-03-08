import { Buffer } from 'buffer';

const PREBUFFER_LENGTH_DEFAULT = 12;

type PrebufferArgs = { prebufferLength? : number };

export class Prebuffer {
  private storage: Buffer[];

  private readonly prebufferLength: number;

  constructor(args: PrebufferArgs = {}) {
    const { prebufferLength } = args;
    this.storage = [];
    this.prebufferLength = prebufferLength || PREBUFFER_LENGTH_DEFAULT;
  }

  public modify(chunk: Buffer) {
    if (this.storage.length > this.prebufferLength) {
      this.storage.shift();
    }

    this.storage.push(chunk);
  }

  public getStorage() {
    const totalPrebufferLength = (this.storage[0] || []).length * this.prebufferLength;

    return Buffer.concat(this.storage, totalPrebufferLength);
  }
}
