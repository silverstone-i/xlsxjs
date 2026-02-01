'use strict';

const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const esbuild = require('esbuild');
const fg = require('fast-glob');

const root = path.resolve(__dirname, '..');

async function copyDir(src, dest) {
  await fs.promises.mkdir(dest, {recursive: true});
  const entries = await fs.promises.readdir(src, {withFileTypes: true});
  await Promise.all(
    entries.map(async entry => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
        return;
      }
      if (entry.isSymbolicLink()) {
        const linkTarget = await fs.promises.readlink(srcPath);
        await fs.promises.symlink(linkTarget, destPath);
        return;
      }
      await fs.promises.copyFile(srcPath, destPath);
    })
  );
}

async function transpile() {
  const entryPoints = await fg(['lib/**/*.js', 'spec/browser/*.js'], {
    cwd: root,
    absolute: true,
  });

  if (!entryPoints.length) {
    throw new Error('No source files found to transpile.');
  }

  await esbuild.build({
    entryPoints,
    outdir: path.join(root, 'build'),
    outbase: root,
    bundle: false,
    platform: 'node',
    format: 'cjs',
    target: ['es2015'],
    sourcemap: true,
  });
}

function runBundle() {
  const result = spawnSync(
    'node',
    [path.join(root, 'scripts', 'build-browser.js')],
    {
      stdio: 'inherit',
    }
  );
  if (result.status !== 0) {
    throw new Error('Browser bundle failed.');
  }
}

async function copyArtifacts() {
  const distEs5 = path.join(root, 'dist', 'es5');
  await copyDir(path.join(root, 'build', 'lib'), distEs5);
  await fs.promises.copyFile(
    path.join(root, 'build', 'lib', 'exceljs.nodejs.js'),
    path.join(distEs5, 'index.js')
  );
  await fs.promises.copyFile(
    path.join(root, 'LICENSE'),
    path.join(root, 'dist', 'LICENSE')
  );
}

async function run() {
  await transpile();
  runBundle();
  await copyArtifacts();
}

run().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error);
  throw error;
});
