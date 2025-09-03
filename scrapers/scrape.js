// scrapers/scrape.js
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

function parsePrice(priceStr) {
  if (!priceStr) return null;
  return parseFloat(priceStr.replace("R$", "").replace(",", ".").trim());
}

export async function scrapeGoodBom(products = []) {
  const results = {};

  for (const product of products) {
    const query = encodeURIComponent(product);
    const url = `https://www.goodbom.com.br/hortolandia/busca?q=${query}`;

    try {
      const res = await fetch(url);
      const text = await res.text();
      const dom = new JSDOM(text);
      const document = dom.window.document;

      const productElements = document.querySelectorAll("a.sc-413778f5-0.ktiOQb");
      if (!productElements.length) {
        results[product] = "❌ Não disponível em GoodBom";
        continue;
      }

      const productList = [];
      productElements.forEach((el) => {
        const nameEl = el.querySelector("span.product-name");
        const priceEl = el.querySelector("span.price");

        if (nameEl && priceEl) {
          const name = nameEl.textContent.trim();
          const priceText = priceEl.textContent.trim();
          const price = parsePrice(priceText);

          productList.push({ name, price, raw: priceText });
        }
      });

      results[product] = productList.length ? productList : "❌ Não disponível em GoodBom";
    } catch (err) {
      results[product] = `❌ Erro ao buscar: ${err.message}`;
    }
  }

  return results;
}

// teste rápido via node
if (process.argv.length > 2) {
  const products = process.argv[2].split(",");
  scrapeGoodBom(products).then((res) => console.log(JSON.stringify(res, null, 2)));
}
