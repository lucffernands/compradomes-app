import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { chromium } from 'playwright';
import { parsePriceBR } from './utils.js';

const ROOT = path.resolve(process.cwd(), '..');
const SKU_CSV = path.join(ROOT, 'data', 'sku_map.csv');
const STORES_JSON = path.join(ROOT, 'data', 'stores.json');
const OUT_JSON = path.join(ROOT, 'data', 'prices.json');

async function loadSkuMap() {
  const csv = await fs.readFile(SKU_CSV, 'utf8');
  const rows = parse(csv, { columns: true, delimiter: ';', skip_empty_lines: true, trim: true });
  return rows.map(r => ({
    canonical_name: r.canonical_name,
    unit: r.unit,
    query: r.query
  }));
}

async function loadStores() {
  const json = await fs.readFile(STORES_JSON, 'utf8');
  return JSON.parse(json);
}

async function fetchPricesForStore(items, storeKey, storeConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  for (const item of items) {
    await page.goto(`${storeConfig.baseUrl}${encodeURIComponent(item.query)}`, { waitUntil: 'domcontentloaded' });

    const product = await page.locator(storeConfig.selectors.card).first();
    const name = (await product.locator(storeConfig.selectors.title).textContent())?.trim();
    const priceText = (await product.locator(storeConfig.selectors.price).textContent())?.trim();
    const url = await product.locator(storeConfig.selectors.link).first().getAttribute('href');

    const price = parsePriceBR(priceText);

    if (price && name) {
      results.push({
        canonical_name: item.canonical_name,
        unit: item.unit,
        store: storeKey,
        name,
        price,
        url: url?.startsWith('http') ? url : storeConfig.baseUrl + url
      });
    }
  }

  await browser.close();
  return results;
}

async function main() {
  const items = await loadSkuMap();
  const stores = await loadStores();
  const allResults = [];

  for (const [storeKey, storeConfig] of Object.entries(stores)) {
    const storeResults = await fetchPricesForStore(items, storeKey, storeConfig).catch(() => []);
    allResults.push(...storeResults);
  }

  const index = {};
  for (const it of allResults) {
    if (!index[it.canonical_name]) index[it.canonical_name] = {};
    index[it.canonical_name][it.store] = it;
  }

  const out = {
    updated_at: new Date().toISOString(),
    stores: Object.keys(stores),
    products: index
  };

  await fs.writeFile(OUT_JSON, JSON.stringify(out, null, 2));
  console.log('Saved', OUT_JSON);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
