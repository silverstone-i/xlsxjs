'use strict';

function unavailable(method) {
  return () => {
    throw new Error(`fs.${method} is not available in the browser build.`);
  };
}

const fs = {
  constants: {
    F_OK: 0,
  },
  access(_path, _mode, callback) {
    const err = new Error('fs access is not available in the browser build.');
    if (typeof callback === 'function') {
      callback(err);
    }
  },
  createReadStream: unavailable('createReadStream'),
  createWriteStream: unavailable('createWriteStream'),
  readFile: unavailable('readFile'),
  writeFile: unavailable('writeFile'),
};

module.exports = fs;
