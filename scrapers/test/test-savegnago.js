// scrapers/test/test-savegnago.js
import puppeteer from 'puppeteer';

const MOBILE_USER_AGENT = {
  name: 'iPhone 13',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

async function testSavegnago(productQuery) {
  console.log(`🔎 Testando Savegnago para: ${productQuery}`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(MOBILE_USER_AGENT.userAgent);
  await page.setViewport(MOBILE_USER_AGENT.viewport);

  const url = `https://www.savegnago.com.br/${encodeURIComponent(productQuery)}?_q=${encodeURIComponent(
    productQuery
  )}&map=ft`;

  try {
    // Intercepta imagens e fontes para carregar mais rápido
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
      else req.continue();
    });

    // Vai para a página e espera pelo preço
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.waitForSelector('.savegnagoio-store-theme-15-x-priceUnit', { timeout: 60000 });

    // Pega produtos e preços
    const products = await page.$$eval('.savegnagoio-store-theme-15-x-priceUnit', nodes =>
      nodes.map(n => {
        const text = n.textContent.replace(/[^\d,]/g, '').replace(',', '.');
        return parseFloat(text);
      })
    );

    if (!products.length) throw new Error('Nenhum produto por KG ou L encontrado.');

    // Pega os 3 primeiros para cálculo
    const top3 = products.slice(0, 3);
    const cheapest = Math.min(...top3);

    console.log('Produtos encontrados (primeiros 3):', top3);
    console.log('✅ Produto mais barato (por kg/litro):', cheapest.toFixed(2));

  } catch (err) {
    console.error('❌ Erro ao buscar preço Savegnago:', err.message);
  } finally {
    await page.close();
    await browser.close();
    console.log('✅ Teste finalizado');
  }
}

// Executa
const product =
  process.argv.find(arg => arg.startsWith('--product='))?.split('=')[1] || 'bacon';
testSavegnago(product);
