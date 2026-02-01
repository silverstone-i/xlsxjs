'use strict';

const fs = require('fs');
const path = require('path');
const {pathToFileURL} = require('url');
const puppeteer = require('puppeteer');
const jasmineCore = require('jasmine-core');

const root = path.resolve(__dirname, '..');
const runnerDir = path.join(root, '.tmp');
const runnerPath = path.join(runnerDir, 'jasmine-runner.html');

function toFileUrl(filePath) {
  return pathToFileURL(filePath).href;
}

function buildRunnerHtml() {
  const {files} = jasmineCore;
  const jasmineScripts = files.jsFiles.map(file =>
    toFileUrl(path.join(files.path, file))
  );
  const bootScripts = files.bootFiles.map(file =>
    toFileUrl(path.join(files.bootDir, file))
  );
  const boot0 = bootScripts[0];
  const boot1 = bootScripts[1];

  const scripts = [
    ...jasmineScripts,
    boot0,
    // Reporter needs jasmine to exist; specs should load before boot1 executes.
    'INLINE_REPORTER',
    toFileUrl(path.join(root, 'dist', 'exceljs.js')),
    toFileUrl(path.join(root, 'build', 'web', 'exceljs.spec.js')),
    boot1,
  ];

  const reporter = `
(function() {
  window.__jasmineDone = null;
  window.__jasmineFailures = 0;
  if (!window.jasmine || !window.jasmine.getEnv) {
    return;
  }
  window.jasmine.getEnv().addReporter({
    specDone: function(result) {
      if (result.status === 'failed') {
        window.__jasmineFailures += result.failedExpectations.length;
      }
    },
    jasmineDone: function(result) {
      window.__jasmineDone = result;
    }
  });
})();
`;

  const scriptTags = scripts
    .map(script => {
      if (script === 'INLINE_REPORTER') {
        return `<script>${reporter}</script>`;
      }
      return `<script src="${script}"></script>`;
    })
    .join('\n');

  const cssLinks = files.cssFiles
    .map(
      file =>
        `<link rel="stylesheet" href="${toFileUrl(path.join(files.path, file))}">`
    )
    .join('\n');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Jasmine Spec Runner</title>
  ${cssLinks}
</head>
<body>
  ${scriptTags}
</body>
</html>`;
}

async function run() {
  await fs.promises.mkdir(runnerDir, {recursive: true});
  await fs.promises.writeFile(runnerPath, buildRunnerHtml());

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    // eslint-disable-next-line no-console
    console.log(msg.text());
  });

  await page.goto(toFileUrl(runnerPath), {waitUntil: 'domcontentloaded'});
  await page.waitForFunction('window.__jasmineDone !== null', {
    timeout: 30000,
  });

  // eslint-disable-next-line no-undef -- runs in browser context
  const result = await page.evaluate(() => window.__jasmineDone);
  // eslint-disable-next-line no-undef -- runs in browser context
  const failures = await page.evaluate(() => window.__jasmineFailures || 0);

  await page.close();
  await browser.close();

  if (!result || result.overallStatus !== 'passed' || failures > 0) {
    throw new Error(
      `Jasmine failed with status ${result && result.overallStatus}`
    );
  }
}

run().catch(error => {
  // eslint-disable-next-line no-console
  console.error(error);
  throw error;
});
