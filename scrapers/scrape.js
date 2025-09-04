// scrapers/scrape.js
import puppeteer from 'puppeteer';

const MOBILE_USER_AGENT = {
  name: 'iPhone 13',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

async function scrapeGoodBom(productQuery) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // necessário no GitHub Actions
  });

  const contexts = [
    { name: 'mobile', options: MOBILE_USER_AGENT },
    { name: 'desktop', options: {} },
  ];

  const results = [];

  for (const ctx of contexts) {
    const page = await browser.newPage();

    if (ctx.name === 'mobile') {
      await page.setUserAgent(ctx.options.userAgent);
      await page.setViewport(ctx.options.viewport);
    }

    const url = `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(
      productQuery
    )}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    const products = await page.$$eval('.product-name', nodes =>
      nodes.map(n => n.textContent.trim())
    );

    results.push({
      type: ctx.name,
      products: products.length > 0 ? products : ['❌ Não disponível'],
    });

    await page.close();
  }

  await browser.close();
  return results;
}

// Teste rápido
(async () => {
  try {
    console.log('✅ Scraper iniciado');
    const product =
      process.argv.find(arg => arg.startsWith('--product='))?.split('=')[1] || 'Bacon';
    const data = await scrapeGoodBom(product);
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no scraper:', err);
    process.exit(1);
  }
})();
