/* eslint-disable max-classes-per-file */
import fs from 'fs-extra';
import id3 from 'node-id3';

export const pathToMusic = `${process.cwd()}/examples/music`;

export const tracks = [
  { fullPath: `${pathToMusic}/Artist1 - Track1.mp3` },
  { fullPath: `${pathToMusic}/Artist1 - Track2.mp3` },
];

export class TestFile {
  public fullPath: string;

  static TestPath = `${pathToMusic}/.test/`;

  constructor(name?: string) {
    const created = Date.now().toString().slice(-8);
    fs.ensureDirSync(TestFile.TestPath);
    this.fullPath = `${TestFile.TestPath}${name || created}.mp3`;
    fs.copyFileSync(tracks[0].fullPath, this.fullPath);
  }

  addMeta(meta = {}) {
    id3.write(meta, this.fullPath);
  }

  remove() {
    fs.removeSync(this.fullPath);
  }
}

// describe('test-utils', () => {
//   it('new TestFile', () => {
//     const t1 = new TestFile();
//     expect(fs.statSync(t1.fullPath).isFile()).toEqual(true);
//     t1.remove();
//     expect(() => fs.statSync(t1.fullPath).isFile()).toThrow();
//   });
// });
