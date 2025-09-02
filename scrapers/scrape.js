import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getPrices } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Servir arquivos estáticos da pasta site
app.use(express.static(path.join(__dirname, "../site")));

// Rota API de scraping
app.get("/api/scrape", async (req, res) => {
  const { products, stores } = req.query;

  if (!products || !stores) {
    return res.status(400).json({ error: "Parâmetros obrigatórios: products e stores" });
  }

  const productList = products.split(",").map(p => p.trim());
  const storeList = stores.split(",").map(s => s.trim());

  const results = {};
  for (const product of productList) {
    results[product] = await getPrices(product, storeList);
  }

  res.json(results);
});

// Rota principal para abrir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../site/index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Scraper rodando em http://localhost:${PORT}`);
});
