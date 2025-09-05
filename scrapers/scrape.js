// scrapers/test/test-savegnago.js
import puppeteer from "puppeteer";

// 👉 Função para extrair quantidade do nome do produto
function extractQuantity(name) {
  const lower = name.toLowerCase();

  // gramas -> converte para kg
  let match = lower.match(/(\d+(?:[.,]\d+)?)\s*g/);
  if (match) {
    return parseFloat(match[1].replace(",", ".")) / 1000;
  }

  // quilos
  match = lower.match(/(\d+(?:[.,]\d+)?)\s*kg/);
  if (match) {
    return parseFloat(match[1].replace(",", "."));
  }

  // mililitros -> converte para litros
  match = lower.match(/(\d+(?:[.,]\d+)?)\s*ml/);
  if (match) {
    return parseFloat(match[1].replace(",", ".")) / 1000;
  }

  // litros
  match = lower.match(/(\d+(?:[.,]\d+)?)\s*l/);
  if (match) {
    return parseFloat(match[1].replace(",", "."));
  }

  return null; // nada encontrado
}

async function testSavegnago(productQuery = "bacon") {
  console.log(`🔎 Testando Savegnago para: ${productQuery}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const url = `https://www.savegnago.com.br/${productQuery}?_q=${encodeURIComponent(
    productQuery
  )}&map=ft`;

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const products = await page.$$eval(
      ".vtex-product-summary-2-x-container",
      (nodes) =>
        nodes.map((n) => {
          const name = n.querySelector(
            ".vtex-product-summary-2-x-productBrand"
          )?.textContent;
          const price = n.querySelector(
            ".savegnagoio-store-theme-15-x-priceUnit"
          )?.textContent;
          return { name, price };
        })
    );

    const processed = [];
    for (const p of products) {
      if (!p.name || !p.price) continue;

      const qty = extractQuantity(p.name);
      if (!qty) continue; // pula produtos sem peso/volume

      const price = parseFloat(
        p.price.replace(/[^\d,]/g, "").replace(",", ".")
      );
      if (isNaN(price)) continue;

      const unitPrice = price / qty; // preço por kg ou litro
      processed.push({ ...p, qty, unitPrice });
    }

    if (processed.length === 0) {
      console.log("❌ Nenhum produto válido encontrado com peso/volume.");
    } else {
      // pega só os 3 primeiros
      const top3 = processed.slice(0, 3);
      console.log(
        "📦 Produtos encontrados (primeiros 3):",
        top3.map(
          (p) =>
            `${p.name} - ${p.price} (${p.qty}kg/L → R$ ${p.unitPrice.toFixed(2)})`
        )
      );

      const cheapest = top3.reduce((min, p) =>
        p.unitPrice < min.unitPrice ? p : min
      );
      console.log(
        `✅ Produto mais barato (por kg/litro): ${cheapest.name} → R$ ${cheapest.unitPrice.toFixed(
          2
        )}`
      );
    }
  } catch (err) {
    console.error("❌ Erro ao buscar preço Savegnago:", err);
  } finally {
    await browser.close();
    console.log("✅ Teste finalizado");
  }
}

// executa
testSavegnago();
