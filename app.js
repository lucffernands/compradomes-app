// site/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { scrapeGoodBom } from "../scrapers/scrape.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir frontend
app.use(express.static(path.join(__dirname)));

// Rota da API
app.get("/api/scrape", async (req, res) => {
  const { products } = req.query;
  if (!products) return res.status(400).json({ error: "Parâmetro 'products' é obrigatório" });

  const productList = products.split(",");
  try {
    const result = await scrapeGoodBom(productList);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicia servidor
app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));
