'use strict';

const {Buffer} = require('buffer');
const {sha1} = require('@noble/hashes/sha1');
const {sha256} = require('@noble/hashes/sha256');
const {sha384, sha512} = require('@noble/hashes/sha512');
const {md5} = require('@noble/hashes/legacy');

const algorithms = {
  md5,
  sha1,
  sha256,
  sha384,
  sha512,
};

function normalizeAlgorithm(name) {
  return name.toLowerCase().replace(/-/g, '');
}

function getHash(name) {
  const normalized = normalizeAlgorithm(name);
  const hash = algorithms[normalized];
  if (!hash) {
    throw new Error(
      `Hash algorithm '${name}' not supported in the browser build.`
    );
  }
  return hash;
}

function createHash(algorithm) {
  const hashFn = getHash(algorithm);
  const chunks = [];
  return {
    update(data) {
      chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
      return this;
    },
    digest(encoding) {
      const input = Buffer.concat(chunks);
      const output = Buffer.from(hashFn(new Uint8Array(input)));
      return encoding ? output.toString(encoding) : output;
    },
  };
}

function randomBytes(size) {
  if (
    !globalThis.crypto ||
    typeof globalThis.crypto.getRandomValues !== 'function'
  ) {
    throw new Error(
      'crypto.getRandomValues is not available in this environment.'
    );
  }
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  return Buffer.from(bytes);
}

function getHashes() {
  return Object.keys(algorithms);
}

module.exports = {
  createHash,
  randomBytes,
  getHashes,
};
