'use strict';

const {Buffer} = require('buffer');
const process = require('process');

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

if (!globalThis.process) {
  globalThis.process = process;
}
