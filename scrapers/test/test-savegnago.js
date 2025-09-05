// scrapers/test/test-savegnago.js
import puppeteer from "puppeteer";

async function testSavegnago(productQuery) {
  console.log(`🔎 Testando Savegnago para: ${productQuery}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const url = `https://www.savegnago.com.br/${encodeURIComponent(productQuery)}?_q=${encodeURIComponent(productQuery)}&map=ft`;

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Captura nome + preço
  const products = await page.$$eval(".vtex-product-summary-2-x-element", nodes =>
    nodes.slice(0, 5).map(n => {
      const nameEl = n.querySelector(".vtex-product-summary-2-x-productBrand");
      const priceEl = n.querySelector(".savegnagoio-store-theme-15-x-priceUnit");
      return {
        name: nameEl ? nameEl.textContent.trim() : "Sem nome",
        priceText: priceEl ? priceEl.textContent.trim() : null,
      };
    })
  );

  await browser.close();

  // Regex para extrair peso/volume
  function extractQuantity(name) {
    const match = name.match(/(\d+)\s?(g|kg|ml|l)/i);
    if (!match) return null;

    let value = parseFloat(match[1].replace(",", "."));
    let unit = match[2].toLowerCase();

    if (unit === "g") value = value / 1000; // gramas → kg
    if (unit === "kg") value = value;       // já em kg
    if (unit === "ml") value = value / 1000; // ml → L
    if (unit === "l") value = value;         // já em L

    return value; // em kg ou L
  }

  // Processa produtos
  const processed = products
    .filter(p => p.priceText)
    .map(p => {
      const price = parseFloat(p.priceText.replace(/[^\d,]/g, "").replace(",", "."));
      const qty = extractQuantity(p.name);
      const unitPrice = qty ? price / qty : null;
      return { ...p, price, qty, unitPrice };
    });

  // Pega até 3 produtos com preço válido
  const top3 = processed.filter(p => p.unitPrice).slice(0, 3);

  if (top3.length === 0) {
    console.log("❌ Nenhum produto válido encontrado com peso/volume.");
    return;
  }

  console.log("🛒 Produtos encontrados:");
  top3.forEach(p => {
    console.log(`- ${p.name} | Preço: R$ ${p.price.toFixed(2)} | ${p.qty} kg/L | R$ ${(p.unitPrice).toFixed(2)} por kg/L`);
  });

  const cheapest = top3.reduce((a, b) => (a.unitPrice < b.unitPrice ? a : b));
  console.log(`✅ Mais barato: ${cheapest.name} → R$ ${cheapest.unitPrice.toFixed(2)} por kg/L`);
}

// Teste rápido
testSavegnago("bacon").then(() => console.log("✅ Teste finalizado"));
