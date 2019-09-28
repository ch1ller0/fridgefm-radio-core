export const identity = <T>(x: T): T => x;
  /* tslint:disable:no-empty */
export const noop = (): void => {};

export const extractLast = (str: string, symb: string) => {
  const temp = str.split(symb);
  const last = temp.pop() || '';
  const arr = temp.join(symb);
  return [arr, last];
};
