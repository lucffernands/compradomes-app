// scrapers/test/test-savegnago.js
import puppeteer from 'puppeteer';

const PRODUCT = process.argv[2] || 'bacon';

function parseWeight(name) {
  // Procura kg, g, l, ml
  const regex = /(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml)/i;
  const match = name.match(regex);
  if (!match) return null;
  let [_, value, unit] = match;
  value = parseFloat(value.replace(',', '.'));
  if (unit.toLowerCase() === 'g') value = value / 1000; // g → kg
  if (unit.toLowerCase() === 'ml') value = value / 1000; // ml → litro
  return { value, unit: unit.toLowerCase() };
}

async function testSavegnago(product) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // User-agent real para evitar bloqueio
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.90 Safari/537.36'
  );

  const searchUrl = `https://www.savegnago.com.br/${product}?_q=${product}&map=ft`;
  console.log(`🔎 Testando Savegnago para: ${product}`);

  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 120000 });
    await page.waitForSelector('.vtex-store-components-3-x-productBrand, .savegnagoio-store-theme-15-x-priceUnit', { timeout: 60000 });

    const products = await page.$$eval(
      'div.vtex-flex-layout-0-x-flexRowContent .vtex-store-components-3-x-productBrand, .savegnagoio-store-theme-15-x-priceUnit',
      nodes => nodes.map(n => n.textContent.trim())
    );

    // Produtos em pares [nome, preço]
    const paired = [];
    for (let i = 0; i < products.length; i += 2) {
      if (products[i + 1]) paired.push([products[i], products[i + 1]]);
    }

    // Filtra e converte preços por kg/l
    const validProducts = paired
      .map(([name, priceText]) => {
        const weight = parseWeight(name);
        if (!weight) return null;
        const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
        const pricePerUnit = price / weight.value;
        return { name, price, weight, pricePerUnit };
      })
      .filter(Boolean)
      .slice(0, 3); // pegar 3 primeiros válidos

    if (validProducts.length === 0) {
      console.log('❌ Nenhum produto válido encontrado com peso/volume.');
    } else {
      console.log('Produtos encontrados (primeiros 3):', validProducts.map(p => p.price));
      const cheapest = validProducts.reduce((prev, curr) => (curr.pricePerUnit < prev.pricePerUnit ? curr : prev));
      console.log('✅ Produto mais barato (por kg/litro):', cheapest.price, `→ ${cheapest.name}`);
    }
  } catch (err) {
    console.log('❌ Erro ao buscar preço Savegnago:', err.message);
  }

  await browser.close();
  console.log('✅ Teste finalizado');
}

// Executa
testSavegnago(PRODUCT);
