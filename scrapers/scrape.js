import express from "express";
import { getPrices } from "./utils.js";

const app = express();
const PORT = process.env.PORT || 3001;

// rota principal de scraping
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

app.listen(PORT, () => {
  console.log(`✅ Scraper rodando em http://localhost:${PORT}`);
});
