const chalk = require('chalk');
const { getHHMMSS } = require('./time');

const cols = {
  r: chalk.red,
  b: chalk.blue,
  g: chalk.green,
  br: chalk.black.bgRed,
  bb: chalk.black.bgBlue,
  bg: chalk.black.bgGreen,
  t: x => x,
};

const logger = (data, color = 't', showTime = true, ...args) => {
  const stringData = typeof data === 'string';
  const time = showTime ? `${getHHMMSS(Date.now())} ` : '';
  stringData ?
    console.log(`${cols.b(time)}${cols[color](data)}${args[0] || ''}`) :
    console.log(data);
};

module.exports = {
  logger,
};