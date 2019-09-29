export const identity = <T>(x: T): T => x;
  /* tslint:disable:no-empty */
export const noop = (): void => {};

export const extractLast = (str: string, symb: string) => {
  const temp = str.split(symb);
  const last = temp.pop() || '';
  const arr = temp.join(symb);
  return [arr, last];
};

export const shuffleArray = <T>(arr: any[]): T[] => arr
  .map(a => [Math.random(), a])
  .sort((a, b) => a[0] - b[0])
  .map(a => a[1]);

export const findWithIndex = (arr: any[], cb: (s: any) => [any, number]) => {
  const index = arr.findIndex(cb);
  const element = arr[index];

  return [element, index];
};
