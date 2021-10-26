/* eslint-disable no-param-reassign */
import winston from 'winston';
import chalk from 'chalk';
import { getHHMMSS } from './time';

const colors = {
  error: chalk.redBright,
  info: chalk.greenBright,
  warn: chalk.yellowBright,
  default: chalk.grey,
  time: chalk.cyan,
};

const fridgeformat = winston.format((info) => {
  // @ts-ignore
  const chalked = colors[info.level] || colors.default;

  const add = {
    timings: typeof info.timings !== 'undefined' ? `+${info.timings}ms` : '',
    event: `${info.name || ''}:${info.event}::`,
  };

  // @ts-ignore
  info.message = `${colors.time(getHHMMSS(Date.now()))} ${chalked(add.event)} ${info.message || ''} ${chalked(
    add.timings,
  )}`;
  return info;
});

export const logger = winston.createLogger({
  format: fridgeformat(),
  transports: [
    new winston.transports.Console({
      format: winston.format.cli(),
    }),
  ],
});
