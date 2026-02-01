const {PassThrough} = require('readable-stream');
const http = require('http');
const express = require('express');
const testutils = require('../utils/index');

const Excel = verquire('exceljs');

describe('Express', () => {
  let server;
  let baseUrl;
  before(done => {
    const app = express();
    app.get('/workbook', (req, res) => {
      const wb = testutils.createTestBook(new Excel.Workbook(), 'xlsx');
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename=Report.xlsx');
      wb.xlsx.write(res).then(() => {
        res.end();
      });
    });
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      done();
    });
  });

  after(() => {
    server.close();
  });

  it('downloads a workbook', async function() {
    this.timeout(5000);
    const res = await new Promise((resolve, reject) => {
      const request = http.get(`${baseUrl}/workbook`, response => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`Unexpected status code ${response.statusCode}`));
          return;
        }
        resolve(response);
      });
      request.on('error', reject);
    });
    const wb2 = new Excel.Workbook();
    await wb2.xlsx.read(res.pipe(new PassThrough()));
    testutils.checkTestBook(wb2, 'xlsx');
  });
});
