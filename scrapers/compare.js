// scrapers/compare.js
import fs from 'fs';
import path from 'path';

const pricesPath = path.resolve('..', 'data', 'prices.json');
const DEBUG = true; // 🔧 troque para false quando não quiser logar o JSON inteiro

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function compareMarkets(pricesData) {
  const marketsArray = Array.isArray(pricesData)
    ? pricesData
    : Object.values(pricesData);

  const validMarkets = marketsArray.filter(
    m => m && Array.isArray(m.products) && m.products.length > 0
  );

  const marketTotals = validMarkets.map(market => {
    const total = market.products.reduce((sum, p) => sum + (p.price || 0), 0);
    const count = market.products.length;
    return { market: market.market || 'Desconhecido', total, count };
  });

  marketTotals.sort((a, b) => a.total - b.total);

  return marketTotals.slice(0, 2);
}

(async () => {
  try {
    const pricesData = loadJSON(pricesPath);

    if (DEBUG) {
      console.log('📝 Conteúdo bruto do prices.json:');
      console.log(JSON.stringify(pricesData, null, 2));
    }

    const topMarkets = compareMarkets(pricesData);

    if (topMarkets.length === 0) {
      console.log('⚠️ Nenhum mercado válido encontrado no prices.json');
      process.exit(0);
    }

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
