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

// Defina aqui os supermercados e URLs de busca
const STORES = [
  { name: 'goodbom', baseUrl: 'https://www.goodbom.com.br/hortolandia/busca?q=' },
  { name: 'savenago', baseUrl: 'https://www.savenago.com.br/busca?q=' },
  // Adicione mais supermercados aqui
];

async function scrapeStore(store, productQuery) {
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

    const url = `${store.baseUrl}${encodeURIComponent(productQuery)}`;

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      const products = await page.$$eval('.product-card', nodes =>
        nodes.map(n => ({
          name: n.querySelector('.product-name')?.textContent.trim() || '❌ Não disponível',
          price: parseFloat(
            n.querySelector('.price')?.textContent
              .replace('R$', '')
              .replace('.', '')
              .replace(',', '.')
              .trim()
          ) || null,
        }))
      );

      results.push({
        type: ctx.name,
        products: products.length > 0 ? products : [{ name: '❌ Não disponível', price: null }],
      });
    } catch (err) {
      console.error(`Erro ao buscar ${productQuery} em ${store.name} (${ctx.name}):`, err);
      results.push({
        type: ctx.name,
        products: [{ name: '❌ Não disponível', price: null }],
      });
    }

    await page.close();
  }

  await browser.close();
  return results;
}

// Produtos que você quer buscar
const PRODUCTS = process.argv
  .find(arg => arg.startsWith('--products='))
  ?.split('=')[1]
  .split(',')
  .map(p => p.trim()) || ['Bacon'];

(async () => {
  try {
    console.log('✅ Scraper iniciado');

    const data = {
      updated_at: new Date().toISOString(),
      stores: [],
      products: {},
    };

    for (const store of STORES) {
      const storeData = { name: store.name, products: {} };

      for (const product of PRODUCTS) {
        const results = await scrapeStore(store, product);
        // Pegando preço do desktop como referência (ou faça média se quiser)
        const desktopResult = results.find(r => r.type === 'desktop');
        const price = desktopResult?.products[0]?.price || null;

        storeData.products[product] = price;
      }

      data.stores.push(storeData);
    }

    const pricesPath = path.join('../data/prices.json');
    fs.writeFileSync(pricesPath, JSON.stringify(data, null, 2));

    console.log('✅ Scraping concluído e prices.json atualizado');
  } catch (err) {
    console.error('❌ Erro no scraper:', err);
    process.exit(1);
  }
})();
