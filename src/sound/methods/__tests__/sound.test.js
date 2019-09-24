const { getStats, getMeta, createSoundStream } = require('../sound');
const pathToMusic = `${process.cwd()}/examples/music`;

const tracks = [
  {
    fullPath: `${pathToMusic}/Artist1 - Track1.mp3`,
  },
  {
    fullPath: `${pathToMusic}/Artist1 - Track2.mp3`,
  },
];

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

  it('getMeta', () => {
    const common = {
      artist: 'Artist1',
      encodingTechnology: 'LAME 64bits version 3.100 (http://lame.sf.net)',
      length: '7485',
      origin: 'id3',
      // tslint:disable-next-line
      raw: {'TIT2': 'Track1', 'TLEN': '7485', 'TPE1': 'Artist1', 'TSSE': 'LAME 64bits version 3.100 (http://lame.sf.net)'},
    };
    expect(getMeta(tracks[0])).toEqual({
      title: 'Track1',
      ...common,
      raw: {...common.raw, TIT2: 'Track1'},
    });

    expect(getMeta(tracks[1])).toEqual({
      title: 'Track2',
      ...common,
      raw: {...common.raw, TIT2: 'Track2'},
    });
  });

  describe('createSoundStream', () => {
    it('throws error on buggy stream', async () => {
      jest.useFakeTimers();

      const stream = createSoundStream({ fullPath: tracks[0].fullPath, bitrate: 16036 });
      const err = new Error('test_error');

      setTimeout(() => {
        stream.destroy(err);
      }, 3000);

      jest.runAllTimers();

      const prom = new Promise((res, rej) => stream.on('error', e => rej(e)));

      await expect(prom).rejects.toEqual(err);
    });

    it('throws error on non-existent file', async () => {
      const stream = createSoundStream({ fullPath: `${process.cwd()}/non-existent.mp3`, bitrate: 16036 });
      const prom = new Promise((res, rej) => stream.on('error', e => rej(e)));
      // tslint:disable-next-line
      await expect(prom).rejects.toThrow('ENOENT: no such file or directory, open \'/Users/gregory/Desktop/Development/OpenSource/radio-engine/non-existent.mp3\'');
    });
  });
});
