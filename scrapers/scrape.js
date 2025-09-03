// scrapers/scrape.js
import { chromium, devices } from "playwright";

const MOBILE_USER_AGENT = devices['iPhone 13'];

async function scrapeGoodBom(productQuery) {
  // Lança o browser com flags para Render
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  // Contextos mobile e desktop
  const contexts = [
    { ctx: await browser.newContext({ ...MOBILE_USER_AGENT }), type: "mobile" },
    { ctx: await browser.newContext(), type: "desktop" }
  ];

  const results = [];

  for (const { ctx, type } of contexts) {
    const page = await ctx.newPage();
    const url = `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(productQuery)}`;
    await page.goto(url, { waitUntil: 'networkidle' });

    // Extrai produtos visíveis
    const products = await page.$$eval('.product-name', nodes =>
      nodes.map(n => n.textContent.trim())
    );

    results.push({
      type,
      products: products.length > 0 ? products : ['❌ Não disponível']
    });

    await ctx.close();
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
