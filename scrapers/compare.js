// scrapers/compare.js
import fs from 'fs';
import path from 'path';

// Caminho correto para o data/prices.json
const pricesPath = path.resolve('..', 'data', 'prices.json');

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function compareMarkets(pricesData) {
  // pricesData esperado no formato:
  // { market: 'Mercado X', products: [ { name: '', price: 0 } ] }
  const marketTotals = pricesData.map(market => {
    const total = market.products.reduce((sum, p) => sum + p.price, 0);
    const count = market.products.length;
    return { market: market.market, total, count };
  });

  // Ordena do menor total para o maior
  marketTotals.sort((a, b) => a.total - b.total);

  // Pega os dois mais baratos
  return marketTotals.slice(0, 2);
}

(async () => {
  try {
    const pricesData = loadJSON(pricesPath);
    const topMarkets = compareMarkets(pricesData);

    console.log('🏆 Top 2 mercados mais baratos:');
    topMarkets.forEach((m, i) => {
      console.log(`${i + 1}. ${m.market}`);
      console.log(`   Total gasto: R$ ${m.total.toFixed(2)}`);
      console.log(`   Produtos encontrados: ${m.count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao comparar mercados:', err);
    process.exit(1);
  }
})();
