'use strict';

const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

async function run() {
  const root = path.resolve(__dirname, '..');
  const distDir = path.join(root, 'dist');
  const buildWebDir = path.join(root, 'build', 'web');

  fs.mkdirSync(distDir, {recursive: true});
  fs.mkdirSync(buildWebDir, {recursive: true});

  const banner = `/*! ExcelJS ${formatDate(new Date())} */`;
  const shimDir = path.join(root, 'scripts', 'browser-shims');
  const common = {
    bundle: true,
    platform: 'browser',
    target: ['es2015'],
    sourcemap: true,
    inject: [path.join(shimDir, 'globals.js')],
    plugins: [
      {
        name: 'exceljs-browser-shims',
        setup(build) {
          const streamPath = require.resolve('readable-stream');
          const eventsPath = require.resolve('events/', {paths: [root]});
          const utilPath = require.resolve('util/', {paths: [root]});
          build.onResolve(
            {filter: /^(fs|crypto|stream|events|util)$/},
            args => {
              if (args.path === 'stream') {
                return {path: streamPath};
              }
              if (args.path === 'events') {
                return {path: eventsPath};
              }
              if (args.path === 'util') {
                return {path: utilPath};
              }
              if (args.path === 'fs') {
                return {path: path.join(shimDir, 'fs.js')};
              }
              if (args.path === 'crypto') {
                return {path: path.join(shimDir, 'crypto.js')};
              }
              return null;
            }
          );
        },
      },
    ],
  };

  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'build', 'lib', 'exceljs.browser.js')],
    outfile: path.join(distDir, 'exceljs.js'),
    format: 'iife',
    globalName: 'ExcelJS',
  });

  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'build', 'lib', 'exceljs.bare.js')],
    outfile: path.join(distDir, 'exceljs.bare.js'),
    format: 'iife',
    globalName: 'ExcelJS',
  });

  await esbuild.build({
    ...common,
    entryPoints: [
      path.join(root, 'build', 'spec', 'browser', 'exceljs.spec.js'),
    ],
    outfile: path.join(buildWebDir, 'exceljs.spec.js'),
    format: 'iife',
  });

  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'build', 'lib', 'exceljs.browser.js')],
    outfile: path.join(distDir, 'exceljs.min.js'),
    format: 'iife',
    globalName: 'ExcelJS',
    minify: true,
    banner: {js: banner},
  });

  await esbuild.build({
    ...common,
    entryPoints: [path.join(root, 'build', 'lib', 'exceljs.bare.js')],
    outfile: path.join(distDir, 'exceljs.bare.min.js'),
    format: 'iife',
    globalName: 'ExcelJS',
    minify: true,
    banner: {js: banner},
  });
}

run().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error);
  throw error;
});
