export const extractLast = (str: string, symb: string) => {
  const temp = str.split(symb);
  const last = temp.pop() || '';
  const arr = temp.join(symb);
  return [arr, last];
};

export const shuffleArray = <T extends unknown>(arr: T[]): T[] =>
  arr
    .map((a) => {
      const tuple: [number, typeof a] = [Math.random(), a];
      return tuple;
    })
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);
