// scrapers/compare.js
import fs from 'fs';
import path from 'path';

// Caminhos
const pricesPath = path.resolve('data/prices.json');
const outputPath = path.resolve('site/data/compare.json');

// Carrega os preços
let pricesData;
try {
  const raw = fs.readFileSync(pricesPath, 'utf-8');
  pricesData = JSON.parse(raw);
} catch (err) {
  console.error('❌ Erro ao ler prices.json:', err);
  process.exit(1);
}

// Verifica se há dados
if (!pricesData.stores || pricesData.stores.length === 0) {
  console.warn('⚠️ Nenhum mercado válido encontrado no prices.json');
  fs.writeFileSync(outputPath, JSON.stringify({ topStores: [], totalProducts: 0 }, null, 2));
  process.exit(0);
}

// Calcula o total de preços por mercado
const storeTotals = pricesData.stores.map(store => {
  const total = Object.values(store.products || {}).reduce((sum, p) => sum + (p.price || 0), 0);
  const count = Object.keys(store.products || {}).length;
  return { name: store.name, total, count };
});

// Ordena pelo total (do menor para o maior)
storeTotals.sort((a, b) => a.total - b.total);

// Pega os dois melhores mercados
const topStores = storeTotals.slice(0, 2);

console.log('🛒 Top 2 mercados mais baratos:', topStores);

// Salva no JSON final para o site
fs.writeFileSync(outputPath, JSON.stringify({ topStores, totalProducts: pricesData.products ? Object.keys(pricesData.products).length : 0 }, null, 2));

console.log('✅ compare.json gerado com sucesso!');
