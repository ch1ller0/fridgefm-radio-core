const { noop, identity } = require('../funcs');

describe('utils/funcs', () => {
  it('noop', () => {
    expect(noop()).toEqual(undefined);
    expect(noop(1)).toEqual(undefined);
    expect(noop({})).toEqual(undefined);
  });

  it('identity', () => {
    expect(identity()).toEqual(undefined);
    expect(identity(1)).toEqual(1);
    expect(identity({})).toEqual({});
  });
});
