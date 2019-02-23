const zeroDangle = symb => (symb.length === 2 || symb > 9) ? symb : `0${symb}`;

const getDateFromMsecs = ms => {
  const min = Math.floor((ms/1000/60) << 0);
  const sec = Math.floor((ms/1000) % 60);

  return (zeroDangle(min) + ':' + zeroDangle(sec));
};

const calculateScheduled = ({ playlist }, i) => {
  const prev = playlist
    .slice(0, i)
    .reduce((acc, { track: { fsStats : { duration } } }) => {
      acc += duration;
      return acc;
    }, 0);

  return Date.now() + prev;
};

const getHHMMSS = ms => new Date(ms).toLocaleTimeString().split(':').map(zeroDangle).join(':');

module.exports = {
  getDateFromMsecs,
  calculateScheduled,
  getHHMMSS,
};
