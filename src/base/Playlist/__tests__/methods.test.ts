import { createTrackMap } from '../methods';
import { tracks } from '../../../__tests__/test-utils.mock';

const tracksArr = tracks.map((v) => v.fullPath);

describe('base/Playlist/createTrackMap', () => {
  it('dedupes by path', () => {
    const map = createTrackMap([...tracksArr, ...tracksArr]);
    expect(Array.from(map)).toHaveLength(2);
  });

  it('inits with zero values', () => {
    const map = createTrackMap(tracksArr);
    expect(Array.from(map).every(([, tr]) => tr.playCount === 0)).toEqual(true);
  });
});
