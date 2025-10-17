const { chromium } = require('playwright')
const fs = require('fs')
async function run(token, baseUrl = 'http://127.0.0.1:3000') {
  if (!token) {
    console.error('Usage: node scripts/trace-confirmation.js <token> [baseUrl]')
    process.exit(2)
  }
  const out = { requests: [], console: [], pageErrors: [] }
  const browser = await chromium.launch()
  const page = await browser.newPage()
  page.on('console', msg => {
    out.console.push({ type: msg.type(), text: msg.text() })
    console.log('[console]', msg.type(), msg.text())
  })
  page.on('pageerror', err => {
    out.pageErrors.push(err.stack || String(err))
    console.error('[pageerror]', err.stack || err.toString())
  })
  await page.route('**/api/auth/confirm**', async (route) => {
    const req = route.request()
    const method = req.method()
    const url = req.url()
    console.log('[route] intercepted', method, url)
    const res = await route.fetch()
    const body = await res.text()
    console.log('[route] response', res.status(), body.substring(0, 400))
    out.requests.push({ method, url, status: res.status(), body: body.slice(0, 2000) })
    route.continue()
  })
  const url = `${baseUrl}/auth/confirm?token=${encodeURIComponent(token)}`
  console.log('Navigating to', url)
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
  console.log('Main document status', resp && resp.status())
  await page.waitForTimeout(2000)
  const html = await page.content()
  fs.writeFileSync('/tmp/trace-confirmation-page.html', html)
  await page.screenshot({ path: '/tmp/trace-confirmation.png', fullPage: true })
  fs.writeFileSync('/tmp/trace-confirmation.json', JSON.stringify(out, null, 2))
  console.log('Wrote /tmp/trace-confirmation-page.html, /tmp/trace-confirmation.png, /tmp/trace-confirmation.json')
  await browser.close()
}
const token = process.argv[2]
const baseUrl = process.argv[3] || 'http://127.0.0.1:3000'
run(token, baseUrl).catch(err => { console.error(err); process.exit(1) })