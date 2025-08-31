const fs = require("fs");
const path = require("path");

// Cria um JSON genérico vazio para que o front-end funcione
const prices = { products: {} };

const outputPath = path.join(__dirname, "../site/prices.json");
fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2));
console.log("prices.json genérico criado para teste no front-end!");
