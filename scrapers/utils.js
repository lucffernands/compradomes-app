import fs from "fs";
import path from "path";
import { chromium } from "playwright";

// --- Função para converter preço BR em número ---
export function parsePriceBR(txt) {
  if (!txt) return null;
  const digits = txt.replace(/[^0-9,]/g, "").replace(",", ".");
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

// --- Caminho para o JSON com lojas ---
const storesPath = path.resolve("./data/stores.json");

// --- Carrega lojas suportadas ---
function loadStores() {
  if (fs.existsSync(storesPath)) {
    return JSON.parse(fs.readFileSync(storesPath, "utf-8"));
  }
  return {};
}

// --- Normaliza nomes de loja (remove acentos, minúsculas) ---
function normalizeStoreName(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// --- Função que faz scraping de um produto em uma loja ---
async function scrapeFromStore(storeConfig, product) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `${storeConfig.baseUrl}${encodeURIComponent(product)}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // espera simples de 2s para garantir que a página carregou
  await page.waitForTimeout(2000);

  const cards = await page.$$(storeConfig.selectors.card);

  if (cards.length === 0) {
    await browser.close();
    return null; // produto não encontrado
  }

  const firstCard = cards[0];

  const title = await firstCard.$eval(storeConfig.selectors.title, el => el.textContent.trim()).catch(() => null);
  const price = await firstCard.$eval(storeConfig.selectors.price, el => el.textContent.trim()).catch(() => null);
  const link = await firstCard.$eval(storeConfig.selectors.link, el => el.href).catch(() => url);

  await browser.close();

  return price ? `R$ ${parsePriceBR(price).toFixed(2)}` : null;
}

// --- Função principal chamada pelo servidor ---
export async function getPrices(product, stores) {
  const availableStores = loadStores();

  // cria mapa normalizado -> config
  const normalizedStores = {};
  for (const key of Object.keys(availableStores)) {
    normalizedStores[normalizeStoreName(key)] = availableStores[key];
  }

  const result = {};

  for (const store of stores) {
    const storeConfig = normalizedStores[normalizeStoreName(store)];
    if (!storeConfig) {
      result[store] = "❌ Não suportado";
      continue;
    }

    try {
      const price = await scrapeFromStore(storeConfig, product);
      result[store] = price || "⚠️ Produto não encontrado";
    } catch (err) {
      console.error(`Erro ao buscar ${product} em ${store}:`, err);
      result[store] = "⚠️ Erro";
    }
  }

  return result;
}
