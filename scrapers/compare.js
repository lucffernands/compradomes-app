// compare.js
import fs from "fs";
import path from "path";

// Caminho para os arquivos de dados
const dataDir = path.resolve("data");
const pricesFile = path.join(dataDir, "prices.json");
const storesFile = path.join(dataDir, "stores.json");

// Função utilitária: carrega JSON
function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

// Carrega dados
const prices = loadJSON(pricesFile); // [{ storeId, product, price }]
const stores = loadJSON(storesFile); // [{ id, name }]

// Organiza preços por produto
const productsMap = {};
for (const entry of prices) {
  if (!productsMap[entry.product]) {
    productsMap[entry.product] = [];
  }
  productsMap[entry.product].push({
    storeId: entry.storeId,
    price: entry.price,
  });
}

// Calcula comparações
const storeTotals = {};
const cheapestChoices = [];

for (const [product, options] of Object.entries(productsMap)) {
  // Ordena preços do produto
  const sorted = options.sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];

  cheapestChoices.push({
    product,
    storeId: cheapest.storeId,
    price: cheapest.price,
  });

  // Soma no total do mercado
  if (!storeTotals[cheapest.storeId]) {
    storeTotals[cheapest.storeId] = 0;
  }
  storeTotals[cheapest.storeId] += cheapest.price;
}

// Ordena mercados pelo total
const rankedStores = Object.entries(storeTotals)
  .map(([storeId, total]) => ({
    storeId,
    name: stores.find((s) => s.id === storeId)?.name || storeId,
    total,
  }))
  .sort((a, b) => a.total - b.total);

// Mostra resultados
console.log("=== Produtos mais baratos por mercado ===");
for (const choice of cheapestChoices) {
  const storeName =
    stores.find((s) => s.id === choice.storeId)?.name || choice.storeId;
  console.log(
    `🛒 ${choice.product} → ${storeName} (R$ ${choice.price.toFixed(2)})`
  );
}

console.log("\n=== Ranking de mercados (carrinho total) ===");
for (const [i, store] of rankedStores.entries()) {
  console.log(
    `${i + 1}. ${store.name} → Total: R$ ${store.total.toFixed(2)}`
  );
      }
