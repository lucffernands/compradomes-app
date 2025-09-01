import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// servir frontend (site/)
app.use(express.static(path.join(__dirname, "site")));

// rota da API para scraping
app.get("/api/scrape", (req, res) => {
  const { products, stores } = req.query;

  if (!products || !stores) {
    return res.status(400).json({ error: "Parâmetros 'products' e 'stores' são obrigatórios" });
  }

  // chama o scrapers/scrape.cjs com Node (separado)
  const scraper = spawn("node", [
    "scrapers/scrape.cjs",
    `--products=${products}`,
    `--stores=${stores}`
  ]);

  let output = "";
  let error = "";

  scraper.stdout.on("data", (data) => {
    output += data.toString();
  });

  scraper.stderr.on("data", (data) => {
    error += data.toString();
  });

  scraper.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: error || "Erro no scraper" });
    }

    try {
      const json = JSON.parse(output);
      res.json(json);
    } catch (err) {
      res.status(500).json({ error: "Erro ao processar saída do scraper" });
    }
  });
});

// inicia servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
