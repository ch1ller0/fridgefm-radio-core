const { getMp3Stats, getId3Tags } = require('../sound');
const pathToMusic = `${process.cwd()}/examples/music`;

const tracks = [
  {
    path: `${pathToMusic}/Artist1 - Track1.mp3`,
    name: 'Artist1 - Track1.mp3',
  },
  {
    path: `${pathToMusic}/Artist1 - Track2.mp3`,
    name: 'Artist1 - Track2.mp3',
  },
];

describe('methods/sound', () => {
  it('getMp3Stats', () => {
    const common = {
      duration: 7549,
      size: 121051,
      bitrate: 16036,
    };

    expect(getMp3Stats(tracks[0])).toEqual({
      ...common,
      ...tracks[0],
      stringified: 'Artist1 - Track1.mp3 [0.118MB/00:07]',
    });

    expect(getMp3Stats(tracks[1])).toEqual({
      ...common,
      ...tracks[1],
      stringified: 'Artist1 - Track2.mp3 [0.118MB/00:07]',
    });
  });

  it('getId3Tags', () => {
    const common = {
      artist: 'Artist1',
      encodingTechnology: 'LAME 64bits version 3.100 (http://lame.sf.net)',
      length: '7485',
      raw: {'TIT2': 'Track1', 'TLEN': '7485', 'TPE1': 'Artist1', 'TSSE': 'LAME 64bits version 3.100 (http://lame.sf.net)'},
    };
    expect(getId3Tags(tracks[0])).toEqual({
      title: 'Track1',
      ...common,
      raw: {...common.raw, TIT2: 'Track1'},
    });

    expect(getId3Tags(tracks[1])).toEqual({
      title: 'Track2',
      ...common,
      raw: {...common.raw, TIT2: 'Track2'},
    });
  });
});