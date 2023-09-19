import { extractLast, shuffleArray } from '../funcs';

const arr = [1, 2, 3, 4];

describe('utils/funcs', () => {
  it('extractLast', () => {
    expect(extractLast('a.b.c.d', '.')).toEqual(['a.b.c', 'd']);
    expect(extractLast('atbtctd', 't')).toEqual(['atbtc', 'd']);
    expect(extractLast('aabbccdd', 'c')).toEqual(['aabbc', 'dd']);
    expect(extractLast('p/f/d', '/')).toEqual(['p/f', 'd']);
    expect(extractLast('pfd/', '/')).toEqual(['pfd', '']);
  });

  it('shuffleArray', () => {
    expect(shuffleArray(arr)).toHaveLength(arr.length);
    expect(shuffleArray(arr).sort((a, b) => a - b)).toEqual(arr);
  });
});
