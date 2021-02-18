import { Buffer } from 'buffer';

const PREBUFFER_LENGTH_DEFAULT = 12;

type PrebufferArgs = { prebufferLength? : number };

export class Prebuffer {
  private _storage: Buffer[];

  private readonly _prebufferLength: number;

  constructor(args: PrebufferArgs = {}) {
    const { prebufferLength } = args;
    this._storage = [];
    this._prebufferLength = prebufferLength || PREBUFFER_LENGTH_DEFAULT;
  }

  public modify(chunks: Buffer[]) {
    chunks.forEach((ch) => {
      if (this._storage.length > this._prebufferLength) {
        this._storage.shift();
      }

      this._storage.push(ch);
    });
  }

  public getStorage() {
    const totalPrebufferLength = (this._storage[0] || []).length * this._prebufferLength;

    return Buffer.concat(this._storage, totalPrebufferLength);
  }
}
