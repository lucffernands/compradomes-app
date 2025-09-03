import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getPrices } from "./scrapers/utils.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// servir frontend (site/)
app.use(express.static(path.join(__dirname, "site")));

// rota da API para scraping
app.get("/api/scrape", async (req, res) => {
  const { products, stores } = req.query;

  if (!products || !stores) {
    return res
      .status(400)
      .json({ error: "Parâmetros 'products' e 'stores' são obrigatórios" });
  }

  const productList = products.split(",").map((p) => p.trim());
  const storeList = stores.split(",").map((s) => s.trim());
  const results = {};

  for (const product of productList) {
    results[product] = await getPrices(product, storeList);
  }

  res.json(results);
});

// inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
