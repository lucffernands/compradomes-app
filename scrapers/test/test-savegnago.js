// scrapers/test/test-savegnago.js
import puppeteer from 'puppeteer';

const SEARCH_URL = 'https://www.savegnago.com.br/';

function parseWeight(name) {
  // Procura por kg, g, l ou ml
  const regex = /([\d,.]+)\s*(kg|g|l|ml)/i;
  const match = name.match(regex);
  if (!match) return null;

  let [_, amount, unit] = match;
  amount = parseFloat(amount.replace(',', '.'));

  // Converte tudo para kg ou L
  if (/g/i.test(unit)) return amount / 1000; // gramas para kg
  if (/kg/i.test(unit)) return amount;
  if (/ml/i.test(unit)) return amount / 1000; // ml para L
  if (/l/i.test(unit)) return amount;

  return null;
}

async function testSavegnago(productQuery) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const searchUrl = `${SEARCH_URL}${productQuery}?_q=${encodeURIComponent(productQuery)}&map=ft`;

  try {
    console.log(`🔎 Testando Savegnago para: ${productQuery}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 60000 });

    // Captura nome e preço
    const products = await page.$$eval('.vtex-product-summary-2-x-productBrand', (names, prices) => {
      return names.map((el, i) => {
        const priceEl = el.closest('.vtex-flex-layout-0-x-flexCol')?.querySelector('.savegnagoio-store-theme-15-x-priceUnit');
        return {
          name: el.textContent.trim(),
          priceText: priceEl ? priceEl.textContent.trim() : null
        };
      });
    });

    // Filtra produtos válidos com peso/volume
    const validProducts = products
      .map(p => {
        const weight = parseWeight(p.name);
        if (!weight || !p.priceText) return null;

        const price = parseFloat(p.priceText.replace(/[^\d,]/g, '').replace(',', '.'));
        return { ...p, weight, pricePerKg: price / weight };
      })
      .filter(Boolean)
      .slice(0, 3); // primeiros 3 produtos

    if (!validProducts.length) {
      console.log('❌ Nenhum produto válido encontrado com peso/volume.');
    } else {
      console.log('Produtos encontrados (primeiros 3):', validProducts.map(p => p.pricePerKg));
      const cheapest = validProducts.reduce((prev, curr) => (curr.pricePerKg < prev.pricePerKg ? curr : prev));
      console.log('✅ Produto mais barato (por kg/litro):', cheapest.pricePerKg);
    }
  } catch (err) {
    console.error('❌ Erro ao buscar preço Savegnago:', err.message);
  } finally {
    await browser.close();
    console.log('✅ Teste finalizado');
  }
}

// Executa
const product = process.argv[2] || 'bacon';
testSavegnago(product);
