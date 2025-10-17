const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = { console: [], errors: [] };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    out.console.push({ type: msg.type(), text: msg.text() });
    console.log('[console] ', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    out.errors.push(err.stack || String(err));
    console.error('[pageerror]', err.stack || err.toString());
  });
  page.on('response', resp => {
    const url = resp.url();
    const status = resp.status();
    if (status >= 400) {
      console.warn('[response]', status, url);
      out.console.push({ type: 'response', status, url });
    }
  });
  try {
    const url = process.argv[2] || 'http://127.0.0.1:3001/';
    console.log('Navigating to', url);
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    console.log('HTTP status on main document:', resp && resp.status());
    await page.waitForTimeout(1500);
    const html = await page.content();
    fs.writeFileSync('/tmp/diagnose-page.html', html);
    await page.screenshot({ path: '/tmp/diagnose-screenshot.png', fullPage: true });
    const nextData = await page.evaluate(() => {
      try {
        return { __NEXT_DATA__: window.__NEXT_DATA__ || null };
      } catch (e) {
        return { error: String(e) };
      }
    });
    out.nextData = nextData;
    fs.writeFileSync('/tmp/diagnose-output.json', JSON.stringify(out, null, 2));
    console.log('\nWrote /tmp/diagnose-page.html, /tmp/diagnose-screenshot.png and /tmp/diagnose-output.json');
  } catch (err) {
    console.error('Script error', err);
  } finally {
    await browser.close();
  }
})();