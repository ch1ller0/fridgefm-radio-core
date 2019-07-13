import { noop } from './funcs';
import { logger } from './logger';

type Handlers = {
  error: (e: Error) => void,
  log: (v: string) => void,
};

// TODO refactor
const defaultHandler: Handlers = {
  error: e => logger(e, 'r'),
  log: v => logger(v),
};

let handler = defaultHandler;

export default {
  createHandler: (obj: Handlers) => {
    handler = obj;
  },
  getHandler: (type: keyof Handlers) => handler[type] || noop,
};
