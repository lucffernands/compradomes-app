// scrapers/scrape.js
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve("data/prices.json");

async function scrapeGoodBom(productQuery) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const url = `https://www.goodbom.com.br/hortolandia/busca?q=${encodeURIComponent(
    productQuery
  )}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  const items = await page.$$eval(".product-item", nodes =>
    nodes.map(n => {
      const name = n.querySelector(".product-name")?.textContent?.trim() || "Sem nome";
      const price = n.querySelector(".price")?.textContent?.trim() || "Sem preço";
      return { name, price };
    })
  );

  await browser.close();
  return items;
}

async function main() {
  const product =
    process.argv.find(arg => arg.startsWith("--product="))?.split("=")[1] || "Bacon";

  console.log(`🔎 Buscando preços para: ${product}`);
  const products = await scrapeGoodBom(product);

  const output = {
    updated_at: new Date().toISOString(),
    stores: ["GoodBom"],
    products: {
      [product]: {
        GoodBom: products,
      },
    },
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2), "utf-8");
  console.log(`✅ Arquivo salvo em ${DATA_FILE}`);
}

main().catch(err => {
  console.error("❌ Erro no scraper:", err);
  process.exit(1);
});
