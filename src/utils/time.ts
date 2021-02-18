type Msecs = number;

const zeroDangle = (symb: Msecs) => ((symb.toString().length === 2 || symb > 9) ? symb : `0${symb}`);

export const getDateFromMsecs = (ms: Msecs) => {
  const min = Math.floor((ms / 1000 / 60));
  const sec = Math.floor((ms / 1000) % 60);

  return (`${zeroDangle(min)}:${zeroDangle(sec)}`);
};

export const getHHMMSS = (ms: Msecs) => new Date(ms)
  .toLocaleTimeString()
  .split(':')
  .map((t) => parseInt(t, 10))
  .map(zeroDangle)
  .join(':');

export const captureTime = () => {
  const startTime = Date.now();

  return () => Date.now() - startTime;
};
