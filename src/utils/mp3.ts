const SUPPORTED_FORMATS = ['mp3'];

export const isFormatSupported = (file: string): boolean => {
  const arr = file.split('.');
  return SUPPORTED_FORMATS.includes(arr[arr.length - 1]);
};
