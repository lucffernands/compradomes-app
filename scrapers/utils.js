import fs from "fs";
import path from "path";
import { chromium } from "playwright";

// converte preço brasileiro (ex: "R$ 10,99") em número
export function parsePriceBR(txt) {
  if (!txt) return null;
  const digits = txt.replace(/[^0-9,]/g, "").replace(",", ".");
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

// caminho para o JSON com configurações de lojas
const storesPath = path.resolve("./data/stores.json");

// carrega lojas suportadas
function loadStores() {
  if (fs.existsSync(storesPath)) {
    return JSON.parse(fs.readFileSync(storesPath, "utf-8"));
  }
  return {};
}

// função que faz scraping de um produto em uma loja
async function scrapeFromStore(storeConfig, product) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `${storeConfig.baseUrl}${encodeURIComponent(product)}`;

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // espera o primeiro card aparecer ou timeout
    await page.waitForSelector(storeConfig.selectors.card, { timeout: 5000 }).catch(() => null);

    const cards = await page.$$(storeConfig.selectors.card);

    if (cards.length === 0) {
      return null; // produto não encontrado
    }

    const firstCard = cards[0];

    const title = await firstCard.$eval(storeConfig.selectors.title, el => el.textContent.trim()).catch(() => null);
    const price = await firstCard.$eval(storeConfig.selectors.price, el => el.textContent.trim()).catch(() => null);
    const link = await firstCard.$eval(storeConfig.selectors.link, el => el.href).catch(() => url);

    return price ? `R$ ${parsePriceBR(price).toFixed(2)}` : null;
  } finally {
    await browser.close();
  }
}

// função principal: busca preços de múltiplos produtos em múltiplas lojas
export async function getPrices(products, stores) {
  const availableStores = loadStores(); // JSON com as configs
  const result = {};

  // percorre cada produto
  await Promise.all(products.map(async (product) => {
    const storeResults = {};

    // busca em todas as lojas em paralelo
    await Promise.all(stores.map(async (store) => {
      const storeConfig = availableStores[store];
      if (!storeConfig) {
        storeResults[store] = "❌ Não suportado";
        return;
      }

      try {
        const price = await scrapeFromStore(storeConfig, product);
        storeResults[store] = price || "⚠️ Produto não encontrado";
      } catch (err) {
        console.error(`Erro ao buscar ${product} em ${store}:`, err);
        storeResults[store] = "⚠️ Erro";
      }
    }));

    result[product] = storeResults;
  }));

  return result;
}
