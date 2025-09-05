// scrapers/test-goodbom.js
import puppeteer from 'puppeteer';

const MOBILE_USER_AGENT = {
  name: 'iPhone 13',
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

async function testGoodBom(productQuery = 'Bacon') {
  console.log(`🔎 Testando GoodBom para: ${productQuery}`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent(MOBILE_USER_AGENT.userAgent);
  await page.setViewport(MOBILE_USER_AGENT.viewport);

  const url = `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(productQuery)}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle0' });
    const priceText = await page.$eval('.price', el => el.textContent.trim());
    console.log(`✅ Preço encontrado: ${priceText}`);
  } catch (err) {
    console.error('❌ Produto não encontrado ou erro ao buscar preço:', err.message);
  }

  await browser.close();
}

// Executa teste
testGoodBom()
  .then(() => console.log('✅ Teste finalizado'))
  .catch(err => console.error('❌ Erro inesperado:', err));
