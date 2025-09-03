import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getPrices } from "./utils.js";

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir a pasta site como arquivos estáticos
app.use(express.static(path.join(__dirname, "../site")));

// Rota da API para buscar preços
app.get("/api/scrape", async (req, res) => {
  const { products, stores } = req.query;

  if (!products || !stores) {
    return res.status(400).json({ error: "Parâmetros obrigatórios: products e stores" });
  }

  const productList = products.split(",").map(p => p.trim());
  const storeList = stores.split(",").map(s => s.trim());
  const results = {};

  for (const product of productList) {
    try {
      results[product] = await getPrices(product, storeList);
    } catch (err) {
      console.error(`Erro ao buscar preços do produto "${product}":`, err);
      results[product] = storeList.reduce((acc, store) => {
        acc[store] = "⚠️ Erro";
        return acc;
      }, {});
    }
  }

  res.json(results);
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`✅ Scraper rodando em http://localhost:${PORT}`);
});
