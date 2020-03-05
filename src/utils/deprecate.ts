export const deprecateError = (oldKey: string, alternativeKey: string, issue: string) => {
  const pre = `"${oldKey}" method is no longer supported, use "${alternativeKey}" instead.
${issue && `It is referenced in issue: ${issue}`}`;
  throw new Error(pre);
};
