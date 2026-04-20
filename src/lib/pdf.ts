/**
 * Genera un PDF en Buffer navegando a una URL de impresión con Puppeteer.
 * En producción usa @sparticuz/chromium-min (compatible con Vercel).
 * En desarrollo usa puppeteer local (Chromium incluido).
 */
export async function generatePDF(printUrl: string, cookieHeader: string): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === 'production'

  let browser: import('puppeteer-core').Browser

  if (isProduction) {
    const chromium = await import('@sparticuz/chromium-min')
    const puppeteer = await import('puppeteer-core')

    browser = await puppeteer.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar',
      ),
      headless: true,
    })
  } else {
    const puppeteer = await import('puppeteer')
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    }) as unknown as import('puppeteer-core').Browser
  }

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123 })

    if (cookieHeader) {
      const url = new URL(printUrl)
      const isSecure = url.protocol === 'https:'
      const cookies = cookieHeader.split(';').flatMap((part) => {
        const eqIdx = part.indexOf('=')
        if (eqIdx === -1) return []
        const name = part.slice(0, eqIdx).trim()
        const value = part.slice(eqIdx + 1).trim()
        if (!name) return []
        return [{ name, value, domain: url.hostname, path: '/', secure: isSecure, httpOnly: false }]
      })
      if (cookies.length > 0) {
        await page.setCookie(...cookies)
      }
    }

    await page.goto(printUrl, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
