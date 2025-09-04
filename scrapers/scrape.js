// scrapers/scrape.js
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const SITE_DIR = path.join(process.cwd(), "../site"); // pasta site/
const PRODUCTS = ["Bacon", "Leite", "Cebola"]; // produtos padrão

async function scrapeGoodBom(productQuery) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Emular mobile também se quiser
  const iPhone = puppeteer.devices["iPhone 13"];
  const mobilePage = await browser.newPage();
  await mobilePage.emulate(iPhone);

  const results = [];

  // Desktop
  await page.goto(
    `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(
      productQuery
    )}`,
    { waitUntil: "networkidle2" }
  );

  const desktopProducts = await page.$$eval(".product-name", nodes =>
    nodes.map(n => n.textContent.trim())
  );

  results.push({
    type: "desktop",
    products: desktopProducts.length > 0 ? desktopProducts : ["❌ Não disponível"]
  });

  // Mobile
  await mobilePage.goto(
    `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(
      productQuery
    )}`,
    { waitUntil: "networkidle2" }
  );

  const mobileProducts = await mobilePage.$$eval(".product-name", nodes =>
    nodes.map(n => n.textContent.trim())
  );

  results.push({
    type: "mobile",
    products: mobileProducts.length > 0 ? mobileProducts : ["❌ Não disponível"]
  });

  await browser.close();
  return results;
}

// Função principal: percorre todos os produtos
(async () => {
  try {
    console.log("✅ Scraper iniciado");

    const allResults = {};
    for (const product of PRODUCTS) {
      const data = await scrapeGoodBom(product);
      allResults[product] = data;
    }

    // Salva os resultados no site/ em JSON
    if (!fs.existsSync(SITE_DIR)) fs.mkdirSync(SITE_DIR, { recursive: true });

    const outputPath = path.join(SITE_DIR, "prices.json");
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));

    console.log("✅ Scraping concluído. Resultados salvos em site/prices.json");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro no scraper:", err);
    process.exit(1);
  }
})();
