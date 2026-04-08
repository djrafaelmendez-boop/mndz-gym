const { chromium } = require('playwright');
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response, { public: 'dist' });
});

server.listen(8081, async () => {
  console.log('Running at http://localhost:8081');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8081');
  await page.waitForTimeout(2000); // Wait for React to mount
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
  server.close();
  process.exit(0);
});
