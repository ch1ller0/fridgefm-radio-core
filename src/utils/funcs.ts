export const identity = <T>(x: T): T => x;
export const noop = (): void => {};

export const extractLast = (str: string, symb: string) => {
  const temp = str.split(symb);
  const last = temp.pop() || '';
  const arr = temp.join(symb);
  return [arr, last];
};

export const shuffleArray = <T extends unknown>(arr: T[]): T[] => arr
  .map((a) => {
    const tuple: [number, typeof a] = [Math.random(), a];
    return tuple;
  })
  .sort((a, b) => a[0] - b[0])
  .map((a) => a[1]);

export const findWithIndex = <T>(arr: T[], cb: (s: T, i: number) => boolean) => {
  const index = arr.findIndex(cb);
  const element = arr[index];

  if (!element) {
    const notFound: [undefined, number] = [undefined, index];

    return notFound;
  }

  const res: [T, number] = [element, index];

  return res;
};
