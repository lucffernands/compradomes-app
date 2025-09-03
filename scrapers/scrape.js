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
// Exemplo de query: /api/scrape?products=CARNE MOÍDA,PICANHA&stores=GoodBom,Savegnago
app.get("/api/scrape", async (req, res) => {
  const { products, stores } = req.query;

  if (!products || !stores) {
    return res.status(400).json({ error: "Parâmetros obrigatórios: products e stores" });
  }

  // transforma as listas em arrays limpos
  const productList = products.split(",").map(p => p.trim()).filter(Boolean);
  const storeList = stores.split(",").map(s => s.trim()).filter(Boolean);

  try {
    const results = await getPrices(productList, storeList);
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar preços:", err);
    res.status(500).json({ error: "Erro interno ao buscar preços" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Scraper rodando em http://localhost:${PORT}`);
});
