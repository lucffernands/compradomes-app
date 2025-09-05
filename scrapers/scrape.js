// scrapers/scrape.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const MOBILE_USER_AGENT = {
  name: 'iPhone 13',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

// Caminho absoluto para o arquivo de preços
const DATA_FILE = path.resolve('./data/prices.json');

async function scrapeGoodBom(productQuery) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

    const prices = await page.$$eval('.price', nodes =>
      nodes.map(n => n.textContent.replace('R$', '').replace(',', '.').trim())
    );

    const combined = products.map((p, i) => ({
      name: p,
      price: prices[i] ? parseFloat(prices[i]) : null,
    }));

    results.push({
      type: ctx.name,
      products: combined.length > 0 ? combined : [{ name: '❌ Não disponível', price: null }],
    });

    await page.close();
  }

  await browser.close();
  return results;
}

// Função principal
async function main() {
  try {
    const product =
      process.argv.find(arg => arg.startsWith('--product='))?.split('=')[1] || 'Bacon';

    console.log(`🔎 Buscando preços para: ${product}`);
    const data = await scrapeGoodBom(product);

    // Garante que a pasta exista
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

    // Salva os resultados
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Preços salvos em', DATA_FILE);
  } catch (err) {
    console.error('❌ Erro no scraper:', err);
    process.exit(1);
  }
}

// Executa
main();
