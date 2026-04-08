const { chromium } = require('playwright');
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response, { public: 'dist' });
});

server.listen(8080, async () => {
  console.log('Running at http://localhost:8080');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);
  await browser.close();
  server.close();
  process.exit(0);
});
