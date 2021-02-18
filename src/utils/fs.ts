import * as klaw from 'klaw-sync';
import * as fs from 'fs-extra';
import * as Mp3 from './mp3';

const getPaths = (fullPath: string): readonly string[] => {
  const stats = fs.statSync(fullPath);

  switch (true) {
    case stats.isDirectory(): {
      return klaw(fullPath, { nodir: true }).map(({ path }) => path);
    }
    case stats.isFile(): {
      return [fullPath];
    }
    default: return [];
  }
};

export const createList = (folders: string[]) => folders
  .reduce((acc, cur) => [
    ...acc,
    ...getPaths(cur)
      .filter(Mp3.isSupported),
  ], [] as string[]);
