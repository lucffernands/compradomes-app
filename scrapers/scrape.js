// scrapers/scrape.js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// ⚠️ Caminhos ajustados para apontar para a raiz do projeto
const DATA_PATH = path.resolve('../data/prices.json');
const STORES_HTML = path.resolve('../site/fragments/stores_hortolandia.html');

// Função para ler mercados do HTML
function getStores() {
  const html = fs.readFileSync(STORES_HTML, 'utf-8');
  const dom = new JSDOM(html);
  const options = [...dom.window.document.querySelectorAll('select option')];
  return options.map(opt => opt.value).filter(v => v.trim() !== '');
}

// Função para criar o arquivo JSON vazio, se não existir
function ensureDataFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(
      DATA_PATH,
      JSON.stringify({ updated_at: null, stores: [], products: {} }, null, 2)
    );
  }
}

// Função para buscar preços de um produto em todos os mercados
async function scrapeProduct(productQuery) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const stores = getStores();
  const productPrices = {};

  for (const store of stores) {
    const page = await browser.newPage();
    const url = `https://www.${store.toLowerCase()}.com.br/hortolandia/busca?q=${encodeURIComponent(
      productQuery
    )}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle0' });
      const priceText = await page.$eval('.price', el => el.textContent.trim());
      const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
      productPrices[store] = price;
    } catch (err) {
      console.log(`❌ Produto não encontrado em ${store}`);
      productPrices[store] = null;
    }
    await page.close();
  }

  await browser.close();
  return productPrices;
}

// Função principal
async function main() {
  try {
    ensureDataFile();
    const product =
      process.argv.find(arg => arg.startsWith('--product='))?.split('=')[1] || 'Bacon';

    console.log(`🔎 Buscando preços para: ${product}`);
    const prices = await scrapeProduct(product);

    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    data.updated_at = new Date().toISOString();
    if (!data.stores || data.stores.length === 0) data.stores = getStores();
    if (!data.products) data.products = {};
    data.products[product] = prices;

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log('✅ Preços salvos em data/prices.json');
  } catch (err) {
    console.error('❌ Erro no scraper:', err);
    process.exit(1);
  }
}

// Executa
main();
