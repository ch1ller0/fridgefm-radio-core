const path = require('path');
const fs = require('fs');

const walkSync = (start, callback, { recursively = true } = {}) => {
  const stat = fs.statSync(start);

  if (stat.isDirectory()) {
    const filenames = fs.readdirSync(start);
    const coll = filenames.reduce((acc, name) => {
      const abspath = path.join(start, name);

      if (fs.statSync(abspath).isDirectory() && recursively) {
        acc.dirs.push(name);
      } else {
        acc.names.push(name);
      }

      return acc;
    }, { names: [], dirs: [] });

    callback(start, coll.dirs, coll.names);

    coll.dirs.forEach(d => {
      const abspath = path.join(start, d);
      walkSync(abspath, callback);
    });

  } else {
    throw new Error('path: ' + start + ' is not a directory');
  }
};

const processFilesInDir = (dir, cb, options = {}) => {
  const stats = fs.statSync(dir);

  if (stats.isDirectory()) {
    walkSync(dir, (path, dirs, files) => {
      const len = files.length;
      for (let i = 0; i < len; i++) {
        const file = files[i];
        const helparr = file.split('.');
        const isMp3 = helparr[helparr.length - 1] === 'mp3';

        if (isMp3 && !file.startsWith('._')) {
          cb({ file, path });
        }
      }
    }, options);
  }
};

module.exports = {
  walkSync,
  processFilesInDir,
};
