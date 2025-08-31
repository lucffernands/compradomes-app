const fs = require("fs");
const path = require("path");

// Exemplo de produtos que você quer buscar
const products = ["cebola", "tomate", "batata", "alface", "leite", "café"];

// Exemplo de supermercados que o scraper consegue consultar
const possibleStores = ["Extra", "Pão de Açúcar", "Carrefour", "MercadoX"];

// Função simulada que "busca" o preço do produto em cada supermercado
// Substitua com o scraping real de cada site
async function fetchPrice(product, store) {
  // Retorna um valor aleatório só para teste
  return parseFloat((Math.random() * 10 + 1).toFixed(2));
}

(async () => {
  const prices = { products: {} };

  for (const product of products) {
    prices.products[product] = {};

    for (const store of possibleStores) {
      const price = await fetchPrice(product, store);
      if (price != null) {
        prices.products[product][store] = { price };
      }
    }
  }

  const outputPath = path.join(__dirname, "../site/prices.json");
  fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2));
  console.log("prices.json gerado com sucesso!");
})();
