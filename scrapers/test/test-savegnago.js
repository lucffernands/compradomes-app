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

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Captura todos os nomes + preços
    const products = await page.$$eval(".vtex-product-summary-2-x-container", nodes =>
      nodes.map(n => {
        const name = n.querySelector(".vtex-store-components-3-x-productNameContainer")?.textContent.trim();
        const price = n.querySelector(".savegnagoio-store-theme-15-x-priceUnit")?.textContent.trim();
        return { name, price };
      })
    );

    // Filtra apenas os que têm "kg" no nome
    const kgProducts = products.filter(p => p.name && p.name.toLowerCase().includes("kg"));

    if (kgProducts.length > 0) {
      console.log("✅ Produtos por KG encontrados:");
      kgProducts.forEach(p => console.log(`- ${p.name}: ${p.price}`));
    } else {
      console.log("❌ Nenhum produto por KG encontrado.");
    }
  } catch (err) {
    console.error("❌ Erro ao buscar preço Savegnago:", err);
  } finally {
    await browser.close();
    console.log("✅ Teste finalizado");
  }
}

// Executa
testSavegnago("bacon");
