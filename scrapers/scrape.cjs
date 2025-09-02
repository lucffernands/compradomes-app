import { getPrices } from "./utils.js";

// capturar argumentos da linha de comando
const args = process.argv.slice(2);
let productsArg = "";
let storesArg = "";

args.forEach(arg => {
  if (arg.startsWith("--products=")) {
    productsArg = arg.replace("--products=", "");
  }
  if (arg.startsWith("--stores=")) {
    storesArg = arg.replace("--stores=", "");
  }
});

if (!productsArg || !storesArg) {
  console.error("Erro: --products e --stores são obrigatórios");
  process.exit(1);
}

// transformar em array
const products = productsArg.split(",").map(p => p.trim());
const stores = storesArg.split(",").map(s => s.trim());

// função principal do scraper (da utils.js)
(async () => {
  try {
    const result = {};
    for (const product of products) {
      result[product] = await getPrices(product, stores);
    }
    console.log(JSON.stringify(result));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
