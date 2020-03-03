const { deprecateError } = require('../deprecate');

describe('utils/deprecate', () => {
  it('deprecateError', () => {
    expect(() => deprecateError('deprecatedMethodName', 'alternativeMethod', 'referencedIssue'))
      .toThrow(`\"deprecatedMethodName\" method is no longer supported, use \"alternativeMethod\" instead.
It is referenced in issue: referencedIssue`);
  });
});
