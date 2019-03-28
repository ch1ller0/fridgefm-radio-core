const { noop } = require('./funcs');

const defaultHandler = {
  error: e => console.error(e),
  log: v => console.log(v),
};

let handler = defaultHandler;

module.exports = {
  createHandler: (obj) => {
    handler = obj;
  },
  getHandler: (type) => handler[type] || noop,
};