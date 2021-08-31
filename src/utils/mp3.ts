import * as getMp3DurationBits from 'get-mp3-duration';
import { extractLast } from './funcs';

const SUPPORTED_FORMATS = ['mp3'];

const getTagsSize = (buffer: Buffer) => {
  /* eslint-disable no-bitwise, max-len */
  // http://id3.org/d3v2.3.0
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    // ID3
    const id3v2Flags = buffer[5];
    const footerSize = id3v2Flags & 0x10 ? 10 : 0;

    // ID3 size encoding is crazy (7 bits in each of 4 bytes)
    const z0 = buffer[6];
    const z1 = buffer[7];
    const z2 = buffer[8];
    const z3 = buffer[9];

    if ((z0 & 0x80) === 0 && (z1 & 0x80) === 0 && (z2 & 0x80) === 0 && (z3 & 0x80) === 0) {
      const tagSize = (z0 & 0x7f) * 2097152 + (z1 & 0x7f) * 16384 + (z2 & 0x7f) * 128 + (z3 & 0x7f);
      return 10 + tagSize + footerSize;
    }
  }

  return 0;
};
// eslint-enable no-bitwise, max-len

const getDuration = (buffer: Buffer): number => getMp3DurationBits(buffer);

const isSupported = (file: string): boolean => {
  const [, format] = extractLast(file, '.');
  return SUPPORTED_FORMATS.includes(format);
};

export { getDuration, getTagsSize, isSupported };
