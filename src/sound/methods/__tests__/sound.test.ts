const devnull = require('dev-null');
const id3 = require('node-id3');
const fs = require('fs');
const { getStats, getMetaAsync, createSoundStream } = require('../sound');

const pathToMusic = `${process.cwd()}/examples/music`;

const tracks = [
  {
    fullPath: `${pathToMusic}/Artist1 - Track1.mp3`,
  },
  {
    fullPath: `${pathToMusic}/Artist1 - Track2.mp3`,
  },
];

// helper for creating mp3 files with custom meta
const TestFile = {
  path: `${pathToMusic}/test - test.mp3`,
  create(meta = {}) {
    fs.copyFileSync(tracks[0].fullPath, this.path);
    id3.write(meta, this.path);
  },
  clear() {
    fs.unlinkSync(this.path);
  },
};

describe('methods/sound', () => {
  it('getStats', () => {
    const common = {
      bitrate: 16036,
      directory: pathToMusic,
      duration: 7549,
      format: 'mp3',
      size: 121051,
    };

    expect(getStats(tracks[0].fullPath)).toEqual({
      ...common,
      ...tracks[0],
      name: 'Artist1 - Track1',
      stringified: 'Artist1 - Track1.mp3 [0.118MB/00:07]',
    });

    expect(getStats(tracks[1].fullPath)).toEqual({
      ...common,
      ...tracks[1],
      name: 'Artist1 - Track2',
      stringified: 'Artist1 - Track2.mp3 [0.118MB/00:07]',
    });
  });

  describe('getMetaAsync', () => {
    it('returns ok if id3 meta has both artist and title', async () => {
      const COMMON_META = {
        artist: 'Artist1',
        encodingTechnology: 'LAME 64bits version 3.100 (http://lame.sf.net)',
        length: '7485',
        raw: {
          TIT2: 'Track1', TLEN: '7485', TPE1: 'Artist1', TSSE: 'LAME 64bits version 3.100 (http://lame.sf.net)',
        },
      };

      const createTestMeta = (title: string) => ({
        title,
        ...COMMON_META,
        raw: { ...COMMON_META.raw, TIT2: title },
      });

      const res1 = await getMetaAsync(tracks[0]);
      const res2 = await getMetaAsync(tracks[1]);

      expect(res1).toEqual({ ...createTestMeta('Track1'), origin: 'id3' });
      expect(res2).toEqual({ ...createTestMeta('Track2'), origin: 'id3' });
    });

    it('returns meta based on filename if id3 meta is not enough', async () => {
      TestFile.create();

      const res = await getMetaAsync(getStats(TestFile.path));

      expect(res).toEqual({ artist: 'test', title: 'test', origin: 'fs' });

      TestFile.clear();
    });
  });

  describe('createSoundStream', () => {
    it('throws error on buggy stream', async () => {
      jest.useFakeTimers();

      const stream = createSoundStream({ fullPath: tracks[0].fullPath, bitrate: 16036 });
      const prom = new Promise((res, rej) => stream.on('error', (e) => rej(e)));
      const err = new Error('test_error');
      stream.pipe(devnull());

      setTimeout(() => {
        // TODO makes no sense but I ve created an issue
        // https://github.com/caolan/highland/issues/685
        stream.emit('error', err);
      }, 3000);

      jest.runAllTimers();

      await expect(prom).rejects.toEqual(err);
    });

    it('throws error on non-existent file', async () => {
      const fullPath = `${process.cwd()}/non-existent.mp3`;
      const stream = createSoundStream({ fullPath, bitrate: 16036 });
      stream.pipe(devnull());
      const prom = new Promise((res, rej) => stream.on('error', (e: Error) => rej(e)));
      await expect(prom).rejects.toThrow(`ENOENT: no such file or directory, open '${fullPath}'`);
    });
  });
});
