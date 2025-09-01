import fs from "fs";
import path from "path";

const dataPath = path.resolve("./data");
const pricesFile = path.join(dataPath, "prices.json");
const skuFile = path.join(dataPath, "sku_map.csv");
const storesFile = path.join(dataPath, "stores.json");

function loadData(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function getPrice(product, store, prices) {
  if (prices[store] && prices[store][product]) {
    return prices[store][product];
  }
  return "Não disponível";
}

function main(products, stores) {
  const prices = loadData(pricesFile);
  const storeList = loadData(storesFile);

  const results = {};
  for (const product of products) {
    results[product] = {};
    for (const store of stores) {
      if (storeList.includes(store)) {
        results[product][store] = getPrice(product, store, prices);
      }
    }
  }
  fs.writeFileSync(path.join(dataPath, "results.json"), JSON.stringify(results, null, 2));
  console.log("Scrape finalizado. Arquivo results.json atualizado.");
}

const args = process.argv.slice(2);
const productsArg = args.find(a => a.startsWith("--products="));
const storesArg = args.find(a => a.startsWith("--stores="));

const products = productsArg ? productsArg.replace("--products=", "").split(",") : [];
const stores = storesArg ? storesArg.replace("--stores=", "").split(",") : [];

main(products, stores);
