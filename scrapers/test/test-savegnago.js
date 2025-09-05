// scrapers/test/test-savegnago.js
import puppeteer from "puppeteer";

async function testSavegnago() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const url = "https://www.savegnago.com.br/bacon?_q=bacon&map=ft";

  try {
    console.log("🔎 Testando Savegnago para: Bacon");

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector(
      ".savegnagoio-store-theme-15-x-priceUnit",
      { timeout: 20000 }
    );

    const priceText = await page.$eval(
      ".savegnagoio-store-theme-15-x-priceUnit",
      (el) => el.textContent.trim()
    );

    console.log(`✅ Preço encontrado: ${priceText}`);
  } catch (err) {
    console.error("❌ Erro ao buscar preço Savegnago:", err);
  } finally {
    await browser.close();
    console.log("✅ Teste finalizado");
  }
}

testSavegnago();
