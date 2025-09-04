// scrapers/scrape.js
import puppeteer from "puppeteer";

const MOBILE_USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";

async function scrapeGoodBom(productQuery) {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  // Define contextos: mobile e desktop
  const contexts = [
    { name: "mobile", userAgent: MOBILE_USER_AGENT, viewport: { width: 390, height: 844 } },
    { name: "desktop", userAgent: null, viewport: { width: 1280, height: 800 } }
  ];

  for (const ctx of contexts) {
    const page = await browser.newPage();
    if (ctx.userAgent) await page.setUserAgent(ctx.userAgent);
    await page.setViewport(ctx.viewport);

    const url = `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(productQuery)}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extrai nomes dos produtos
    const products = await page.$$eval(".product-name", nodes =>
      nodes.map(n => n.textContent.trim())
    );

    results.push({
      type: ctx.name,
      products: products.length > 0 ? products : ["❌ Não disponível"]
    });

    await page.close();
  }

  await browser.close();
  return results;
}

// Teste rápido
(async () => {
  try {
    console.log("✅ Scraper iniciado");
    const product = process.argv.find(arg => arg.startsWith("--product="))?.split("=")[1] || "Bacon";
    const data = await scrapeGoodBom(product);
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro no scraper:", err);
    process.exit(1);
  }
})();
