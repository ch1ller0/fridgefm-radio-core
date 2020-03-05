import { extractLast } from './funcs';

const SUPPORTED_FORMATS = ['mp3'];

export const isFormatSupported = (file: string): boolean => {
  const [, format] = extractLast(file, '.');
  return SUPPORTED_FORMATS.includes(format);
};
