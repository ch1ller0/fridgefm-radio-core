import {
  noop, identity, extractLast, shuffleArray, findWithIndex,
} from '../funcs';

const arr = [1, 2, 3, 4];

describe('utils/funcs', () => {
  it('noop', () => {
    expect(noop()).toEqual(undefined);
  });

  it('identity', () => {
    expect(identity(1)).toEqual(1);
    expect(identity({})).toEqual({});
  });

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

  it('findWithIndex', () => {
    expect(findWithIndex(arr, (v) => v === 1)).toEqual([1, 0]);
    expect(findWithIndex(arr, (v) => v > 3)).toEqual([4, 3]);
    expect(findWithIndex(arr, (v) => v > 5)).toEqual([undefined, -1]);
  });
});
