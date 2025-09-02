import fs from "fs";
import path from "path";

// converte preço brasileiro (ex: "R$ 10,99") em número
export function parsePriceBR(txt) {
  if (!txt) return null;
  const digits = txt.replace(/[^0-9,]/g, "").replace(",", ".");
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

// caminho para os mercados disponíveis
const storesPath = path.resolve("./data/stores.json");

function loadStores() {
  if (fs.existsSync(storesPath)) {
    return JSON.parse(fs.readFileSync(storesPath, "utf-8"));
  }
  return [];
}

// simula scraping (depois substituímos por Puppeteer ou API real)
async function scrapeFromStore(store, product) {
  const min = 5;
  const max = 50;
  const price = (Math.random() * (max - min) + min).toFixed(2);
  return `R$ ${price}`;
}

// função chamada pelo scrape.cjs
export async function getPrices(product, stores) {
  const availableStores = loadStores();
  const result = {};

  for (const store of stores) {
    if (!availableStores.includes(store)) {
      result[store] = "❌ Não suportado";
      continue;
    }
    try {
      const price = await scrapeFromStore(store, product);
      result[store] = price;
    } catch (err) {
      result[store] = "⚠️ Erro";
    }
  }

  return result;
        }
