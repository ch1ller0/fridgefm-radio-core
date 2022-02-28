import { Buffer } from 'buffer';
import { DEFAULTS } from '../constants';

type PrebufferArgs = { prebufferLength?: number };

export type PrebufferT = {
  getStorage: () => Buffer;
  modify: (chunks: Buffer[]) => void;
};

export class Prebuffer {
  private readonly _storage: Buffer[];

  private readonly _prebufferLength: number;

  constructor(args: PrebufferArgs = {}) {
    const { prebufferLength } = args;
    this._storage = [];
    this._prebufferLength = prebufferLength || DEFAULTS.PREBUFFER_LENGTH;
  }

  public modify(chunks: Buffer[]) {
    chunks.forEach((ch) => {
      if (this._storage.length >= this._prebufferLength) {
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
