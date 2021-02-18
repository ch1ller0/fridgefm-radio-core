import { Station } from '../../index';

describe('public/FailPaths/common', () => {
  it('non-existing folder - throws error', () => {
    const station = new Station();
    expect(() => {
      station.addFolder('biba'); // non-existing
    }).toThrow();
  });

  it.todo('track was deleted while playback - revalidates folders');
  it.todo('track has some problems while reading - skip it');
  it.todo('track has some problems on stream - skip it');
});
