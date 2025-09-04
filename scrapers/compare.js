// scrapers/compare.js

const fs = require("fs");
const path = require("path");

function compareMarkets(allStores) {
  const allProducts = [...new Set(allStores.flatMap(s => s.products.map(p => p.name)))];

  let cheapestPerProduct = [];
  let totalsPerStore = {};

  for (const product of allProducts) {
    let cheapest = null;

    for (const store of allStores) {
      const item = store.products.find(p => p.name === product);
      if (item) {
        if (!cheapest || item.price < cheapest.price) {
          cheapest = { store: store.store, name: product, price: item.price };
        }
        totalsPerStore[store.store] = (totalsPerStore[store.store] || 0) + item.price;
      }
    }

    if (cheapest) cheapestPerProduct.push(cheapest);
  }

  const sortedTotals = Object.entries(totalsPerStore)
    .map(([store, total]) => ({ store, total }))
    .sort((a, b) => a.total - b.total);

  return {
    cheapestPerProduct,
    totalsPerStore: sortedTotals,
    bestTwoStores: sortedTotals.slice(0, 2)
  };
}

// 🚀 Executa direto se rodar `node compare.js`
if (require.main === module) {
  const inputPath = path.join(__dirname, "../data/prices.json");
  const outputPath = path.join(__dirname, "../data/result.json");

  if (!fs.existsSync(inputPath)) {
    console.error("❌ Arquivo prices.json não encontrado!");
    process.exit(1);
  }

  const prices = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const result = compareMarkets(prices);

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`✅ Comparação concluída! Arquivo salvo em ${outputPath}`);
}

module.exports = { compareMarkets };
