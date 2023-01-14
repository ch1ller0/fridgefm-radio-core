import { Buffer } from 'buffer';
import { DEFAULTS } from '../constants';

type PrebufferArgs = { prebufferLength?: number };

/**
 * Helper object that stores previous [prebufferLength] of Buffers.
 * It enables prebuffering, simply put it just immediately returns [prebufferLength] previous seconds of the stream.
 */
export const createPrebuffer = (args: PrebufferArgs = {}) => {
  const prebufferLength = args.prebufferLength || DEFAULTS.PREBUFFER_LENGTH;
  const storage: Buffer[] = [];

  return {
    modify: (chunks: Buffer[]) => {
      chunks.forEach((ch) => {
        if (storage.length >= prebufferLength) {
          storage.shift();
        }

        storage.push(ch);
      });
    },
    getStorage: () => {
      const totalPrebufferLength = (storage[0] || []).length * prebufferLength;

      return Buffer.concat(storage, totalPrebufferLength);
    },
  };
};
