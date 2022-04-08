import { injectable, createToken } from '@fridgefm/inverter';
import { CONFIG_TOKEN } from '../tokens';

type PrebufferArgs = { prebufferLength: number };
type PrebufferT = {
  getStorage: () => Buffer;
  modify: (chunks: Buffer[]) => void;
};

export const PREBUFFER_TOKEN = createToken<PrebufferT>('prebuffer');

export const prebufferFactory = (config: PrebufferArgs) => {
  const { prebufferLength } = config;
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

export const prebufferProvider = injectable({
  provide: PREBUFFER_TOKEN,
  scope: 'scoped',
  useFactory: prebufferFactory,
  inject: [CONFIG_TOKEN] as const,
});
