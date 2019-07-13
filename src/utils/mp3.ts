export const isMp3 = (file: string): boolean => {
  const arr = file.split('.');
  return arr[arr.length - 1] === 'mp3';
};
