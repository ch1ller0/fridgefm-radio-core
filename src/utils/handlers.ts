import { noop } from './funcs';
import { logger } from './logger';

type Handler<T> = (arg: T) => any;

type Handlers = {
  error: Handler<Error>,
  log: Handler<string>,
};

// TODO refactor
const defaultHandler: Handlers = {
  error: e => logger(e, 'r'),
  log: v => logger(v),
};

let handler = defaultHandler;

const createHandler = (obj: Handlers): void => {
  handler = obj;
};

const getHandler = (type: keyof Handlers): Handler<any> => handler[type] || noop;

export {
  getHandler,
  createHandler,
};
