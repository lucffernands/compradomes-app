import { chromium, devices } from "playwright";

const MOBILE_USER_AGENT = devices['iPhone 13'];

async function scrapeGoodBom(productQuery) {
  // Usa o Chrome nativo do Render
  const browser = await chromium.launch({
    channel: "chrome", // <== usa o Chrome do sistema
    headless: true
  });

  const contexts = [
    await browser.newContext({ ...MOBILE_USER_AGENT }), // Mobile
    await browser.newContext() // Desktop
  ];

  const results = [];

  for (const context of contexts) {
    const page = await context.newPage();
    const url = `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(productQuery)}`;
    await page.goto(url, { waitUntil: 'networkidle' });

    const products = await page.$$eval('.product-name', nodes =>
      nodes.map(n => n.textContent.trim())
    );

    results.push({
      type: context._options.userAgent || 'desktop',
      products: products.length > 0 ? products : ['❌ Não disponível']
    });

    await context.close();
  }

  await browser.close();
  return results;
}

// Teste rápido
(async () => {
  try {
    console.log("✅ Scraper iniciado");
    const product = process.argv.find(arg => arg.startsWith('--product='))?.split('=')[1] || 'Bacon';
    const data = await scrapeGoodBom(product);
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro no scraper:", err);
    process.exit(1);
  }
})();
