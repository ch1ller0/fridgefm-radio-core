import chalk from 'chalk';
import { identity } from './funcs';
import { getHHMMSS } from './time';

const { NODE_ENV } = process.env;

type Color = 'b' | 'bb' | 'bg' | 'br' | 'g' | 'r' | 't';

const cols = {
  b: chalk.blue,
  bb: chalk.black.bgBlue,
  bg: chalk.black.bgGreen,
  br: chalk.black.bgRed,
  g: chalk.green,
  r: chalk.red,
  t: identity,
};

export const logger = (data: any, color: Color = 't', showTime = true, ...args: any): void => {
  if (NODE_ENV !== 'development') {
    return;
  }
  const stringData = typeof data === 'string';
  const time = showTime ? `${getHHMMSS(Date.now())} ` : '';

  stringData // eslint-disable-line @typescript-eslint/no-unused-expressions
    ? console.log(`${cols.b(time)}${cols[color](data)}${args[0] || ''}`) // eslint-disable-line no-console
    : console.log(data); // eslint-disable-line no-console
};
